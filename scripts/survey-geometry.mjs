#!/usr/bin/env node
// Measures every length the library ships against the five geometry laws in
// styling.instructions.md ("Geometry and typography are computed, not chosen"), and prints what
// it finds. **It reports; it does not fail.** That is deliberate and temporary.
//
// The gate this becomes is `check:geometry`, and it cannot exist yet: four of the five laws need
// a number nobody has chosen (docs/component-geometry.md, decisions D1-D8), and choosing one
// without seeing the spread would be picking a threshold that flatters whatever is already there.
// So this runs first, produces the evidence, and the decisions are taken against it.
//
// It reads token values rather than a rendered page: theme.css states all of them, so this is
// arithmetic on a parsed stylesheet. Two rules it inherits from check-contrast.mjs, both learned
// expensively:
//
//   * **Nothing is skipped in silence.** A token this script cannot resolve is printed in the
//     "Could not resolve" section with the reason. `gog-tag` sat unmeasured for weeks because a
//     colour resolver returned null and the sweep read that as "nothing to check".
//   * **It reports per component, not per token.** A finding is only actionable as
//     "gog-button / sm / optical ratio 1.75".
//
// Measured at `--gog-density: 1` unless `--theme=<name>` is passed: law 5 measures a control
// against WCAG 2.5.8's 24x24 CSS px, and a theme that sets a tighter density is the consumer's
// decision, not a licence to ship a 22px button.
//
// Usage:
//   node scripts/survey-geometry.mjs              # all five laws, default theme
//   node scripts/survey-geometry.mjs --law 3      # one law
//   node scripts/survey-geometry.mjs --theme dark

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildLengthLayers,
  makeLengthResolver,
  parseTokenName,
  SIZE_STEPS,
} from './geometry-length.mjs';
import { parseDecls } from './token-color.mjs';

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
const ALL_PROPS = [
  ...SPACING_PROPS,
  ...SIZE_PROPS,
  'font-size',
  'line-height',
  'radius',
  'border-width',
];

/** Longest-suffix-first, so `padding-inline` is never parsed as `padding` + junk. */
const PROP_SUFFIXES = [...new Set(ALL_PROPS)].sort((a, b) => b.length - a.length);

const args = process.argv.slice(2);
const onlyLaw = args.includes('--law') ? Number(args[args.indexOf('--law') + 1]) : null;
const themeName = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : null;

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));
const heading = (text) => `\n${text}\n${'-'.repeat(text.length)}`;

const unresolved = [];

function main(themeCss) {
  const layers = buildLengthLayers(themeCss);

  let themeDecls = new Map();
  if (themeName) {
    const re = new RegExp(`\\[data-theme=['"]${themeName}['"]\\]\\s*\\{`);
    const at = themeCss.search(re);
    if (at === -1) {
      console.error(`No [data-theme='${themeName}'] block in theme.css.`);
      process.exit(2);
    }
    const start = themeCss.indexOf('{', at);
    let depth = 0;
    for (let i = start; i < themeCss.length; i++) {
      if (themeCss[i] === '{') depth++;
      else if (themeCss[i] === '}' && --depth === 0) {
        themeDecls = parseDecls(themeCss.slice(start + 1, i));
        break;
      }
    }
  }

  const resolver = makeLengthResolver(layers, themeDecls, { density: 1 });

  // Every declared token, indexed by the block that owns it.
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

  const resolve = (token) => {
    const d = resolver.declaration(token);
    if (d.px === null && d.parts.length <= 1) unresolved.push(`${token} — ${d.why}`);
    return d;
  };

  const show = (law) => onlyLaw === null || onlyLaw === law;

  console.log(
    `Geometry survey — ${blocks.size} blocks, ${declared.size} declared tokens, at --gog-density: 1` +
      (themeName ? `, theme '${themeName}'` : ''),
  );

  if (show(1)) law1Grid(blocks, resolve, layers);
  if (show(2)) law2Radii(blocks);
  if (show(3)) law3OpticalRatio(blocks, resolve);
  if (show(4)) law4Typographic(blocks, resolve);
  if (show(5)) law5Target(blocks, resolve);

  if (unresolved.length) {
    console.log(heading(`Could not resolve — ${unresolved.length} tokens`));
    console.log('Printed rather than skipped: a checker that fails open is worse than none.');
    for (const line of [...new Set(unresolved)].sort()) console.log(`  ${line}`);
  }
}

