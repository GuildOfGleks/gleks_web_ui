#!/usr/bin/env node
/**
 * WCAG AA contrast for the two apps' **own** chrome, in every theme they offer.
 *
 * ## Why this exists separately from `check-contrast.mjs`
 *
 * That script measures the library. Neither app is a thin wrapper around it: the lab's header,
 * sidebars, search panel, theme menu, footer and code blocks — and the showcase's page furniture,
 * demo cards and tables — are hand-written CSS reading `--gog-*` tokens. That is a lot of text on
 * a lot of grounds, across **eleven palettes a reader can switch between at will**, and until
 * 2026-09-03 not one pair of it had ever been measured. The first run found the lab's own sidebar
 * hover label under AA.
 *
 * ## The two apps resolve their palettes from different places, and that is the point
 *
 * `gleks-ui-lab` renders with the **published** package (`CLAUDE.md` rule 3), so it is checked
 * against `node_modules`. `ui-showcase` builds the library from the workspace, so it is checked
 * against `projects/gleks/ui/src/styles` — which is what makes it the app that can catch a
 * palette regression *before* it ships, while the lab catches one the site has to live with.
 *
 * ## What it measures
 *
 * Every rule in an app's own stylesheets that sets `color`, paired with the ground that rule (or
 * its base rule, or an explicit `GROUNDS` entry) paints. Where a rule states no ground at all —
 * most of this text, which inherits one from an ancestor in another file — it is measured against
 * the surface *and* the page background, and counts as a failure only when it fails on both. That
 * direction cannot raise a false alarm: if it clears the better ground, there is a place the text
 * is fine, and crying wolf is how a check teaches people to skip it.
 *
 * Usage: node scripts/check-app-contrast.mjs [lab|showcase]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';
import * as sass from 'sass';

import {
  appliesWhenDisabled,
  buildLayers,
  contrast,
  makeResolver,
  over,
  parseDecls,
  toHex,
} from './token-color.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  {
    key: 'lab',
    name: 'gleks-ui-lab',
    styles: 'projects/gleks-ui-lab/src/app',
    palettes: 'node_modules/@guildofgleks/ui/styles',
    missing: 'run `npm install` at the repo root — the lab is checked against the published package',
  },
  {
    key: 'showcase',
    name: 'ui-showcase',
    styles: 'projects/ui-showcase/src/app',
    palettes: 'projects/gleks/ui/src/styles',
    missing: 'the workspace library is missing its styles directory',
  },
];

/**
 * Where a block is painted when its own rules do not say and no ancestor rule in the same file
 * does either. Only for cases the extraction genuinely cannot infer.
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
 * Non-text content that carries **nothing**: 1.4.11 exempts a graphic whose information is
 * already given in words beside it, and holding one to a contrast bar would mean repainting a
 * status colour that is doing no work.
 *
 * `.status-header__icon--*` on the lab's accordion page earns it in the markup — the glyph sits
 * next to `.status-header__title` and `.status-header__subtitle`, which say the same thing in
 * text. Measured before exempting it (1.87:1 on `material`, 2.28:1 on `primeng`), so this is a
 * judgement about what the glyph means, not about whether the numbers are inconvenient. An icon
 * that is the *only* statement of a state does not belong here.
 */
const DECORATIVE = [
  // Spelled `.status-header__icon` in the lab and `.accordion-status-header__icon` in the
  // showcase, so the dot is left off deliberately — the two are the same demo.
  'status-header__icon',
];

/** Glyphs rather than text — 3:1 under WCAG 1.4.11, the same rule `check-contrast.mjs` applies. */
const NON_TEXT = [
  '__chevron',
  '__icon',
  // `.accordion-chevron__glyph` is a `+`/`−` drawn as text standing in for an icon.
  '__glyph',
  '__arrow',
  '__thumb',
  '.nav-toggle',
  // A 22px button whose whole content is `✕`, named by `aria-label`. The glyph stands in for an
  // icon, so 1.4.11 applies — but it clears that bar by 0.05 on its hover in `one-light`
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
    const body = m[2];
    // `color-mix()` as well as `var()`: a rule that mixed its colour used to fall out of the
    // extraction entirely, so the one way to make a status colour readable was also the one way
    // to take it off this check without a word. The resolver already reads the mix.
    const value = (prop) => {
      const hit = body.match(
        new RegExp(`(?:^|;|\\s)${prop}:\\s*((?:var|color-mix)\\([^;]*?\\))\\s*(?:;|$)`),
      );
      return hit ? hit[1].trim() : null;
    };
    // A rule that says `background: none` is stating that it paints nothing — which is different
    // from saying nothing at all. Without the distinction a base rule's transparency fell through
    // to its own `:hover` rule's background, and the *rest* state was then measured against the
    // hover tint: three of this check's first seven showcase findings were that, not a defect.
    const paintsNothing = new RegExp('(?:^|;|\\s)background(?:-color)?:\\s*(none|transparent)\\s*(?:;|$)').test(body);
    const colour = value('color');
    const bg = value('background-color') ?? value('background') ?? (paintsNothing ? 'none' : null);
    if (colour || bg) out.push({ selector, colour, bg });
  }
  return out;
}

