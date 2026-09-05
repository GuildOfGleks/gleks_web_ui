#!/usr/bin/env node
// Enforces the geometry laws that have been decided, from styling.instructions.md ("Geometry and
// typography are computed, not chosen"). Three of the five are in here; the other two are still
// in `npm run survey:geometry`, waiting on a decision, and it says which.
//
//   1. THE GRID      Every padding, gap, margin, offset and inset resolves to a multiple of 4.
//                    The scale itself is nine steps, all multiples of 4 (docs/component-geometry.md,
//                    D1). check-tokens rule H already fails a literal that restates a step; this
//                    is the other half — a step whose *value* is off the grid.
//
//   3. OPTICAL RATIO A control's horizontal padding is exactly twice its vertical, at every size
//                    step. 2.0 is arithmetic rather than taste: with both paddings on the 4px
//                    grid, 2.0 and 1.0 are the only ratios reachable at all five steps, so any
//                    other value needs an exception at `xsm` for every block in the library.
//                    Surfaces are out of this law — a surface frames content, a control balances
//                    a label — and each one says so in SURFACES below.
//
//   5. THE TARGET    Every pointer target computes to at least 24x24 CSS px at every size, at
//                    `--gog-density: 1`. Where the painted control is smaller, the fix is a
//                    transparent `::before` inflating the *hit area* — recorded in HIT_AREA
//                    below, one entry per component, naming the file that does it. An entry here
//                    is a claim this script cannot verify from tokens, so it names the selector:
//                    it is documentation with an address, not a silenced finding.
//
// Not in here yet, and why:
//
//   2. CONCENTRIC RADII needs a declared parent per nested radius. The survey infers parentage by
//      name and prints 27 radii with no parent inferred; a name is not a parent (a dropdown
//      panel's option nests inside the panel, not the field of the same name), so the pair table
//      is a decision, not a regex.
//   4. THE TYPOGRAPHIC RATIO needs a role per text token. 45 blocks declare a font size and 20
//      declare a line-height, so the larger half of this law is currently *unstated* rather than
//      wrong, and `--gog-line-height-none: 1` on a tag is correct — which is exactly why the role
//      tag cannot be skipped.
//
// **This is deliberately not a CI step until it is green.** Same discipline check:contrast
// followed: a permanently red step over a known, tracked condition teaches everyone to ignore CI.
// Wiring it in is the last commit of the sweep, not the first.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLengthLayers, makeLengthResolver, parseTokenName } from './geometry-length.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeCssPath = path.join(root, 'projects/gleks/ui/src/styles/theme.css');

const PAD_X = ['padding-x', 'padding-inline', 'padding-h'];
const PAD_Y = ['padding-y', 'padding-block', 'padding-v'];
const SPACING_PROPS = [
  'padding',
  ...PAD_X,
  ...PAD_Y,
  'padding-top',
  'padding-bottom',
  'gap',
  'row-gap',
  'column-gap',
  'offset',
  'inset',
];
const SIZE_PROPS = ['height', 'min-height', 'box-size', 'size', 'width', 'min-width'];
const PROP_SUFFIXES = [
  ...new Set([...SPACING_PROPS, ...SIZE_PROPS, 'font-size', 'line-height', 'radius', 'border-width']),
].sort((a, b) => b.length - a.length);

/**
 * Law 3 applies to a control — something that balances a label inside a box at five size steps.
 * Everything here frames *content* instead, and would carry twice as much padding at its sides as
 * above if it were held to 2.0. Each entry is the reason, not just an exclusion.
 */
const SURFACES = new Map([
  ['card', 'a surface: its padding is the frame around projected content'],
  ['panel', 'a surface, same as card'],
  ['dialog', 'a surface'],
  ['toast', 'a surface — its own buttons are controls and are checked'],
  ['tooltip', 'a bubble around text, not a control'],
  ['accordion-body', 'the content region, not the header row'],
  ['table', 'cell padding is row density, and the sortable cell is checked by law 5 instead'],
  ['table-empty', 'an empty-state message inside the table body'],
  ['table-loading', 'the loading region inside the table body'],
  ['calendar-weekday', 'a column caption, not a control'],
  ['multiselect-controls', 'a row of chrome inside a panel, not a labelled control'],
  ['badge', 'a count marker; its geometry follows the dot, not a label box'],
]);

