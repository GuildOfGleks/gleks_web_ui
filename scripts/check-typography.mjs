#!/usr/bin/env node
// Law 4 — the typographic ratio — plus D8, the type scale's completeness. Written red; not a CI
// step until it is green, the sequence every check in this repo has followed.
//
//   4. THE TYPOGRAPHIC RATIO  Line-height is a function of role, not a per-component choice, and a
//                             block that sets a font size sets its leading. Inheriting the leading
//                             while changing the size moves the ratio silently, which is the whole
//                             thing this law guards.
//
//   D8. THE TYPE SCALE        Every font size reads a step of `--gog-text-*`, and type is expressed
//                             in `rem`/`em` so it follows the reader's own text size. A `px` font
//                             size beside a `rem` one is not a style choice: raise the browser's
//                             text setting and one grows while the other does not.
//
// `docs/component-geometry.md`, "D4 and D8 — taken 2026-09-06", holds the decisions and the
// numbers they were taken against. The roles:
//
//   label-none      1     a single-line label in a box sized by padding plus type
//   label-tight     1.2   a single-line label that may carry descenders
//   label-wrapping  1.3   a form label that may wrap beside its control
//   heading         1.3   a heading
//   ui-line         1.4   one line of UI text whose line box is the row height
//   prose           1.5   text that wraps into a paragraph
//
// **It reads the component stylesheets as well as `theme.css`, and that is the point.** The first
// survey read tokens only and reported that twenty blocks declare a leading. Eleven more live as
// literals in SCSS, invisible at the token layer -- which is how "the larger half of this law is
// unstated" was itself an understatement.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLengthLayers, parseTokenName } from './geometry-length.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeCssPath = path.join(root, 'projects/gleks/ui/src/styles/theme.css');
const libRoot = path.join(root, 'projects/gleks/ui/src/lib');

/**
 * Font sizes that deliberately do not read `--gog-text-*`, with the reason.
 *
 * "It is small" is not a reason. The bar is that the value is not *text* — it is lettering inside
 * a mark, where a reading scale has no claim.
 */
const FONT_SIZE_EXEMPT = new Map([
  [
    '--gog-toggle-xsm-state-font-size',
    'the switch’s own ON/OFF lettering: aria-hidden decoration inside the track, not text — the state a reader receives comes from role="switch" + aria-checked',
  ],
  ['--gog-toggle-sm-state-font-size', 'as above'],
  ['--gog-toggle-md-state-font-size', 'as above'],
  ['--gog-toggle-lg-state-font-size', 'as above'],
  ['--gog-toggle-slg-state-font-size', 'as above'],
]);

/**
 * Blocks that declare a font size and take their leading from somewhere this check cannot see,
 * with the reason. Empty is the goal; an entry is a claim, not a silence.
 *
 * @type {Map<string, string>}
 */
const LEADING_INHERITED = new Map();

/**
 * `line-height` values in a component stylesheet that are not leading at all.
 *
 * `0` collapses the inline box around an icon so the row's height is the icon's, not the font's.
 * No role applies and no step expresses it — it is a layout instruction that happens to be spelled
 * as a typographic property.
 */
const NOT_LEADING = new Set(['0']);

/**
 * Tokens whose name ends in `-line-height` and which hold no leading.
 *
 * A rename would fix the collision properly and would break five public tokens for a script's
 * benefit; the decision (D4d) is to exclude them here and rename at the next major.
 */
const NOT_A_LEADING_TOKEN = new Map([
  ['--gog-skeleton-line-height-xsm', 'a bone height in px, not leading — see D4(d)'],
  ['--gog-skeleton-line-height-sm', 'a bone height in px, not leading — see D4(d)'],
  ['--gog-skeleton-line-height-md', 'a bone height in px, not leading — see D4(d)'],
  ['--gog-skeleton-line-height-lg', 'a bone height in px, not leading — see D4(d)'],
  ['--gog-skeleton-line-height-slg', 'a bone height in px, not leading — see D4(d)'],
]);

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const declared = new Map([...layers.rootLiteral, ...layers.derivedBase]);

const findings = [];
const add = (rule, block, message) => findings.push({ rule, block, message });

// A step is a *size*, so the value decides membership and not the name. `--gog-text-color` and
// `--gog-text-transform` share the prefix and are not steps; counting them would have reported a
// ten-step scale that has eight members, and a wrong count is how a check starts being believed
// about things it never measured.
const isLength = (t) => /^-?[\d.]+(rem|em|px)$/.test((declared.get(t) ?? '').trim());
const LEADING_STEPS = [...declared.keys()].filter((t) => /^--gog-line-height-[a-z]+$/.test(t));
const TEXT_STEPS = [...declared.keys()].filter((t) => /^--gog-text-[a-z0-9]+$/.test(t) && isLength(t));