async function collectPairs(stylesDir) {
  const files = [];
  for await (const entry of glob('**/*.scss', { cwd: stylesDir, withFileTypes: true })) {
    if (entry.isFile()) files.push(path.join(entry.parentPath ?? entry.path, entry.name));
  }

  const backgrounds = new Map();
  const colours = new Map();
  const pairs = [];
  const groundOnly = [];
  for (const file of files) {
    const css = sass.compile(file, { style: 'expanded', sourceMap: false }).css;
    for (const rule of rulesOf(css)) {
      // The base is the selector with its state pseudo-classes stripped, not its last token:
      // `.api-table code` and a global `code` rule are different elements, and keying on the last
      // token pairs one rule's colour with the other's background — which reported a single
      // finding forty-four times before this was fixed.
      const base = rule.selector.replace(/:{1,2}[a-z-]+(\([^)]*\))?/g, '').trim();
      const entry = { file: path.relative(rootDir, file), selector: rule.selector, base, ...rule };
      // The ground a base paints *at rest*. A state rule's ground belongs to that state: it is
      // its own pair's `bg`, or the pair built below from the rest colour. Taking whichever rule
      // came first measured `.nav-item--nested` at rest against `.nav-item:hover`'s fill.
      if (rule.bg && rule.selector === base && !backgrounds.has(base)) backgrounds.set(base, rule.bg);
      if (rule.colour && rule.selector === base && !colours.has(base)) colours.set(base, rule.colour);
      if (rule.colour) pairs.push(entry);
      else if (rule.bg && rule.bg !== 'none' && rule.selector !== base) groundOnly.push(entry);
    }
  }

  /*
   * A state rule that changes the ground and leaves the colour alone — `.version-tag:hover`
   * deepening its tint — is a new pair all the same: the rest colour, on the state's ground.
   * Only rules with a `color` used to become pairs, so this one was never measured, and a hover
   * at 3.19:1 sat behind a rest state at 3.81:1 that the check did report.
   */
  const stated = new Set(pairs.map((p) => p.selector));
  for (const rule of groundOnly) {
    if (stated.has(rule.selector)) continue;
    const colour = colours.get(rule.base) ?? colours.get(blockOf(rule.base));
    if (colour) pairs.push({ ...rule, colour, colourFrom: rule.base });
  }

  return { pairs, backgrounds };
}

/**
 * The BEM block a modifier belongs to: `.accordion-header__status--loading` →
 * `.accordion-header__status`. A modifier that recolours a label usually paints nothing of its
 * own — the tint stays on the block — so without this the loading state of a tinted pill was
 * measured against the plain surface, and passed at a ratio it never renders at (3.52:1 in
 * `light`, found by hand).
 */
function blockOf(base) {
  return base.replace(/(\.[a-z0-9_-]+?)--[a-z0-9-]+/gi, '$1');
}

function paletteS(palettesDir) {
  const themeCss = readFileSync(path.join(palettesDir, 'theme.css'), 'utf8');
  const layers = buildLayers(themeCss);
  const themes = [];
  const seen = new Set();
  themesOf(themeCss, themes, seen);
  const presets = path.join(palettesDir, 'presets');
  if (existsSync(presets)) {
    for (const file of readdirSync(presets)) {
      themesOf(readFileSync(path.join(presets, file), 'utf8'), themes, seen);
    }
  }
  return { layers, palettes: themes.filter((t) => t.decls.has('--gog-accent-color')) };
}