/**
 * Targets whose painted box is deliberately smaller than 24x24, with the hit area inflated in the
 * component's own stylesheet. The selector is part of the entry on purpose: this script cannot see
 * a `::before` from a token, so the entry has to be checkable by a reader in one hop.
 *
 * Empty until the sweep fills it — every line here is a component commit that has landed.
 */
const HIT_AREA = new Map([
  ['button/xsm', 'button.css, `.gog-btn--xsm::before` — 20px painted, 24px target'],
  ['chip-remove/xsm', 'chip.component.scss, `.gog-chip__remove::before` — 13.2px painted'],
  ['chip-remove/sm', 'chip.component.scss, `.gog-chip__remove::before` — 15.4px painted'],
  ['chip-remove/md', 'chip.component.scss, `.gog-chip__remove::before` — 17.6px painted'],
  ['chip-remove/lg', 'chip.component.scss, `.gog-chip__remove::before` — 19.8px painted'],
  ['chip-remove/slg', 'chip.component.scss, `.gog-chip__remove::before` — 22px painted'],
  ['chip/xsm', 'chip.component.scss, `.gog-chip__surface` min-block-size — the surface clips, so the paint grows'],
  ['chip/sm', 'chip.component.scss, `.gog-chip__surface` min-block-size — the surface clips, so the paint grows'],
]);

/**
 * Lengths *inside* a single painted mark, which the grid does not govern.
 *
 * The distinction is not "small": a gap between two elements is spacing and is checked however
 * small it is. These are the lengths that define one mark's own shape — a thumb's clearance
 * inside its track is what makes a switch read as a switch, and quadrupling it to satisfy a grid
 * would shrink the thumb from 83% of the track to 67% and change the component's identity.
 * Same category as `--gog-focus-ring-offset`, which is skipped for the same reason.
 */
const OPTICAL_CHROME = new Map([
  ['--gog-toggle-thumb-inset', "the thumb's clearance inside its own track: 2px on a 24px track"],
]);

/**
 * Where a target's padding comes from when it is not a token of that block.
 *
 * A `gog-toggle`'s pointer target is the `<label>` around it, whose padding falls through
 * `var(--gog-toggle-padding, var(--gog-control-checkbox-padding))` in the component's stylesheet
 * — a chain no token in `theme.css` states, so the sweep sees a bare 14px track and reports a
 * failure that is not there. One line per block, naming the token that actually pads it.
 */
const TARGET_PADDING = new Map([
  ['toggle-track', '--gog-control-checkbox-padding'],
]);

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const resolver = makeLengthResolver(layers, new Map(), { density: 1 });

const declared = new Map([...layers.rootLiteral, ...layers.derivedBase]);
const blocks = new Map();
for (const [token, raw] of declared) {
  const parsed = parseTokenName(token, PROP_SUFFIXES);
  if (!parsed || !parsed.block) continue;
  if (/^(space|text|line|font|radius|density|control-border|panel-border|border)$/.test(parsed.block))
    continue;
  const entry = blocks.get(parsed.block) ?? { name: parsed.block, tokens: [] };
  entry.tokens.push({ token, raw, ...parsed });
  blocks.set(parsed.block, entry);
}

/** Findings, grouped by component so a failure reads as "gog-button / sm / …". */
const findings = [];
const unreadable = [];
const add = (block, size, law, message) =>
  findings.push({ block, size, law, message });

const resolve = (token) => {
  const d = resolver.declaration(token);
  if (d.px === null && d.parts.length <= 1 && d.why !== 'not declared') unreadable.push(`${token} — ${d.why}`);
  return d;
};

