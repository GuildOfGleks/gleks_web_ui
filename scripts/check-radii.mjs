#!/usr/bin/env node
// Law 2 — concentric radii. Written red, on purpose, and NOT a CI step yet.
//
//   2. CONCENTRIC RADII  A radius nested inside another is the outer radius minus the padding
//                        between them. An inner corner that repeats its parent's reads as a
//                        mistake at every size; one that ignores it reads as a different
//                        component.
//
// It is its own script rather than a fourth section of `check-geometry.mjs` for one reason:
// that script is a required CI step and is green. This one is not green and must not be, until
// its findings are fixed -- the same sequence `check:geometry` itself followed for 25 commits.
// Run it with `npm run check:radii`. Wiring it into `check:geometry` is the reward for zero.
//
// ── Why this needed a table and could not be a regex ─────────────────────────────────────────
//
// `npm run survey:geometry` infers parentage from token names and gets six of nineteen wrong,
// which is the argument for RADII below rather than an objection to the survey. A name is not a
// parent:
//
//   * **`--gog-autocomplete-panel-radius` is not inside `--gog-autocomplete-radius`.** The panel
//     is an `<ng-template>` positioned against the trigger's measured rect, and with
//     `appendToBody` it renders into `<body>`. It is the field's sibling, never its child, so two
//     identical radii there are correct and the survey's "identical, so the corners cannot be
//     concentric" is a false positive. Same for the datepicker.
//   * **`--gog-button-toggle-radius` is not inside `--gog-button-radius`.** Different components
//     that share a naming prefix.
//
// ── The third state, which the plan did not have ─────────────────────────────────────────────
//
// The plan describes two states, nested and outermost. Building the table produced a third, and
// without it the law returns answers that are worse than the code it corrects: **a child that
// never reaches its parent's corner has no concentric relationship with it at all.**
//
// A calendar day is the clearest case. `inner = outer - padding` clamps to 0 at 12px of panel
// padding, so the law would square off every day cell in the grid -- and 31 of the 35 cells are
// nowhere near a corner. The relationship the law is about is a box *inset at the corner* (a
// panel inside a card), not any box that happens to be inside another. So NOT_CONCENTRIC is a
// state with a stated reason, not an exception list, and it carries the rows where the honest
// answer is "the law does not reach here".

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLengthLayers, makeLengthResolver } from './geometry-length.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeCssPath = path.join(root, 'projects/gleks/ui/src/styles/theme.css');

/**
 * Boxes with no parent to be concentric with, each with the reason it is outermost.
 *
 * "It is a component" is not a reason — `--gog-multiselect-option-radius` belongs to a component
 * too. The reason has to say what the box sits in.
 */
const OUTERMOST = new Map([
  ['panel', 'the outermost surface tier; a panel frames page content rather than sitting in a box'],
  ['accordion', 'the item is the outermost box; a stack of items sits on the page'],
  ['button', 'sits in the consumer layout'],
  ['button-toggle', 'its own component — it shares a name prefix with the button, not a box'],
  ['card', 'the outermost surface'],
  ['checkbox', 'the box is the control'],
  ['chip', 'sits in the consumer layout'],
  ['dialog', 'floats over the page, inside nothing'],
  ['input', 'the field box is the control'],
  ['select', 'the field box is the control'],
  ['multiselect', 'the field box is the control'],
  ['autocomplete', 'the field box is the control'],
  ['datepicker', 'the field box is the control'],
  [
    'autocomplete-panel',
    'an overlay placed against the trigger rect, and into <body> under appendToBody — the field’s sibling, never its child',
  ],
  [
    'datepicker-panel',
    'an overlay placed against the trigger rect, and into <body> under appendToBody — the field’s sibling, never its child',
  ],
  ['menu', 'an overlay; it always renders into <body>'],
  ['badge', 'it hangs outside its host box on purpose — the host is not its container'],
  ['progressbar', 'the track is the outermost box'],
  ['scroll-track', 'the track is the outermost box'],
  ['slider-track', 'the track is the outermost box'],
  ['toggle', 'the track is the outermost box'],
  ['skeleton', 'the bone is the outermost box'],
  ['tabs-indicator', 'a bar drawn beneath the strip, not a box inside one'],
  ['tag', 'sits in the consumer layout'],
  ['toast', 'floats over the page, inside nothing'],
  ['tooltip', 'floats over the page, inside nothing'],
]);