if (LEADING_STEPS.length === 0 || TEXT_STEPS.length === 0) {
  console.error('Could not find --gog-line-height-* or --gog-text-* in theme.css. Nothing measured.');
  process.exit(1);
}

const blockOf = (token) => parseTokenName(token, ['font-size', 'line-height']).block ?? token;

// ── Rule A: every font size reads the scale ──────────────────────────────────────────────────
// ── Rule B: and does so in rem, so it follows the reader's own text size ─────────────────────
const fontSizeTokens = [...declared.keys()].filter((t) => t.endsWith('-font-size'));
const sizedBlocks = new Set();

for (const token of fontSizeTokens) {
  const value = declared.get(token).trim();
  const block = blockOf(token);
  sizedBlocks.add(block);

  const exempt = FONT_SIZE_EXEMPT.get(token);
  const readsScale = /var\(\s*--gog-text-/.test(value) || /var\(\s*--gog-[a-z-]*font-size/.test(value);

  if (readsScale) {
    if (exempt) add('A', block, `${token} reads the scale but is listed as exempt ("${exempt}") — remove the entry`);
    continue;
  }
  if (exempt) continue;

  if (/\d\s*px/.test(value)) {
    add(
      'B',
      block,
      `${token} is ${value} — a px font size beside a rem type scale, so it does not follow the reader's text size`,
    );
  } else {
    add('A', block, `${token} is ${value} — a literal outside --gog-text-*`);
  }
}

// ── Rule C: a block that declares a size declares its leading ────────────────────────────────
const leadingTokens = [...declared.keys()].filter(
  (t) => t.endsWith('-line-height') || /-line-height-(xsm|sm|md|lg|slg)$/.test(t),
);
const blocksWithLeading = new Set(
  leadingTokens.filter((t) => !NOT_A_LEADING_TOKEN.has(t)).map((t) => blockOf(t)),
);

for (const block of [...sizedBlocks].sort()) {
  if (blocksWithLeading.has(block)) continue;
  const reason = LEADING_INHERITED.get(block);
  if (reason) continue;
  add('C', block, `declares a font size and no line-height — the ratio is unstated, not chosen`);
}
for (const [block, reason] of LEADING_INHERITED) {
  if (blocksWithLeading.has(block)) {
    add('C', block, `declares a line-height but is listed as inheriting one ("${reason}") — remove the entry`);
  }
}

// ── Rule D: every leading token reads a named step ───────────────────────────────────────────
for (const token of leadingTokens) {
  const exempt = NOT_A_LEADING_TOKEN.get(token);
  const value = declared.get(token).trim();
  const readsStep = /var\(\s*--gog-line-height-/.test(value) || /var\(\s*--gog-[a-z-]*line-height/.test(value);
  if (exempt) {
    if (readsStep) add('D', blockOf(token), `${token} reads a step but is listed as not-a-leading ("${exempt}")`);
    continue;
  }
  if (!readsStep) {
    add('D', blockOf(token), `${token} is ${value} — a literal outside --gog-line-height-*`);
  }
}

// ── Rule E: no literal leading in a component stylesheet ─────────────────────────────────────
const walk = async (dir) => {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.scss')) out.push(full);
  }
  return out;
};

for (const file of await walk(libRoot)) {
  const css = await fs.readFile(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');
  css.split('\n').forEach((line, i) => {
    const match = /^\s*line-height:\s*([^;]+);/.exec(line);
    if (!match) return;
    const value = match[1].trim();
    if (value.startsWith('var(')) return;
    if (NOT_LEADING.has(value)) return;
    add('E', rel.split('/').at(-1).replace('.component.scss', ''), `${rel}:${i + 1} sets line-height: ${value} — a literal outside --gog-line-height-*`);
  });
}

// ── Report ───────────────────────────────────────────────────────────────────────────────────
const scanned = `${fontSizeTokens.length} font-size token(s), ${leadingTokens.length} line-height token(s), ${TEXT_STEPS.length} type steps, ${LEADING_STEPS.length} leading steps`;

if (findings.length > 0) {
  const byRule = new Map();
  for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
  console.error(`Typography check FAILED — ${findings.length} finding(s):\n`);
  for (const rule of [...byRule.keys()].sort()) {
    for (const f of byRule.get(rule).sort((a, b) => a.block.localeCompare(b.block))) {
      console.error(`  [rule ${rule}] ${f.block}: ${f.message}`);
    }
  }
  const counts = [...byRule.keys()].sort().map((r) => `rule ${r}: ${byRule.get(r).length}`);
  console.error(`\n  ${counts.join('   ')}`);
  console.error(`\n${scanned}. docs/component-geometry.md, "D4 and D8 — taken".`);
  process.exit(1);
}

console.log(`Typography check passed — law 4 and D8 across ${scanned}.`);