async function checkTarget(target) {
  const palettesDir = path.join(rootDir, target.palettes);
  if (!existsSync(path.join(palettesDir, 'theme.css'))) {
    console.error(`${target.name}: cannot run — no palettes at ${target.palettes}`);
    console.error(`  ${target.missing}`);
    return { failures: [], checked: 0, palettes: 0, fatal: true };
  }

  const { layers, palettes } = paletteS(palettesDir);
  const { pairs, backgrounds } = await collectPairs(path.join(rootDir, target.styles));

  const worst = new Map();
  const unresolved = new Set();
  let checked = 0;

  for (const { name, decls } of palettes) {
    const resolve = makeResolver(layers, decls);
    for (const pair of pairs) {
      if (DECORATIVE.some((part) => pair.selector.includes(part))) continue;
      // An inactive control — the exemption `check-contrast.mjs` applies to the library, for the
      // reason written on `appliesWhenDisabled`. It had never come up here only because the one
      // disabled rule in either app set its colour with a `color-mix()`, which was not extracted.
      if (appliesWhenDisabled(pair.selector)) continue;

      const label = resolve(pair.colour);
      if (!label) {
        unresolved.add(`${pair.file} ${pair.selector} — ${pair.colour} does not resolve`);
        continue;
      }

      const declared =
        pair.bg ??
        backgrounds.get(pair.base) ??
        GROUNDS[pair.base] ??
        backgrounds.get(blockOf(pair.base)) ??
        null;
      const stated = declared === 'none' ? null : declared;
      const candidates = stated ? [stated] : ['--gog-surface-color', '--gog-background-color'];
      const page = resolve('--gog-background-color') ?? { r: 255, g: 255, b: 255, a: 1 };
      let best = null;
      for (const candidate of candidates) {
        const token = resolve(candidate);
        if (!token) continue;
        const ground = token.a === 1 ? token : over(token, page);
        const text = label.a === 1 ? label : over(label, ground);
        const ratio = contrast(text, ground);
        if (!best || ratio > best.ratio) best = { ratio, ground, text };
      }
      if (!best) {
        unresolved.add(`${pair.file} ${pair.selector} — no ground resolves for ${pair.base}`);
        continue;
      }

      checked++;
      const threshold = NON_TEXT.some((part) => pair.selector.includes(part)) ? 3.0 : 4.5;
      if (best.ratio >= threshold) continue;
      const key = `${pair.file} ${pair.selector}`;
      const seenWorst = worst.get(key);
      if (!seenWorst || best.ratio < seenWorst.ratio)
        worst.set(key, {
          ratio: best.ratio,
          threshold,
          theme: name,
          text: toHex(best.text),
          ground: toHex(best.ground),
        });
    }
  }

  if (unresolved.size > 0) {
    console.log(`${target.name}: ${unresolved.size} pair(s) skipped for want of a token\n`);
    for (const u of [...unresolved].sort()) console.log(`  [skipped] ${u}`);
    console.log();
  }

  return { failures: [...worst.entries()], checked, palettes: palettes.length, fatal: false };
}

async function main() {
  const only = process.argv[2];
  const targets = only ? TARGETS.filter((t) => t.key === only || t.name === only) : TARGETS;
  if (targets.length === 0) {
    console.error(`Unknown target '${only}'. Use one of: ${TARGETS.map((t) => t.key).join(', ')}`);
    process.exit(1);
  }

  let failed = false;
  for (const target of targets) {
    const { failures, checked, palettes, fatal } = await checkTarget(target);
    if (fatal) {
      failed = true;
      continue;
    }
    if (failures.length > 0) {
      failed = true;
      console.error(`${target.name}: contrast check FAILED\n`);
      for (const [key, f] of failures.sort((a, b) => a[1].ratio - b[1].ratio)) {
        console.error(
          `  [contrast] ${f.theme} — ${key}: ${f.ratio.toFixed(2)}:1 ` +
            `(need ${f.threshold}:1) [${f.text} vs ${f.ground}]`,
        );
      }
      console.error(`\n  ${failures.length} problem(s), ${checked} pair(s) checked.\n`);
    } else {
      console.log(
        `${target.name}: passed — ${palettes} theme(s), ${checked} pair(s) checked ` +
          `(palettes from ${target.palettes}).`,
      );
    }
  }

  if (failed) process.exit(1);
}

await main();
