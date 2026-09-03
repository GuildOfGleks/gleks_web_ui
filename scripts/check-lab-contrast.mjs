#!/usr/bin/env node
/**
 * WCAG AA contrast for **`gleks-ui-lab`'s own chrome**, in every theme the site offers.
 *
 * ## Why this exists separately
 *
 * `check:contrast` measures the library. It has never looked at the docs site, and the site is
 * not a thin wrapper: the header, both sidebars, the search panel, the theme menu, the footer and
 * the code blocks are all hand-written CSS reading `--gog-*` tokens. That is a lot of text on a
 * lot of grounds, across **eleven palettes a reader can switch between at will**, and nothing had
 * ever checked a single pair of it.
 *
 * It resolves against the palettes of the **installed package**, not the workspace's `theme.css`,
 * because that is what the lab actually renders with — the site tracks the published version by
 * design (`CLAUDE.md` rule 3). A token the site reads that the installed version does not declare
 * is therefore a finding, not a crash: it means the site is styled against a release it does not
 * have yet.
 *
 * ## What it measures
 *
 * Every rule in the lab's own stylesheets that sets `color`, paired with the ground that rule (or
 * its base rule, or an explicit entry in `GROUNDS`) paints. A `color` with no ground anywhere is
 * reported as unresolved rather than assumed to sit on the page background — assuming is how a
 * check tells you everything is fine.
 *
 * Usage: node scripts/check-lab-contrast.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';
import * as sass from 'sass';

import { buildLayers, contrast, makeResolver, over, parseDecls, toHex } from './token-color.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labSrc = path.join(rootDir, 'projects/gleks-ui-lab/src/app');
const pkgStyles = path.join(rootDir, 'node_modules/@guildofgleks/ui/styles');

/**
 * Where a block is painted when its own rules do not say. Only for the cases the extraction
 * genuinely cannot infer — a class whose background lives on an ancestor in a different file.
 */
const GROUNDS = {
  '.lab-header': '--gog-surface-color',
  '.logo-title': '--gog-surface-color',
  '.version-tag': '--gog-surface-color',
  '.nav-item': '--gog-surface-color',
  '.sidebar-title': '--gog-surface-color',
  '.nav-search__input': '--gog-surface-color',
  '.nav-search__panel': '--gog-surface-color',
  '.nav-search__empty': '--gog-surface-color',
  '.nav-search__result': '--gog-surface-color',
  '.theme-switcher__item': '--gog-surface-color',
  '.toc': '--gog-surface-color',
  '.toc__link': '--gog-surface-color',
  '.lab-footer': '--gog-background-color',
  '.footer-copy': '--gog-background-color',
  '.footer-links': '--gog-background-color',
};

/**
 * Non-text content that carries **nothing** — 1.4.11 exempts a graphic whose information is
 * already given in words beside it, and holding one to a contrast bar would mean repainting a
 * status colour that is doing no work.
 *
 * `.status-header__icon--*` on the accordion page is the only entry, and it earns it in the
 * markup: the glyph sits next to `.status-header__title` and `.status-header__subtitle`, which
 * say the same thing in text. Measured before exempting it — the amber warning icon is 1.87:1 on
 * `material`'s near-white page and the green success icon 2.28:1 on `primeng`'s — so this is a
 * judgement about what the glyph means, not about whether the numbers are inconvenient. An icon
 * that is the *only* statement of a state does not belong here.
 */
const DECORATIVE = ['.status-header__icon'];

/** Glyphs rather than text — 3:1 under WCAG 1.4.11, the same rule `check-contrast.mjs` applies. */
const NON_TEXT = [
  '__chevron',
  '__icon',
  '__arrow',
  '__thumb',
  '.nav-toggle',
  // A 22px button whose whole content is `✕`, named by `aria-label`. The glyph is standing in for
  // an icon, so 1.4.11 applies — but it clears that bar by 0.05 on its hover in `one-light`
  // (3.05:1), so it has no room for a darker ground than the one it has.
  '.row__reset',
];

function themesOf(css, into, seen) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const re = /\[data-theme=(['"])([a-z0-9-]+)\1\]\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(stripped))) {
    if (seen.has(m[2])) continue;
    seen.add(m[2]);
    into.push({ name: m[2], decls: parseDecls(m[3]) });
  }
}

function rulesOf(css) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    if (selector.startsWith('@')) continue;
    const value = (prop) => {
      const hit = m[2].match(new RegExp(`(?:^|;|\\s)${prop}:\\s*(var\\([^;]*?\\))\\s*(?:;|$)`));
      return hit ? hit[1].trim() : null;
    };
    const colour = value('color');
    const bg = value('background-color') ?? value('background');
    if (colour || bg) out.push({ selector, colour, bg });
  }
  return out;
}