// ── Law 1 ────────────────────────────────────────────────────────────────────────────────────
const steps = [...layers.derivedBase.keys(), ...layers.rootLiteral.keys()]
  .filter((t) => /^--gog-space-\d+$/.test(t))
  .map((t) => Number(t.replace('--gog-space-', '')));
for (const step of steps.filter((s) => s % 4 !== 0).sort((a, b) => a - b)) {
  add('the scale', null, 1, `--gog-space-${step} is not a multiple of 4 — the scale is nine steps (D1)`);
}

for (const block of blocks.values()) {
  // A focus ring is not spacing. `--gog-focus-ring-width: 3px` and `-offset: 2px` are their own
  // foundation family, and every per-component ring token derives from them — a ring offset of
  // 2px next to a 4px spacing grid is the decision (D1), not a leak through it. Holding them to
  // the grid would quadruple a hairline for the sake of a number.
  if (/(^|-)focus-ring$/.test(block.name)) continue;

  for (const t of block.tokens) {
    if (!SPACING_PROPS.includes(t.prop)) continue;
    // A derived total is not a grid step. `--gog-field-<size>-icon-inset` is
    // `icon-offset * 2 + glyph-size` — the padding that keeps typed text clear of the icon — so
    // the grid governs its *inputs* (the offset, which is checked) and the glyph is a font size.
    // Rounding the sum would put the text somewhere the icon is not.
    if (/-icon-inset$/.test(t.token)) continue;
    if (OPTICAL_CHROME.has(t.token)) continue;
    const d = resolve(t.token);
    for (const part of d.parts) {
      if (part.px === null || part.px === 0) continue;
      if (part.px % 4 === 0) continue;
      add(block.name, t.size, 1, `${t.prop} is ${fmt(part.px)}px, off the 4px grid (${t.token})`);
    }
  }
}

// ── Law 3 ────────────────────────────────────────────────────────────────────────────────────
for (const block of blocks.values()) {
  if (SURFACES.has(block.name)) continue;
  const bySize = new Map();
  for (const t of block.tokens) {
    const key = t.size ?? null;
    const slot = bySize.get(key) ?? { x: null, y: null };
    if (t.prop === 'padding') {
      const d = resolve(t.token);
      if (d.parts.length === 2 && d.parts[0].px !== null && d.parts[1].px !== null) {
        slot.y = d.parts[0].px;
        slot.x = d.parts[1].px;
      }
    } else if (PAD_X.includes(t.prop)) slot.x = resolve(t.token).px;
    else if (PAD_Y.includes(t.prop)) slot.y = resolve(t.token).px;
    bySize.set(key, slot);
  }
  for (const [size, slot] of bySize) {
    if (slot.x === null || slot.y === null || slot.y === 0) continue;
    const ratio = slot.x / slot.y;
    if (ratio === 2) continue;
    add(
      block.name,
      size,
      3,
      `optical ratio ${ratio.toFixed(2)} (${fmt(slot.x)}/${fmt(slot.y)}), expected exactly 2.00 — horizontal padding is twice vertical`,
    );
  }
}

// ── Law 5 ────────────────────────────────────────────────────────────────────────────────────
const POINTER_TARGETS = new Map([
  ['button', 'the button itself'],
  ['button-toggle', 'one segment of the group'],
  ['control-checkbox', 'the box, shared by checkbox, radio and the multiselect option mark'],
  ['chip', 'the chip, when it is selectable'],
  ['chip-remove', 'the remove affordance inside a chip'],
  ['field', 'the shared control tier'],
  ['menu-item', 'one row of a menu'],
  ['tabs', 'one tab'],
  ['calendar-day', 'one day cell'],
  ['calendar-nav', 'the month arrows'],
  ['slider-thumb', 'the draggable thumb'],
  ['toast-close', 'the dismiss button'],
  ['toast-action', 'the action button in a toast'],
  ['dialog-close', 'the dismiss button'],
  ['panel-toggle', "the panel's collapse control"],
  ['select-option', 'one option row'],
  ['multiselect-option', 'one option row'],
  ['autocomplete-option', 'one option row'],
  ['scroll-thumb', 'the draggable scrollbar thumb'],
  ['toggle-track', 'the switch itself'],
  ['accordion', 'the header row, which is the whole target'],
]);