// ── Law 1: the grid ──────────────────────────────────────────────────────────────────────────
function law1Grid(blocks, resolve, layers) {
  console.log(heading('Law 1 — the grid'));

  // The scale lives in the `:root, [data-theme]` block, not in `:root`: every step is
  // `calc(Npx * var(--gog-density))`, and a value containing var() has to be declared where it
  // can re-derive per theme scope (check-tokens rule C).
  const steps = [...layers.derivedBase.keys(), ...layers.rootLiteral.keys()]
    .filter((t) => /^--gog-space-\d+$/.test(t))
    .map((t) => Number(t.replace('--gog-space-', '')))
    .sort((a, b) => a - b);
  const offGrid = steps.filter((s) => s % 4 !== 0);
  console.log(`  Scale: ${steps.length} steps — ${steps.join(', ')}`);
  console.log(
    `  Not multiples of 4: ${offGrid.join(', ') || 'none'} (${offGrid.length} of ${steps.length})`,
  );

  const users = new Map();
  for (const block of blocks.values()) {
    for (const t of block.tokens) {
      if (!SPACING_PROPS.includes(t.prop)) continue;
      const d = resolve(t.token);
      for (const part of d.parts) {
        if (part.px === null || part.px === 0) continue;
        if (part.px % 4 === 0) continue;
        const list = users.get(part.px) ?? [];
        list.push(`${block.name}${t.size ? `/${t.size}` : ''} ${t.prop}`);
        users.set(part.px, list);
      }
    }
  }

  const total = [...users.values()].reduce((n, l) => n + l.length, 0);
  console.log(`  Off-grid values in use: ${total} declarations across ${users.size} values`);
  for (const px of [...users.keys()].sort((a, b) => a - b)) {
    const list = users.get(px);
    console.log(`    ${fmt(px)}px — ${list.length}: ${list.slice(0, 6).join(', ')}${list.length > 6 ? ', …' : ''}`);
  }
}

// ── Law 2: concentric radii ──────────────────────────────────────────────────────────────────
//
// The law only has something to say about a radius **nested inside another one**. A component's
// own outer corner reading `var(--gog-radius)` is correct and is what the character layer is for;
// reporting those as "restates its parent" would be a check crying wolf on its first run, which
// is how a check teaches people to ignore it.
//
// Parentage is inferred by name — block `x-y` nested in block `x`, where both declare a radius —
// and every radius with no inferred parent is listed separately, because the real pair table is a
// decision (docs/component-geometry.md, D-radii) and not something a prefix can settle. A
// dropdown panel's option nests inside the *panel*, not inside the field of the same name.
function law2Radii(blocks) {
  console.log(heading('Law 2 — concentric radii'));

  const radii = new Map();
  for (const block of blocks.values()) {
    for (const t of block.tokens) {
      if (t.prop === 'radius') radii.set(block.name, String(t.raw).trim());
    }
  }

  const nested = [];
  const unpaired = [];
  for (const [name, raw] of radii) {
    const segs = name.split('-');
    let parent = null;
    for (let i = segs.length - 1; i > 0; i--) {
      const candidate = segs.slice(0, i).join('-');
      if (radii.has(candidate)) {
        parent = candidate;
        break;
      }
    }
    if (parent) nested.push({ name, raw, parent, parentRaw: radii.get(parent) });
    else unpaired.push({ name, raw });
  }

  console.log(`  ${radii.size} radius tokens: ${nested.length} nest inside another, ${unpaired.length} are outermost or unpaired.`);
  console.log('  Nested — inner radius should be the outer minus the padding between them:');
  for (const n of nested.sort((a, b) => a.name.localeCompare(b.name))) {
    const same = n.raw === n.parentRaw;
    console.log(
      `    ${n.name.padEnd(28)} ${n.raw.padEnd(34)} inside ${n.parent} (${n.parentRaw})` +
        (same ? '   <- identical, so the corners cannot be concentric' : ''),
    );
  }
  console.log('  No parent inferred — each needs a declared parent, or a reason it has none:');
  for (const u of unpaired.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`    ${u.name.padEnd(28)} ${u.raw}`);
  }
}