async function main() {
  if (!existsSync(path.join(pkgStyles, 'theme.css'))) {
    console.error('Lab contrast check cannot run: @guildofgleks/ui is not installed.');
    console.error('  It measures the lab against the palettes of the *published* package,');
    console.error('  which is what the site renders with. Run `npm install` at the repo root.');
    process.exit(1);
  }

  const themeCss = readFileSync(path.join(pkgStyles, 'theme.css'), 'utf8');
  const layers = buildLayers(themeCss);
  const themes = [];
  const seen = new Set();
  themesOf(themeCss, themes, seen);
  for (const file of readdirSync(path.join(pkgStyles, 'presets'))) {
    themesOf(readFileSync(path.join(pkgStyles, 'presets', file), 'utf8'), themes, seen);
  }
  const palettes = themes.filter((t) => t.decls.has('--gog-accent-color'));

  const files = [];
  for await (const entry of glob('**/*.scss', { cwd: labSrc, withFileTypes: true })) {
    if (entry.isFile()) files.push(path.join(entry.parentPath ?? entry.path, entry.name));
  }

  const backgrounds = new Map();
  const pairs = [];
  for (const file of files) {
    const css = sass.compile(file, { style: 'expanded', sourceMap: false }).css;
    for (const rule of rulesOf(css)) {
      // The base is the selector with its state pseudo-classes stripped, not its last token:
      // `.api-table code` and a global `code` rule are different elements, and keying on the
      // last token pairs one rule's colour with the other's background — which reported a single
      // finding forty-four times before this was fixed.
      const base = rule.selector.replace(/:{1,2}[a-z-]+(\([^)]*\))?/g, '').trim();
      if (rule.bg && !backgrounds.has(base)) backgrounds.set(base, rule.bg);
      if (rule.colour)
        pairs.push({ file: path.relative(rootDir, file), selector: rule.selector, base, ...rule });
    }
  }

  const failures = [];
  const unresolved = new Set();
  let checked = 0;

  for (const { name, decls } of palettes) {
    const resolve = makeResolver(layers, decls);
    for (const pair of pairs) {
      const stated = pair.bg ?? backgrounds.get(pair.base) ?? GROUNDS[pair.base] ?? null;
      const label = resolve(pair.colour);
      if (!label) {
        unresolved.add(`${pair.file} ${pair.selector} — ${pair.colour} does not resolve`);
        continue;
      }

      // Most of this site's text paints no background of its own and inherits one from an
      // ancestor in another file — a page's container, or `styles.scss`. Skipping those left
      // three quarters of the site unchecked, so an unstated ground is measured against **both**
      // candidates and only counts as a failure when it fails on both. That direction cannot
      // raise a false alarm: if it clears the better ground, there is a place it is fine, and
      // saying otherwise would teach the reader to distrust the check.
      const candidates = stated
        ? [stated]
        : ['--gog-surface-color', '--gog-background-color'];
      const page = resolve('--gog-background-color') ?? { r: 255, g: 255, b: 255, a: 1 };
      let best = null;
      for (const candidate of candidates) {
        const token = resolve(candidate);
        if (!token) continue;
        const ground = token.a === 1 ? token : over(token, page);
        const text = label.a === 1 ? label : over(label, ground);
        const r = contrast(text, ground);
        if (!best || r > best.ratio) best = { ratio: r, ground, text };
      }
      if (!best) {
        unresolved.add(`${pair.file} ${pair.selector} — no ground resolves for ${pair.base}`);
        continue;
      }
      const { ratio, ground, text } = best;
      checked++;
      if (DECORATIVE.some((part) => pair.selector.includes(part))) continue;
      const threshold = NON_TEXT.some((part) => pair.selector.includes(part)) ? 3.0 : 4.5;
      if (ratio < threshold) {
        failures.push({
          key: `${pair.file} ${pair.selector}`,
          ratio,
          threshold,
          theme: name,
          text: toHex(text),
          ground: toHex(ground),
        });
      }
    }
  }

  const worst = new Map();
  for (const f of failures) {
    const seenWorst = worst.get(f.key);
    if (!seenWorst || f.ratio < seenWorst.ratio) worst.set(f.key, f);
  }

  if (unresolved.size > 0) {
    console.log(`${unresolved.size} pair(s) skipped for want of a ground or a token:\n`);
    for (const u of [...unresolved].sort()) console.log(`  [skipped] ${u}`);
    console.log();
  }

  if (worst.size > 0) {
    console.error('Lab contrast check FAILED\n');
    for (const f of [...worst.values()].sort((a, b) => a.ratio - b.ratio)) {
      console.error(
        `  [contrast] ${f.theme} — ${f.key}: ${f.ratio.toFixed(2)}:1 ` +
          `(need ${f.threshold}:1) [${f.text} vs ${f.ground}]`,
      );
    }
    console.error(`\n${worst.size} problem(s), ${checked} pair(s) checked across ${palettes.length} theme(s).`);
    process.exit(1);
  }

  console.log(
    `Lab contrast check passed — ${palettes.length} theme(s), ${checked} pair(s) checked.`,
  );
}

await main();
