#!/usr/bin/env node
/**
 * Fails the build on a horizontally asymmetric **physical** box-model shorthand in the
 * library's own stylesheets.
 *
 *   padding: <y> 40px <y> 14px;   ← left ≠ right, written physically
 *   padding-inline: 14px 40px;    ← the same thing, mirrored by `dir="rtl"`
 *
 * ## Why this exists
 *
 * 21.5.0 converted 16 stylesheets to logical properties and shipped RTL support. It still
 * missed this bug four times over — `gog-inputfield`, `gog-select`, `gog-autocomplete` and
 * `gog-datepicker` each reserved a gutter for their trailing chrome with a physical
 * `padding-right`, while the chrome itself was placed with `inset-inline-end`. Under
 * `dir="rtl"` the two came apart: icon at one edge, the space kept for it at the other, and
 * the field's own text running underneath the icon.
 *
 * The reason a sweep for `left:`/`right:` did not catch them is that there is no `left` or
 * `right` anywhere in the declaration — the sidedness is in the *position of a value inside a
 * shorthand*. That is invisible to a search and, because the components' unit tests run
 * without a real style engine, invisible to the test suite too. It needs its own check, which
 * is this file. Same reasoning as `check-deprecations.mjs`: the failure mode is silent, so the
 * guard has to be mechanical.
 *
 * ## What it flags
 *
 * A `padding`, `margin`, `border-width` or `border-radius` shorthand whose value has **3 or 4
 * top-level groups** — the only forms that can set the two horizontal sides differently. One-
 * and two-value forms are symmetric across the inline axis and mirror for free, so they pass.
 *
 * ## What it does not flag, deliberately
 *
 * - `left`/`right` as *insets* (`left: 50%`, `right: 0`). Some are centring and direction-
 *   neutral; the rest — `gog-toast-container`'s corners, `gog-tooltip`'s `position="left"` —
 *   are physical because the API that drives them names a physical side. See the
 *   "Right-to-left" section of `AGENTS.md`.
 * - Anything outside `projects/gleks/ui/src`. A consuming app's own stylesheet is its business.
 *
 * Usage: node scripts/check-logical-properties.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['projects/gleks/ui/src/lib', 'projects/gleks/ui/src/styles'];
const SHORTHANDS = ['padding', 'margin', 'border-width', 'border-radius'];

/** Every `.scss`/`.css` under `dir`, recursively. */
function stylesheetsIn(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...stylesheetsIn(path));
    else if (/\.(s?css)$/.test(entry)) found.push(path);
  }
  return found;
}

/**
 * Splits a declaration's value into top-level groups, treating a whole `var(...)` — however
 * deeply nested — as one. Naive whitespace splitting counts the commas inside a fallback chain
 * and reports four groups for what is a single value.
 */
function topLevelGroups(value) {
  let depth = 0;
  let groups = 0;
  let inGroup = false;

  for (const char of value) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;

    if (depth === 0 && /\s/.test(char)) {
      if (inGroup) groups += 1;
      inGroup = false;
    } else if (!/\s/.test(char)) {
      inGroup = true;
    }
  }

  return inGroup ? groups + 1 : groups;
}

const problems = [];

for (const root of ROOTS) {
  for (const file of stylesheetsIn(root)) {
    const source = readFileSync(file, 'utf8');

    for (const property of SHORTHANDS) {
      // `(?<![\w-])` so `padding-inline` and `--gog-input-padding-y` are not read as `padding`.
      const pattern = new RegExp(`(?<![\\w-])${property}:\\s*([^;{}]*);`, 'g');

      for (const match of source.matchAll(pattern)) {
        const value = match[1].replace(/\s+/g, ' ').trim();
        if (topLevelGroups(value) < 3) continue;

        const line = source.slice(0, match.index).split('\n').length;
        problems.push({ file, line, property, value });
      }
    }
  }
}

if (problems.length === 0) {
  console.log(
    'Logical-property check: no horizontally asymmetric physical shorthands in the library.',
  );
  process.exit(0);
}

console.error(
  `Logical-property check failed — ${problems.length} asymmetric physical shorthand(s).\n` +
    'Each of these sets the left and right sides differently, so it does not mirror under\n' +
    '`dir="rtl"`. Split it into the logical pair, e.g. `padding-block: <y>;` plus\n' +
    '`padding-inline: <start> <end>;`.\n',
);

for (const { file, line, property, value } of problems) {
  const shown = value.length > 120 ? `${value.slice(0, 120)}…` : value;
  console.error(`  ${file}:${line}\n    ${property}: ${shown};`);
}

process.exit(1);