for (const block of blocks.values()) {
  if (!POINTER_TARGETS.has(block.name)) continue;
  const bySize = new Map();
  for (const t of block.tokens) {
    const key = t.size ?? null;
    const slot = bySize.get(key) ?? {};
    if (t.prop === 'padding') {
      const d = resolve(t.token);
      // A one-value `padding` applies to all four sides, so it is the vertical padding too —
      // `--gog-control-checkbox-padding` is written that way and was being read as no padding
      // at all, which is how a 24px target reported as 12.
      if (d.parts.length === 1 && d.parts[0].px !== null) slot.padY = d.parts[0].px;
      else if (d.parts.length === 2 && d.parts[0].px !== null) slot.padY = d.parts[0].px;
    } else if (PAD_Y.includes(t.prop)) slot.padY = resolve(t.token).px;
    else if (t.prop === 'font-size') slot.font = resolve(t.token).px;
    else if (t.prop === 'line-height') slot.leading = resolve(t.token).px;
    else if (['height', 'min-height', 'box-size', 'size'].includes(t.prop))
      slot.explicit = resolve(t.token).px;
    bySize.set(key, slot);
  }

  const shared = bySize.get(null) ?? {};
  const borrowed = TARGET_PADDING.has(block.name)
    ? resolver.value(`var(${TARGET_PADDING.get(block.name)})`).px
    : null;
  for (const [size, slot] of bySize) {
    const explicit = slot.explicit ?? null;
    const padY = slot.padY ?? shared.padY ?? borrowed ?? null;
    const font = slot.font ?? shared.font ?? null;
    const leading = slot.leading ?? shared.leading ?? 1;
    // The target is the element a pointer lands on, not the mark that is painted. A checkbox
    // paints a 12px box at `xsm` and sits inside a `<label>` whose padding is part of the
    // target — 12 + 8 + 8 is 28, and the SC is met without touching anything. Measuring the box
    // alone reported two findings that were not there, which is the same class of mistake as
    // holding a progressbar's height to 24px: the law is about targets.
    const px =
      explicit !== null
        ? explicit + 2 * (padY ?? 0)
        : padY !== null && font !== null
          ? padY * 2 + font * leading
          : null;
    if (px === null || px >= 24) continue;
    const key = `${block.name}${size ? `/${size}` : ''}`;
    if (HIT_AREA.has(key)) continue;
    add(
      block.name,
      size,
      5,
      `computes to ${fmt(px)}px, under WCAG 2.5.8's 24x24 — inflate the hit area with a transparent ::before and record it in HIT_AREA`,
    );
  }
}

// ── Report ───────────────────────────────────────────────────────────────────────────────────
const byBlock = new Map();
for (const f of findings) byBlock.set(f.block, [...(byBlock.get(f.block) ?? []), f]);

if (!findings.length) {
  console.log(`Geometry check passed — laws 1, 3 and 5 across ${blocks.size} blocks.`);
} else {
  console.log(`Geometry check — ${findings.length} findings across ${byBlock.size} components.\n`);
  for (const [name, list] of [...byBlock].sort()) {
    console.log(`  ${name}`);
    for (const f of list.sort((a, b) => a.law - b.law)) {
      console.log(`    [law ${f.law}] ${f.size ? `${f.size}: ` : ''}${f.message}`);
    }
  }
  const counts = [1, 3, 5].map((l) => `law ${l}: ${findings.filter((f) => f.law === l).length}`);
  console.log(`\n  ${counts.join('   ')}`);
}

if (unreadable.length) {
  console.log(`\n  Could not resolve — ${new Set(unreadable).size} tokens, printed rather than skipped:`);
  for (const line of [...new Set(unreadable)].sort()) console.log(`    ${line}`);
}

process.exit(findings.length ? 1 : 0);