/**
 * Boxes inside another box, at its corner: `inner = max(0, outer - gap)`.
 *
 * `gap` is the token holding the distance between the two boxes' edges, or a number where the
 * distance is a literal. `parent` is the token holding the outer radius — which is not always the
 * one the child's name suggests: the multiselect and select panels have no radius token of their
 * own and paint with the field's, while the autocomplete and datepicker have a separate one. That
 * inconsistency is a finding in its own right and is reported at the end.
 */
const NESTED = new Map([
  [
    'accordion-body',
    { parent: 'accordion', gap: 0, note: 'the body is flush with the item; no padding between the boxes' },
  ],
  [
    'autocomplete-option',
    { parent: 'autocomplete-panel', gap: 'autocomplete-options-padding', note: 'the first and last rows meet the panel corners' },
  ],
  [
    'multiselect-option',
    { parent: 'multiselect', gap: 'multiselect-options-padding', note: 'the panel paints with the field token; see PANEL_RADIUS_SPLIT' },
  ],
  [
    'multiselect-filter-input',
    { parent: 'multiselect', gap: 'multiselect-filter-padding', note: 'the filter sits at the top of the panel, against its corners' },
  ],
  [
    'select-filter-input',
    { parent: 'select', gap: 'select-filter-padding', note: 'the filter sits at the top of the panel, against its corners' },
  ],
  [
    'menu-item',
    { parent: 'menu', gap: 'menu-padding', note: 'the first and last items meet the panel corners' },
  ],
  [
    'scroll-thumb',
    { parent: 'scroll-track', gap: 'scroll-thumb-inset', note: 'the thumb is inset inside the track on every side' },
  ],
]);

/**
 * Boxes inside another that the law does not reach, each with the reason.
 *
 * This is the state the plan did not have, and it is not a way past a finding: every row says
 * what makes the concentric relationship absent rather than inconvenient.
 */
const NOT_CONCENTRIC = new Map([
  ['checkbox-dash', 'a pill-shaped mark drawn inside the box, not an inner box — 999px is its shape'],
  ['chip-pill', 'a variant radius of the same box, not a child of it'],
  ['tag-pill', 'a variant radius of the same box, not a child of it'],
  ['skeleton-square', 'a shape variant of the same bone, not a child'],
  ['skeleton-line', 'a shape variant of the same bone, not a child'],
  ['slider-thumb', 'a disc that overflows the track symmetrically; 50% is its shape, not an inset corner'],
  ['input-clear', 'vertically centred and inset from the field end — it never reaches a corner'],
  ['select-clear', 'vertically centred and inset from the field end — it never reaches a corner'],
  ['multiselect-clear', 'vertically centred and inset from the field end — it never reaches a corner'],
  ['input-icon-action', 'vertically centred and inset from the field end — it never reaches a corner'],
  [
    'calendar-day',
    'a cell in a grid: four of thirty-five touch a panel corner and one token sizes them all, so the concentric answer would square off the other thirty-one',
  ],
  ['calendar-nav', 'a button in the panel header, inset from the corner by the panel padding'],
  [
    'panel-toggle',
    'a header button inset by a padding that changes with size while its radius does not — concentricity here would need five radii, which is a decision and not a fix',
  ],
]);

/**
 * Pairs where two components solve the same problem two ways. Not a law-2 violation; reported
 * because the law is what surfaced them and a reader deciding a radius needs to know.
 */
