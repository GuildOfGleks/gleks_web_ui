#!/usr/bin/env node
/**
 * Keeps `projects/gleks-ui-lab/public/docs/styles/theme-starter.css` honest.
 *
 * That file is served by the docs site as the thing a consumer copies wholesale, and it opens by
 * calling itself "every token the library paints with, ready to override". It was not: measured
 * 2026-09-02 it carried 714 of theme.css's 1312 tokens, with **fifteen components missing
 * outright** (autocomplete, badge, button-toggle, calendar, card, datepicker, divider, menu,
 * progressbar, radio, ripple, tabs, textarea, toggle, tooltip) and five more only partly there.
 * Nothing checked it, so it drifted a little further with every component the library gained —
 * unlike `TOKENS.md`, which has a generator and stayed current.
 *
 * Two jobs, because the file has two halves that fail differently:
 *
 * 1. **The derived layer is generated**, verbatim from theme.css, between the markers below.
 *    It is ~590 declarations of pure mechanism (`--gog-card-filled-bg: var(--gog-surface-color)`
 *    and its like) plus theme.css's own explanatory comments, which are better than anything a
 *    second hand-maintained copy would carry. Copying it by hand is what failed.
 * 2. **The head stays hand-written** — fonts, the two palettes, the character layer, structure.
 *    Its ordering is a teaching decision, not a mirror: the character layer sits right after the
 *    palette because that is the short path to a custom look, which is the opposite of where
 *    theme.css puts it. A generator would flatten that back out. So instead this script asserts
 *    **coverage** over the whole file — every `--gog-*` theme.css declares anywhere must be
 *    declared somewhere in the starter — which catches head drift without dictating head order.
 *
 * **The source is the published package, not `projects/gleks/ui/src/styles/theme.css`.** The lab
 * documents what a consumer can `npm install` today (`CLAUDE.md` rule 3), so this reads
 * `node_modules/@guildofgleks/ui/styles/theme.css`. After a release, `npm install` first, then
 * re-run this — the same order `docs/lab-after-publish.md` already asks for.
 *
 * `npm run generate:theme-starter` writes; `npm run check:theme-starter` fails if the file is
 * stale or incomplete.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themePath = path.join(rootDir, 'node_modules/@guildofgleks/ui/styles/theme.css');
const starterPath = path.join(
  rootDir,
  'projects/gleks-ui-lab/public/docs/styles/theme-starter.css',
);

const START_MARKER = '/* theme-starter:derived-start */';
const END_MARKER = '/* theme-starter:derived-end */';

const DECLARATION_RE = /^\s*(--gog-[a-zA-Z0-9-]+)\s*:/;

/** Every `--gog-*` name declared anywhere in a stylesheet, comments stripped first. */
function declaredTokens(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const names = new Set();
  for (const line of withoutComments.split(/\r?\n/)) {
    const match = DECLARATION_RE.exec(line);
    if (match) names.add(match[1]);
  }
  return names;
}

/**
 * theme.css's derived layer: the single `:root,\n[data-theme] { … }` block. Located by its
 * selector rather than by line number so a stylesheet edit upstream cannot silently shift it,
 * and the brace scan is depth-counted because the block contains `@media` nested inside it.
 */
function extractDerivedBlock(css) {
  const selector = /^:root,\s*\r?\n\[data-theme\]\s*\{/m;
  const match = selector.exec(css);
  if (!match) {
    throw new Error(
      "theme.css has no `:root,\\n[data-theme] {` block — the derived layer's selector changed.",
    );
  }

  const bodyStart = match.index + match[0].length;
  let depth = 1;
  let i = bodyStart;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  if (depth !== 0) throw new Error('theme.css derived layer has unbalanced braces.');

  return css
    .slice(bodyStart, i - 1)
    .replace(/^\r?\n/, '')
    .trimEnd();
}

function renderDerivedSection(themeCss) {
  return [
    START_MARKER,
    '/*',
    ' * ── Component tokens — every one, generated ─────────────────────────────────',
    " * Copied verbatim from the installed @guildofgleks/ui's theme.css derived layer by",
    ' * `npm run generate:theme-starter`. Do not hand-edit between the markers: run the',
    ' * script instead, or the next run reverts you. Everything here reads another token,',
    ' * so a palette or character-layer edit above already carries through — override one',
    ' * of these directly only when that one component has to differ from the rest.',
    ' *',
    ' * theme.css re-declares seventeen of these inside an `@supports (color: color-mix(…))`',
    ' * block, which is how 21.7.1 gives older browsers a flat fallback. That block is',
    ' * deliberately not mirrored here: this file is loaded after the library, so a value you',
    ' * set below wins in every browser, which is what an override file should do.',
    ' */',
    ':root,',
    '[data-theme] {',
    extractDerivedBlock(themeCss),
    '}',
    END_MARKER,
    '',
  ].join('\n');
}

/** Replaces whatever currently sits between the markers with freshly generated content. */
function replaceMarked(starter, section) {
  const start = starter.indexOf(START_MARKER);
  const end = starter.indexOf(END_MARKER);
  if (start === -1 || end === -1) {
    throw new Error(
      `theme-starter.css is missing the ${START_MARKER} / ${END_MARKER} markers — add them around the component-token block.`,
    );
  }
  return starter.slice(0, start) + section + starter.slice(end + END_MARKER.length + 1);
}

async function format(source, filepath) {
  const config = (await prettier.resolveConfig(filepath)) ?? {};
  return prettier.format(source, { ...config, filepath });
}

/** Line endings are not part of the comparison — see `generate-tokens.mjs` for the full why. */
const sameContent = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');

function writeMatchingEol(filepath, next) {
  const current = readFileSync(filepath, 'utf8');
  const crlf = current.includes('\r\n');
  writeFileSync(filepath, crlf ? next.replace(/\r?\n/g, '\r\n') : next, 'utf8');
}

export async function buildStarter() {
  const themeCss = readFileSync(themePath, 'utf8');
  const current = readFileSync(starterPath, 'utf8');
  const next = await format(replaceMarked(current, renderDerivedSection(themeCss)), starterPath);
  const themeTokens = declaredTokens(themeCss);
  const starterTokens = declaredTokens(next);
  const missing = [...themeTokens].filter((name) => !starterTokens.has(name));
  return { next, missing, themeTokenCount: themeTokens.size };
}

async function main() {
  const check = process.argv.includes('--check');
  const { next, missing, themeTokenCount } = await buildStarter();
  const stale = !sameContent(readFileSync(starterPath, 'utf8'), next);

  if (check) {
    const problems = [];
    if (stale) {
      problems.push(
        'the generated derived-layer block is out of date — run `npm run generate:theme-starter`',
      );
    }
    if (missing.length > 0) {
      problems.push(
        `${missing.length} token(s) declared in theme.css are missing from theme-starter.css, and none of them are in the generated block, so they belong in the hand-written head:\n    ${missing.join('\n    ')}`,
      );
    }
    if (problems.length > 0) {
      console.error(`theme-starter.css is not a complete mirror:\n  - ${problems.join('\n  - ')}`);
      process.exit(1);
    }
    console.log(`theme-starter.css is up to date — all ${themeTokenCount} tokens present.`);
    return;
  }

  writeMatchingEol(starterPath, next);
  console.log(
    missing.length > 0
      ? `Wrote theme-starter.css. STILL MISSING ${missing.length} token(s) from the hand-written head:\n  ${missing.join('\n  ')}`
      : `Wrote theme-starter.css — all ${themeTokenCount} tokens present.`,
  );
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