// ── Law 3: optical ratio ─────────────────────────────────────────────────────────────────────
function law3OpticalRatio(blocks, resolve) {
  console.log(heading('Law 3 — optical ratio (horizontal padding / vertical padding)'));

  const rows = [];
  for (const block of blocks.values()) {
    const bySize = new Map();
    for (const t of block.tokens) {
      const key = t.size ?? '—';
      const slot = bySize.get(key) ?? { x: null, y: null, from: null };
      if (t.prop === 'padding') {
        const d = resolve(t.token);
        if (d.parts.length === 2 && d.parts[0].px !== null && d.parts[1].px !== null) {
          slot.y = d.parts[0].px;
          slot.x = d.parts[1].px;
          slot.from = 'shorthand';
        }
      } else if (PAD_X.includes(t.prop)) {
        slot.x = resolve(t.token).px;
        slot.from ??= t.prop;
      } else if (PAD_Y.includes(t.prop)) {
        slot.y = resolve(t.token).px;
        slot.from ??= t.prop;
      }
      bySize.set(key, slot);
    }
    for (const [size, slot] of bySize) {
      if (slot.x === null || slot.y === null || slot.y === 0) continue;
      rows.push({ block: block.name, size, x: slot.x, y: slot.y, ratio: slot.x / slot.y });
    }
  }

  const byBlock = new Map();
  for (const r of rows) byBlock.set(r.block, [...(byBlock.get(r.block) ?? []), r]);

  console.log(`  ${rows.length} padding pairs across ${byBlock.size} blocks.`);
  for (const [name, list] of [...byBlock].sort()) {
    const ordered = list.sort(
      (a, b) => SIZE_STEPS.indexOf(a.size) - SIZE_STEPS.indexOf(b.size),
    );
    const ratios = ordered.map((r) => r.ratio);
    const spread = Math.max(...ratios) - Math.min(...ratios);
    const detail = ordered
      .map((r) => `${r.size} ${fmt(r.x)}/${fmt(r.y)}=${r.ratio.toFixed(2)}`)
      .join('  ');
    console.log(`    ${name.padEnd(22)} ${detail}${list.length > 1 ? `   spread ${spread.toFixed(2)}` : ''}`);
  }
}

// ── Law 4: the typographic ratio ─────────────────────────────────────────────────────────────
function law4Typographic(blocks, resolve) {
  console.log(heading('Law 4 — line-height against font size'));

  const rows = [];
  for (const block of blocks.values()) {
    const bySize = new Map();
    for (const t of block.tokens) {
      const key = t.size ?? '—';
      const slot = bySize.get(key) ?? { font: null, leading: null, leadingToken: null };
      if (t.prop === 'font-size') slot.font = resolve(t.token).px;
      if (t.prop === 'line-height') {
        slot.leading = resolve(t.token).px;
        slot.leadingToken = String(t.raw).trim();
      }
      bySize.set(key, slot);
    }

    // A block usually declares one line-height and a font size per step: pair the unsized
    // leading with every sized font rather than reporting "no pair".
    const shared = bySize.get('—');
    for (const [size, slot] of bySize) {
      const leading = slot.leading ?? shared?.leading ?? null;
      const leadingToken = slot.leadingToken ?? shared?.leadingToken ?? null;
      if (slot.font === null || leading === null) continue;
      rows.push({ block: block.name, size, font: slot.font, leading, leadingToken });
    }
  }

  // The blocks that state a size and no leading are the larger half of this law: they inherit
  // whatever the page gives them, so the ratio is not a per-component choice there — it is not a
  // choice at all. Counted rather than listed one by one, because the number is the finding.
  const withFont = new Set();
  const withLeading = new Set();
  for (const block of blocks.values()) {
    for (const t of block.tokens) {
      if (t.prop === 'font-size') withFont.add(block.name);
      if (t.prop === 'line-height') withLeading.add(block.name);
    }
  }
  const silent = [...withFont].filter((b) => !withLeading.has(b)).sort();
  console.log(
    `  ${withFont.size} blocks declare a font size; ${withLeading.size} declare a line-height. ` +
      `${silent.length} state a size and inherit their leading:`,
  );
  console.log(`    ${silent.join(', ')}`);

  console.log(`  ${rows.length} font-size/line-height pairs.`);
  const byBlock = new Map();
  for (const r of rows) byBlock.set(r.block, [...(byBlock.get(r.block) ?? []), r]);
  for (const [name, list] of [...byBlock].sort()) {
    const detail = list
      .sort((a, b) => SIZE_STEPS.indexOf(a.size) - SIZE_STEPS.indexOf(b.size))
      .map((r) => `${r.size} ${fmt(r.font)}px x ${fmt(r.leading)}`)
      .join('  ');
    console.log(`    ${name.padEnd(22)} ${detail}`);
  }
}

/**
 * The blocks a pointer actually activates, and what the pointer hits in each.
 *
 * Curated, because WCAG 2.5.8 is about **targets** and most of what this script can measure is
 * not one: a progressbar's height, a badge dot, a tooltip arrow and an icon's font size are all
 * lengths, and holding any of them to 24x24 would be nonsense. The first run of law 5 reported 73
 * findings without this table and about a dozen of them meant anything — a check nobody can act
 * on is a check everybody learns to skip.
 *
 * Anything absent from this list is counted as excluded rather than passed, and `--all` prints
 * it: an omission should look like an omission.
 */