const PANEL_RADIUS_SPLIT = [
  '--gog-autocomplete-panel-radius and --gog-datepicker-panel-radius exist; the select and multiselect panels paint with the *field* token instead (--gog-select-radius / --gog-multiselect-radius). Four dropdowns sharing GogDropdownBase, two answers.',
  'The select panel has no option radius and no options padding at all: its rows are full-bleed with square corners, while the autocomplete and multiselect inset theirs and round them. Three panels, three interiors.',
];

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const { declaration } = makeLengthResolver(layers, new Map(), { density: 1 });
const declared = new Map([...layers.rootLiteral, ...layers.derivedBase]);

/** Every `--gog-*-radius` token declared in theme.css, minus the foundation one. */
const radii = [...declared.keys()]
  .filter((name) => name.endsWith('-radius') && name !== '--gog-radius')
  .map((name) => name.replace(/^--gog-/, '').replace(/-radius$/, ''));

const findings = [];
const unresolved = [];

const resolve = (token) => {
  const { px, why } = declaration(token);
  if (px === null || Number.isNaN(px)) {
    // A radius that cannot be resolved is a radius nobody checked. Printed, never skipped.
    unresolved.push(`${token} — ${why ?? 'unresolvable'}`);
    return null;
  }
  return px;
};

// Every radius is accounted for by exactly one of the three tables, or it is a hole in them.
for (const name of radii) {
  const states = [OUTERMOST.has(name), NESTED.has(name), NOT_CONCENTRIC.has(name)].filter(Boolean);
  if (states.length === 0) {
    findings.push({
      block: name,
      message: `--gog-${name}-radius is in none of the three tables. Declare a parent, or say why it has none.`,
    });
  } else if (states.length > 1) {
    findings.push({ block: name, message: `--gog-${name}-radius is in more than one table.` });
  }
}
for (const table of [OUTERMOST, NESTED, NOT_CONCENTRIC]) {
  for (const name of table.keys()) {
    if (!radii.includes(name)) {
      // A row that outlives its token sends the next reader looking for something that is gone.
      findings.push({ block: name, message: `no --gog-${name}-radius in theme.css — stale table row` });
    }
  }
}

for (const [name, { parent, gap, note }] of NESTED) {
  if (!radii.includes(name) || !radii.includes(parent)) continue;
  const inner = resolve(`--gog-${name}-radius`);
  const outer = resolve(`--gog-${parent}-radius`);
  const distance = typeof gap === 'number' ? gap : resolve(`--gog-${gap}`);
  if (inner === null || outer === null || distance === null) continue;

  const expected = Math.max(0, outer - distance);
  if (Math.abs(inner - expected) > 0.01) {
    findings.push({
      block: name,
      message:
        `${inner}px inside --gog-${parent}-radius (${outer}px) with ${distance}px between them — ` +
        `expected ${expected}px (outer minus the gap). Nested because ${note}.`,
    });
  }
}

const counted = `${radii.length} radii: ${OUTERMOST.size} outermost, ${NESTED.size} nested, ${NOT_CONCENTRIC.size} outside the law`;

if (findings.length > 0) {
  console.error(`Radius check FAILED — ${findings.length} finding(s):\n`);
  for (const f of findings.sort((a, b) => a.block.localeCompare(b.block))) {
    console.error(`  [law 2] ${f.block}: ${f.message}`);
  }
  console.error(`\n${counted}.`);
  if (unresolved.length > 0) {
    console.error(`\n  Could not resolve — ${unresolved.length}, printed rather than skipped:`);
    for (const token of unresolved) console.error(`    ${token}`);
  }
  console.error('\n  Noted alongside, not law-2 failures:');
  for (const note of PANEL_RADIUS_SPLIT) console.error(`    - ${note}`);
  console.error(
    '\nThis check is red on purpose and is not in CI. docs/component-geometry.md, law 2.',
  );
  process.exit(1);
}

console.log(`Radius check passed — law 2 across ${counted}.`);