const POINTER_TARGETS = new Map([
  ['button', 'the button itself'],
  ['button-toggle', 'one segment of the group'],
  ['control-checkbox', 'the box, shared by checkbox, radio and the multiselect option mark'],
  ['chip', 'the chip, when it is selectable'],
  ['chip-remove', 'the remove affordance inside a chip'],
  ['field', 'the shared control tier — input, select, multiselect, autocomplete, datepicker'],
  ['menu-item', 'one row of a menu'],
  ['tabs', 'one tab — the header row is sized by the tabs block itself'],
  ['calendar-day', 'one day cell'],
  ['calendar-nav', 'the month arrows'],
  ['slider-thumb', 'the draggable thumb'],
  ['toast-close', 'the dismiss button'],
  ['toast-action', 'the action button in a toast'],
  ['dialog-close', 'the dismiss button'],
  ['panel-toggle', "the panel's collapse control"],
  ['datepicker-toggle', 'the calendar trigger inside the field'],
  ['select-option', 'one option row'],
  ['multiselect-option', 'one option row'],
  ['autocomplete-option', 'one option row'],
  ['scroll-thumb', 'the draggable scrollbar thumb'],
  ['toggle-track', 'the switch itself'],
  ['accordion', 'the header row, which is the whole target'],
  ['table', 'a sortable header cell, which is the whole cell'],
  ['input-clear', 'the clear button inside a field'],
  ['select-clear', 'the clear button inside a field'],
  ['multiselect-clear', 'the clear button inside a field'],
  ['autocomplete-clear', 'the clear button inside a field'],
  ['datepicker-clear', 'the clear button inside a field'],
  ['textarea-clear', 'the clear button inside a field'],
  ['control-clear', 'the shared clear-button tier'],
]);

// ── Law 5: the target ────────────────────────────────────────────────────────────────────────
function law5Target(blocks, resolve) {
  console.log(heading('Law 5 — target size (WCAG 2.5.8 AA: 24x24 CSS px)'));

  const rows = [];
  const excluded = [];
  for (const block of blocks.values()) {
    if (!POINTER_TARGETS.has(block.name)) {
      excluded.push(block.name);
      continue;
    }
    const bySize = new Map();
    for (const t of block.tokens) {
      const key = t.size ?? '—';
      const slot = bySize.get(key) ?? {};
      if (t.prop === 'padding') {
        const d = resolve(t.token);
        if (d.parts.length === 2 && d.parts[0].px !== null) slot.padY = d.parts[0].px;
      } else if (PAD_Y.includes(t.prop)) slot.padY = resolve(t.token).px;
      else if (t.prop === 'font-size') slot.font = resolve(t.token).px;
      else if (t.prop === 'line-height') slot.leading = resolve(t.token).px;
      else if (['height', 'min-height', 'box-size', 'size'].includes(t.prop))
        slot.explicit = resolve(t.token).px;
      bySize.set(key, slot);
    }

    const shared = bySize.get('—') ?? {};
    for (const [size, slot] of bySize) {
      const explicit = slot.explicit ?? null;
      const padY = slot.padY ?? shared.padY ?? null;
      const font = slot.font ?? shared.font ?? null;
      const leading = slot.leading ?? shared.leading ?? 1;
      const computed =
        explicit !== null
          ? explicit
          : padY !== null && font !== null
            ? padY * 2 + font * leading
            : null;
      if (computed === null) continue;
      rows.push({
        block: block.name,
        size,
        px: computed,
        how: explicit !== null ? 'declared' : `${fmt(padY)}x2 + ${fmt(font)}x${fmt(leading)}`,
      });
    }
  }

  const under = rows.filter((r) => r.px < 24).sort((a, b) => a.px - b.px);
  console.log(
    `  ${POINTER_TARGETS.size} blocks are pointer targets; ${rows.length} of their size steps are measurable; ${under.length} below 24px.`,
  );
  console.log(`  ${excluded.length} blocks excluded as not a pointer target${args.includes('--all') ? ':' : ' (--all to list).'}`);
  if (args.includes('--all')) console.log(`    ${excluded.sort().join(', ')}`);
  for (const r of under) {
    console.log(
      `    ${(r.block + (r.size === '—' ? '' : `/${r.size}`)).padEnd(30)} ${fmt(r.px).padStart(6)}px   ${r.how}`,
    );
  }
  const exactly = rows.filter((r) => r.px === 24);
  if (exactly.length)
    console.log(
      `  Exactly 24px, no margin: ${exactly.map((r) => r.block + (r.size === '—' ? '' : `/${r.size}`)).join(', ')}`,
    );
  const missing = [...POINTER_TARGETS.keys()].filter((b) => !rows.some((r) => r.block === b));
  if (missing.length)
    console.log(`  Target blocks nothing could be computed for: ${missing.join(', ')}`);
}

const themeCss = await fs.readFile(themeCssPath, 'utf8');
main(themeCss);
