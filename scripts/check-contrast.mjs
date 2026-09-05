#!/usr/bin/env node
/**
 * WCAG AA contrast check for every shipped theme's palette.
 *
 * ## Why
 *
 * `gleks-ui-library.instructions.md` states AA as non-negotiable, but until this script nothing
 * in `scripts/` or CI ever computed a contrast ratio — two themes (`light`/`dark`) could be
 * eyeballed by whoever wrote them; five cannot, and the whole point of `docs/themes.md`'s
 * catalogue (modern/classic/retro/historical) is themes nobody eyeballs one at a time before
 * merging. `docs/themes.md`, iteration 2.
 *
 * ## What it checks, and against which threshold
 *
 * Every shipped palette — `light`/`dark` in `theme.css`, plus every file in `styles/presets/` —
 * resolved to its literal `--gog-*` colour values (no `var()`/`color-mix()` in a palette block
 * today; if that changes, this script needs a real resolver, not a bigger regex). Two kinds of
 * pair:
 *
 *   - **Text** (4.5:1, WCAG 1.4.3): `text`/`background`, `text`/`surface`,
 *     `mutedText`/`background`, `mutedText`/`surface`, `accentText`/`accent` — the last is a
 *     button's own label colour against its filled background, not a foundation pair, but it is
 *     real text a user reads and every theme declares both halves.
 *   - **Non-text UI** (3:1, WCAG 1.4.11): `accentDim`/`background`, `accentDim`/`surface`, and
 *     `accent`/`background`, `accent`/`surface` for the focus ring. `accentDim` — not
 *     `--gog-border-color` — because that is the colour a *rest-state form field's border*
 *     actually resolves to (`grep -n 'field-border: var(--gog-accent-dim)' theme.css`); it is the
 *     token WCAG 1.4.11 applies to, the one thing standing between "this is a text field" and "this
 *     is a flat rectangle". A focus ring is drawn from `--gog-accent-color` everywhere in the
 *     library (`grep -rn 'focus-ring.*var(--gog-accent-color)' theme.css`), so that is the pair
 *     checked, against both surfaces a focused element commonly sits on.
 *
 * `--gog-border-color` is **not** a gated pair, on purpose, even though it is the pair
 * `docs/themes.md` iteration 2 names literally ("border/surface"). It is used exclusively for
 * decoration in this library — panel outlines, dividers, chip/tag/table hairlines
 * (`grep -n 'var(--gog-border-color)' theme.css`) — never as the sole way to identify an
 * interactive control, which is what SC 1.4.11 actually requires a 3:1 ratio for. Every shipped
 * theme fails it well below 3:1 (measured 1.4–1.7:1 across all five, 2026-08-29) while its actual
 * job — a soft hairline that is visible without being loud — is exactly what a low ratio means to
 * do. Printed anyway, informationally, so the number stays visible rather than silently dropped
 * from the audit the plan asked for; it does not fail the check.
 *
 * ## Wired into CI on 2026-08-29, once every finding was resolved
 *
 * `.github/workflows/ci.yml` runs this after the other token checks. It was deliberately kept
 * out until the last real failure was fixed: a step that is permanently red over a known,
 * tracked, undecided condition teaches everyone to ignore CI, which is worse than not checking.
 * ## Two halves, since 21.9.0
 *
 * `PAIRS` compares **palette** tokens: hex against hex, straight out of a theme block. That is the
 * foundation, and it is blind to a label sitting on a `color-mix()` wash, because the wash has no
 * colour until it is composited over whatever it covers. Two real AA failures went through that
 * gap and were found by hand — the outline button's hover label, failing in all 11 themes, and
 * the ghost button's, failing in three.
 *
 * `WASH_PAIRS` closes it for the states this library thought to list: `token-color.mjs` resolves
 * a component token the way a browser does (theme block, then the `@supports` mixed layer, then
 * the derived layer, then the literals), composites it over the ground that component actually
 * sits on, and the label is measured against the result. It found 24 problems on its first run,
 * every one of them real.
 *
 * `collectStatePairs` closes it for the states nobody listed. It reads the *compiled* stylesheets
 * and takes every pair the rules themselves state — a rule setting `color` and `background-color`
 * together names the pair outright; a rule setting one takes the other from its own base rule. So
 * a component added next year is covered without anyone remembering to add it here, which is the
 * property a hand-maintained table cannot have. That sweep found one more real failure across the
 * whole library (`gog-autocomplete`'s selected option, 4.12:1 in light) and, just as usefully,
 * confirmed the other 180-odd states were already fine.
 *
 * `collectVariantPairs` closes the hole that sweep still had, and it was a wide one. Both of the
 * passes above take a pair from a rule that sets `color` and `background-color`; **a variant class
 * in this library sets neither.** `.gog-tag--danger` sets `--gog-tag-variant-color`,
 * `.gog-btn--outline` sets `--gog-button-variant-bg`/`-color`, `.gog-badge--warning` sets
 * `--gog-badge-variant-*`, and in each case one painting rule reads that layer through a `var()`
 * chain. So until 2026-09-05 the sweep saw the *default* variant of every component and nothing
 * else, while reporting a healthy pair count — which is how `gogBadge` shipped eleven AA failures
 * across four themes with this script green.
 *
 * The join is made by resolving each painting rule twice, once as written and once with a
 * modifier rule's declarations layered above the theme's own block, the way a class on the element
 * outranks `[data-theme]` on the root. Identical results mean the modifier changes nothing that
 * rule paints — a size class, a state that only moves a shadow — and no pair is emitted. Different
 * results are a state a user can see, and it is measured. **It found one real failure on its first
 * run:** `slate`'s secondary button, white on Tailwind sky-500, 2.77:1 — a shipped palette value
 * in a shipped variant, and the last of the family the badge belonged to. 493 pairs, and the four
 * hand-written `badge *` entries in `WASH_PAIRS` are now redundant with it rather than load-bearing
 * (kept: they state the intent, and the sweep is machinery).
 *
 * **What it deliberately does not gate: a fill against its own track.** A progressbar's variant
 * changes `--gog-progressbar-variant-bg` on a rule that paints a background and no text, so there
 * is no label to measure — the pair a checker could form instead is fill-against-track, and 51 of
 * the 55 shipped combinations are under 3:1 (measured 2026-09-05: 1.13:1 to 4.28:1, `bevel`'s
 * warning the lowest). That is not eleven broken themes. WCAG's ratio is luminance-only and these
 * pairs differ mostly in hue, the bar's own value is rendered as text beside it
 * (`--gog-progressbar-value-color`, which resolves to `--gog-muted-text-color` and is gated
 * above), and forcing 3:1 here would drive every track to near-white or every fill to near-black.
 * Recorded rather than measured, so the next reader does not re-derive it.
 *
 * Icons are held to 3:1 rather than 4.5:1 — WCAG 1.4.11 rather than 1.4.3 — through
 * `NON_TEXT_ELEMENTS`. Two of the sweep's first three findings were a spin-button glyph and a
 * panel chevron at 4.35:1 and 4.40:1, which are fine and would otherwise have been "fixed" into
 * near-black.
 *
 * All 11 shipped themes now pass all 1648 pairs. **A new preset that does not is what this is
 * here to stop** — and a preset is one file, so the failure names the file to fix.
 *
 * ## What this found (2026-08-29) — every finding now fixed
 *
 * Nine gated failures were found when this script was first run, across five themes, and all
 * nine are now fixed. What each one cost is worth keeping, because the pattern repeats:
 *
 *   - `light`      accent #9e6f00 -> #926600, hover #c88e00 -> #7a5500
 *   - `primeng`    one step down Aura's own ramp, #3b82f6 -> #2563eb
 *   - `slate`      muted #64748b -> #5c6b80, hover #6366f1 -> #5b5ee8 (both missed by <0.15)
 *   - `one-dark`   muted #5c6370 -> #9099a8
 *   - `one-light`  muted #a0a1a7 -> #6e6f77, accent #4078f2 -> #2f66db, hover -> #2456c4
 *
 * **`one-dark`/`one-light` deliberately reproduce a real editor palette, and this changed it.**
 * `#5c6370` is One Dark's own comment colour: correct for code a reader skims past, 2.32:1
 * against its own background, and well under AA for UI text a reader has to act on. Fidelity
 * lost to legibility on those tokens, by an explicit decision, and the file comments say so.
 *
 * **Three of the nine were on the hover fill, a pair this script did not have until the same
 * day.** `--gog-accent-bright` is `--gog-button-primary-hover-bg`, so it is the same label on
 * the same button one hover later — and in most themes it is *lighter* than the accent, so
 * white on it is strictly worse than the rest state that was being measured. It caught a
 * failure in `slate`, which passed every pair the script previously had.
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import * as sass from 'sass';

import { buildLayers, contrast, makeResolver, over, parseDecls, toHex } from './token-color.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(rootDir, 'projects/gleks/ui/src');

/** The palette tokens every theme block declares, mapped to the short names pairs below use. */
const PALETTE_TOKENS = {
  background: '--gog-background-color',
  surface: '--gog-surface-color',
  text: '--gog-text-color',
  mutedText: '--gog-muted-text-color',
  accent: '--gog-accent-color',
  accentText: '--gog-accent-text-color',
  accentBright: '--gog-accent-bright',
  accentDim: '--gog-accent-dim',
  danger: '--gog-danger-color',
  border: '--gog-border-color', // informational only — see header
};

/** [label, colorA, colorB, threshold, gate]. gate: false = printed, never fails the check. */
const PAIRS = [
  ['text/background', 'text', 'background', 4.5, true],
  ['text/surface', 'text', 'surface', 4.5, true],
  ['mutedText/background', 'mutedText', 'background', 4.5, true],
  ['mutedText/surface', 'mutedText', 'surface', 4.5, true],
  ['accentText/accent', 'accentText', 'accent', 4.5, true],
  // The same label, on the same button, one hover later. `--gog-accent-bright` is
  // `--gog-button-primary-hover-bg` (grep it in theme.css), so this pair is as real as the one
  // above — and it was missing until 2026-08-29, which hid four failures, one of them in a theme
  // that passed every pair the check did have. A rest state that clears AA says nothing about the
  // hover: in most themes `bright` is *lighter* than `accent`, so white on it is strictly worse.
  ['accentText/accentBright(hover)', 'accentText', 'accentBright', 4.5, true],
  // And one press later. 21.9.0 gave the press a colour of its own — `--gog-accent-dim` is
  // `--gog-button-primary-active-bg` — because the press used to be a transform that
  // `prefers-reduced-motion` switched off, leaving no feedback at all. That makes `dim` a fill
  // under a label for the first time; it was only ever a field border before, which is why the
  // two `accentDim` pairs below ask for 3.0 and this one asks for 4.5. Added with the state
  // itself rather than after a report, which is the lesson the pair above is here to teach.
  ['accentText/accentDim(press)', 'accentText', 'accentDim', 4.5, true],
  // Error text. `--gog-danger-color` is what every `--gog-<block>-error-color` resolves to, so
  // this is the colour a validation message is printed in — text, at 4.5:1, not a decorative
  // accent. Added 2026-09-03 after `check:app-contrast` caught it in `ui-showcase`: this script
  // had no danger pair at all, so a field error below AA was invisible to it.
  ['danger(error text)/background', 'danger', 'background', 4.5, true],
  ['danger(error text)/surface', 'danger', 'surface', 4.5, true],
  ['accentDim(field border)/background', 'accentDim', 'background', 3.0, true],
  ['accentDim(field border)/surface', 'accentDim', 'surface', 3.0, true],
  ['accent(focus ring)/background', 'accent', 'background', 3.0, true],
  ['accent(focus ring)/surface', 'accent', 'surface', 3.0, true],
  ['border(decorative)/background', 'border', 'background', 3.0, false],
  ['border(decorative)/surface', 'border', 'surface', 3.0, false],
];

/**
 * Component states whose colour only exists once composited — a label on a `color-mix()` wash,
 * over whatever that surface sits on. `PAIRS` above cannot express these: it compares palette
 * hexes, and a wash is not in the palette.
 *
 * Every entry here is a state that shipped or changed in 21.9.0, plus the hover it steps past,
 * because the two failures this table was built for were both hovers. Grounds are listed per
 * entry: a menu item sits on `--gog-menu-bg`, a ghost button on the page *or* on a card, and the
 * worse of the two is the one that counts.
 *
 * [label, labelToken, backgroundToken, groundTokens, threshold]
 */
const WASH_PAIRS = [
  ['button ghost hover', '--gog-button-ghost-hover-color', '--gog-button-ghost-hover-bg', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button ghost press', '--gog-button-ghost-press-color', '--gog-button-ghost-press-bg', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['menu item hover', '--gog-menu-item-hover-color', '--gog-menu-item-hover-bg', ['--gog-menu-bg'], 4.5],
  ['menu item press', '--gog-menu-item-color', '--gog-menu-item-press-bg', ['--gog-menu-bg'], 4.5],
  // A label on a status fill, which `gogBadge` paints for all four and which `PAIRS` cannot
  // express: `--gog-<status>-text-color` is derived in theme.css rather than stated in a palette
  // block, so it only exists once resolved. Added 2026-09-04 with the defect it found — the
  // badge had been putting `--gog-accent-text-color` on all four fills, which is white on a light
  // theme, and it failed AA in four of them (`material` amber 1.97:1, `primeng` green 2.28:1,
  // `slate` and `one-light` across all three of success/warning/info). `danger` passed
  // everywhere, and that was the tell: a danger pair was added the day before and the palettes
  // were tuned to it, while the other three had never been measured against anything.
  ['badge success', '--gog-badge-success-color', '--gog-badge-success-bg', ['--gog-surface-color'], 4.5],
  ['badge danger', '--gog-badge-danger-color', '--gog-badge-danger-bg', ['--gog-surface-color'], 4.5],
  ['badge warning', '--gog-badge-warning-color', '--gog-badge-warning-bg', ['--gog-surface-color'], 4.5],
  ['badge info', '--gog-badge-info-color', '--gog-badge-info-bg', ['--gog-surface-color'], 4.5],
  // `gog-button`'s severity (21.9.0), every state of every shape. The transparent variants are
  // the reason `--gog-button-<status>-ink` exists rather than the raw status colour: as text on
  // the page the raw hue clears AA in five of the eleven themes, and the ink mix is what the rest
  // needed. Listed exhaustively rather than by sample, because the two failures the wash table
  // was built for were both a state nobody thought to list.
  ['button success fill', '--gog-button-success-on-fill', '--gog-button-success-fill', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button success fill hover', '--gog-button-success-on-fill', '--gog-button-success-fill-hover', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button success fill press', '--gog-button-success-on-fill', '--gog-button-success-fill-press', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button success ink', '--gog-button-success-ink', '--gog-background-color', ['--gog-background-color'], 4.5],
  ['button success ink on surface', '--gog-button-success-ink', '--gog-surface-color', ['--gog-surface-color'], 4.5],
  ['button success ghost hover', '--gog-text-color', '--gog-button-success-wash', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button danger fill', '--gog-button-danger-on-fill', '--gog-button-danger-fill', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button danger fill hover', '--gog-button-danger-on-fill', '--gog-button-danger-fill-hover', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button danger fill press', '--gog-button-danger-on-fill', '--gog-button-danger-fill-press', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button danger ink', '--gog-button-danger-ink', '--gog-background-color', ['--gog-background-color'], 4.5],
  ['button danger ink on surface', '--gog-button-danger-ink', '--gog-surface-color', ['--gog-surface-color'], 4.5],
  ['button danger ghost hover', '--gog-text-color', '--gog-button-danger-wash', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button warning fill', '--gog-button-warning-on-fill', '--gog-button-warning-fill', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button warning fill hover', '--gog-button-warning-on-fill', '--gog-button-warning-fill-hover', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button warning fill press', '--gog-button-warning-on-fill', '--gog-button-warning-fill-press', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button warning ink', '--gog-button-warning-ink', '--gog-background-color', ['--gog-background-color'], 4.5],
  ['button warning ink on surface', '--gog-button-warning-ink', '--gog-surface-color', ['--gog-surface-color'], 4.5],
  ['button warning ghost hover', '--gog-text-color', '--gog-button-warning-wash', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button info fill', '--gog-button-info-on-fill', '--gog-button-info-fill', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button info fill hover', '--gog-button-info-on-fill', '--gog-button-info-fill-hover', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button info fill press', '--gog-button-info-on-fill', '--gog-button-info-fill-press', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button info ink', '--gog-button-info-ink', '--gog-background-color', ['--gog-background-color'], 4.5],
  ['button info ink on surface', '--gog-button-info-ink', '--gog-surface-color', ['--gog-surface-color'], 4.5],
  ['button info ghost hover', '--gog-text-color', '--gog-button-info-wash', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['chip hover', '--gog-chip-color', '--gog-chip-hover-bg', ['--gog-chip-bg'], 4.5],
  ['chip press', '--gog-chip-color', '--gog-chip-press-bg', ['--gog-chip-bg'], 4.5],
  // The selected filter chip's ring (21.9.0), against the two backgrounds it has to stay visible
  // over — which is the whole argument for a ring rather than a fill, so both are checked rather
  // than the rest state alone. A boundary, not text: 3:1 per WCAG 1.4.11, the same bar the focus
  // ring is held to.
  ['chip selected ring on hover', '--gog-accent-color', '--gog-chip-hover-bg', ['--gog-chip-bg'], 3],
  ['chip selected ring on press', '--gog-accent-color', '--gog-chip-press-bg', ['--gog-chip-bg'], 3],
  ['tab press', '--gog-tabs-press-color', '--gog-tabs-press-bg', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['accordion header hover', '--gog-accordion-hover-color', '--gog-accordion-hover-bg', ['--gog-accordion-header-bg'], 4.5],
  ['accordion header press', '--gog-accordion-hover-color', '--gog-accordion-press-bg', ['--gog-accordion-header-bg'], 4.5],
  ['button-toggle hover', '--gog-button-toggle-hover-color', '--gog-button-toggle-hover-bg', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['button-toggle press', '--gog-button-toggle-rest-color', '--gog-button-toggle-press-bg', ['--gog-background-color', '--gog-surface-color'], 4.5],
  ['select option hover', '--gog-select-option-color', '--gog-select-option-hover-bg', ['--gog-select-panel-bg'], 4.5],
  ['select option press', '--gog-select-option-color', '--gog-select-option-press-bg', ['--gog-select-panel-bg'], 4.5],
  ['multiselect option hover', '--gog-multiselect-option-color', '--gog-multiselect-option-hover-bg', ['--gog-multiselect-panel-bg'], 4.5],
  ['multiselect option press', '--gog-multiselect-option-color', '--gog-multiselect-option-press-bg', ['--gog-multiselect-panel-bg'], 4.5],
  ['autocomplete option hover', '--gog-autocomplete-option-hover-color', '--gog-autocomplete-option-hover-bg', ['--gog-autocomplete-panel-bg'], 4.5],
  ['autocomplete option press', '--gog-autocomplete-option-color', '--gog-autocomplete-option-press-bg', ['--gog-autocomplete-panel-bg'], 4.5],
];

/**
 * Elements that are a glyph rather than text — a chevron, a spinner arrow, a clear ×. WCAG asks
 * 3:1 of them (1.4.11, non-text contrast) rather than 4.5:1 (1.4.3), and holding an icon to the
 * text bar would either fail states that are fine or push every icon to near-black.
 *
 * Matched on the BEM element, so the list stays readable and a new component inherits nothing by
 * accident: anything not named here is treated as text, which is the safer default of the two.
 */
const NON_TEXT_ELEMENTS = [
  '__icon',
  '__spin-btn',
  '__chevron',
  '__mark',
  '__thumb',
  '__arrow',
  '__caret',
  '__remove',
  '__close',
  '__nav',
  '__toggle', // gog-panel's collapse control is its chevron; it renders no label
];

/**
 * Rest-state pairs that read as a pair in CSS and never render as one.
 *
 * `.gog-checkbox__box` states the tick's colour and the *unchecked* box's background in the same
 * rule, because the tick inherits `color` from the box. But the tick is only in the DOM while the
 * box is checked (`checkbox.component.html`), and checking it also swaps the background — so the
 * two values in this rule never appear together. In `ledger` both resolve to `#ffffff` and the
 * sweep read 1.00:1, which is arithmetically true and describes nothing a user can see. The pair
 * that does render — the tick on `--gog-checkbox-checked-bg` — is measured by the variant sweep,
 * and passes.
 *
 * **Add to this only for that exact shape:** an ink that no state renders against the ground
 * stated beside it. Anything else belongs in the palette, not here — an exclusion list is how a
 * contrast check quietly stops checking.
 */
const REST_PAIRS_NOT_RENDERED = [
  { selector: '.gog-checkbox__box', colour: '--gog-checkbox-icon-color' },
];

function isRestPairRendered(candidate) {
  return !REST_PAIRS_NOT_RENDERED.some(
    (skip) =>
      candidate.selector === skip.selector && (candidate.colour ?? '').includes(skip.colour),
  );
}

function thresholdFor(selector) {
  return NON_TEXT_ELEMENTS.some((part) => selector.includes(part)) ? 3.0 : 4.5;
}

/**
 * Every "this label meets this ground" pair the library's own rules actually state, read out of
 * the compiled stylesheets rather than listed by hand.
 *
 * `WASH_PAIRS` above is the curated half: it names the exact ground each state sits on, including
 * the two-ground case (a ghost button is on the page *or* on a card). This is the broad half —
 * it finds pairs nobody thought to list, and it keeps finding them as components are added. A
 * rule that sets `color` and `background-color` together states the pair outright; a rule that
 * sets only one takes the other from its own base rule.
 */
/**
 * The value of one painted declaration: a `var()` chain, a `color-mix()`, or a literal hex.
 *
 * Written as literals rather than built with `new RegExp` from a property name, which is how the
 * first draft of this had every escape eaten by its own template string — `\s` became `s` and the
 * sweep silently matched nothing at all, reporting a healthy pair count over zero rules read. A
 * checker that fails open is worse than no checker, so: literals, one per property.
 */
const COLOUR_DECL = /(?:^|;|\s)color:\s*((?:var|color-mix)\([^;]*?\)|#[0-9a-fA-F]{3,8})\s*(?:;|$)/;
const BACKGROUND_COLOR_DECL =
  /(?:^|;|\s)background-color:\s*((?:var|color-mix)\([^;]*?\)|#[0-9a-fA-F]{3,8})\s*(?:;|$)/;
const BACKGROUND_DECL =
  /(?:^|;|\s)background:\s*((?:var|color-mix)\([^;]*?\)|#[0-9a-fA-F]{3,8})\s*(?:;|$)/;

/**
 * Every rule in one stylesheet, with its custom-property declarations kept alongside its painted
 * colours. `collectStatePairs` throws the declarations away, which is exactly why it cannot see a
 * variant; `collectVariantPairs` below needs them.
 */
function readRules(css) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripComments(css)))) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith('@')) continue;
    const body = m[2];
    const value = (pattern) => {
      const hit = body.match(pattern);
      return hit ? hit[1].trim() : null;
    };
    rules.push({
      selector,
      colour: value(COLOUR_DECL),
      bg: value(BACKGROUND_COLOR_DECL) ?? value(BACKGROUND_DECL),
      decls: parseDecls(body),
    });
  }
  return rules;
}

/** Every `--token` named inside a declaration value, however deeply nested in `var()`/`color-mix()`. */
function referencedTokens(value) {
  return [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]);
}

/**
 * A selector that only ever matches when a modifier class is present — a variant, a severity, a
 * size, a state. Anything else is treated as the component's own unconditional rule, whose custom
 * properties are the defaults every painter in that file resolves against.
 */
function isModifierSelector(selector) {
  return /--[a-z]/i.test(selector) || /:(?:hover|active|focus|checked|disabled)/.test(selector);
}

/**
 * The variant half of the sweep — the gap `collectStatePairs` left open, and the one that let
 * `gogBadge` ship eleven AA failures with this script green.
 *
 * **The shape of the problem.** A variant class in this library paints nothing. It re-points an
 * indirection layer — `.gog-tag--danger` sets `--gog-tag-variant-color`, `.gog-btn--outline` sets
 * `--gog-button-variant-bg`/`-color` — and the block's one painting rule reads that layer through
 * a `var()` chain. So a sweep that takes pairs from rules setting `color` and `background-color`
 * sees the *default* variant of every component and nothing else, while reporting a healthy pair
 * count. There is no colour maths missing; the missing part is joining the rule that declares to
 * the rule that reads.
 *
 * **How the join is made.** For every painting rule P and every modifier rule V in the same
 * stylesheet, P's colours are resolved twice — once as they are, once with V's declarations
 * layered on top, above the theme's own block, the way a class on the element outranks
 * `[data-theme]` on the root. If the two resolutions are identical, V changes nothing P paints
 * (a size class, a state that only moves a shadow) and no pair is emitted. If they differ, that
 * difference *is* a state a user sees, and it gets measured.
 *
 * **Combinations, without inventing states that cannot exist.** `gog-button`'s severity is
 * orthogonal to its variant, so the real states are products: the rule that says what an outline
 * button does with a severity sets `--gog-button-variant-color: var(--gog-button-severity-ink)`,
 * and nothing declares `--gog-button-severity-ink` except the four severity classes. Rather than
 * multiplying every modifier by every other — which would measure `.gog-btn--primary.gog-btn--ghost`,
 * a thing no component can render — a seed rule pulls in only the rules that declare the tokens it
 * *references and does not itself declare*, transitively, branching where several rules supply the
 * same token. The combinations that come out are the ones the stylesheet says are possible.
 */
function collectVariantPairs(uiSrcDir, files) {
  const candidates = [];

  for (const file of files) {
    const css = file.endsWith('.scss')
      ? sass.compile(file, { style: 'expanded', sourceMap: false }).css
      : readFileSync(file, 'utf8');
    const rules = readRules(css).map((rule) => ({
      ...rule,
      selector: rule.selector.replace(/\[_ng(?:content|host)[^\]]*\]/g, '').trim(),
    }));

    const painters = rules.filter((rule) => rule.colour || rule.bg);
    const modifiers = rules.filter((rule) => rule.decls.size > 0 && isModifierSelector(rule.selector));

    // The component's own defaults: every unconditional rule's declarations, in source order.
    const defaults = new Map();
    for (const rule of rules) {
      if (isModifierSelector(rule.selector)) continue;
      for (const [k, v] of rule.decls) defaults.set(k, v);
    }

    /** Adds the rules that declare what `seed` references but nobody has declared yet. */
    const complete = (chain) => {
      const declared = new Map(chain.flatMap((rule) => [...rule.decls]));
      for (const rule of chain) {
        for (const [, value] of rule.decls) {
          for (const token of referencedTokens(value)) {
            if (declared.has(token) || defaults.has(token)) continue;
            const suppliers = modifiers.filter(
              (other) => !chain.includes(other) && other.decls.has(token),
            );
            if (suppliers.length === 0) continue;
            return suppliers.flatMap((supplier) => complete([...chain, supplier]));
          }
        }
      }
      return [chain];
    };

    // The rest state, with no modifier at all. Neither sweep above measures it: `collectStatePairs`
    // only emits `:hover`-shaped rules, and it uses a rest rule solely as the ground for one. So a
    // component whose default look fails — `gog-tag` in `one-dark`, 3.74:1, found the day this was
    // added — had nothing looking at it. Emitted here rather than in a fourth pass because the
    // machinery is identical: it is the variant sweep with an empty variant.
    for (const painter of painters) {
      const env = new Map(defaults);
      for (const [k, v] of painter.decls) env.set(k, v);
      const rest = {
        file: path.relative(uiSrcDir, file),
        selector: painter.selector,
        colour: painter.colour,
        bg: painter.bg,
        restBg: painters.find((rule) => !isModifierSelector(rule.selector))?.bg ?? null,
        variantEnv: env,
        baseEnv: env,
        isRest: true,
      };
      if (isRestPairRendered(rest)) candidates.push(rest);
    }

    for (const variant of modifiers) {
      for (const chain of complete([variant])) {
        const local = new Map(defaults);
        for (const rule of chain) for (const [k, v] of rule.decls) local.set(k, v);
        for (const painter of painters) {
          const withPainter = new Map(local);
          for (const [k, v] of painter.decls) withPainter.set(k, v);
          const base = new Map(defaults);
          for (const [k, v] of painter.decls) base.set(k, v);
          candidates.push({
            file: path.relative(uiSrcDir, file),
            selector: `${painter.selector} + ${chain.map((rule) => rule.selector).join(' + ')}`,
            colour: painter.colour,
            bg: painter.bg,
            restBg: painters.find((rule) => !isModifierSelector(rule.selector))?.bg ?? null,
            variantEnv: withPainter,
            baseEnv: base,
          });
        }
      }
    }
  }

  return candidates.filter((candidate) => candidate.colour && candidate.bg);
}

function collectStatePairs(uiSrcDir, files) {
  const rest = new Map();
  const states = [];

  const readRules = (css) => {
    const rules = [];
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
      if (colour || bg) rules.push({ selector, colour, bg });
    }
    return rules;
  };

  for (const file of files) {
    const css = file.endsWith('.scss')
      ? sass.compile(file, { style: 'expanded', sourceMap: false }).css
      : readFileSync(file, 'utf8');
    for (const rule of readRules(css)) {
      const selector = rule.selector.replace(/\[_ng(?:content|host)[^\]]*\]/g, '');
      const isState = /:hover|:active|:focus|--selected|--active|--current|:checked/.test(selector);
      const base = selector.split(/[:,]/)[0].trim();
      if (!isState) {
        const seen = rest.get(base) ?? {};
        rest.set(base, { colour: seen.colour ?? rule.colour, bg: seen.bg ?? rule.bg });
      } else {
        states.push({ file: path.relative(uiSrcDir, file), selector, base, ...rule });
      }
    }
  }

  return states
    .map((state) => ({
      ...state,
      colour: state.colour ?? rest.get(state.base)?.colour ?? null,
      bg: state.bg ?? rest.get(state.base)?.bg ?? null,
      restBg: rest.get(state.base)?.bg ?? null,
    }))
    .filter((state) => state.colour && state.bg);
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio, 1:1 (no contrast) to 21:1 (black on white). */
function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Blanks `/* ... *\/` comments to spaces, preserving line breaks and offsets — so a theme.css
 * header comment's own `[data-theme='mine']` example (its "Adding a theme" walkthrough) isn't
 * read as a real theme block. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Every `[data-theme='name'] { ... }` block in `content`, palette tokens resolved to hex.
 * Bare-literal blocks only — no `var()`/`color-mix()` resolution, since no shipped palette
 * block uses either today. A theme missing a required token is a problem this reports, not a
 * crash.
 */
function extractThemes(rawContent, source) {
  const content = stripComments(rawContent);
  const themes = [];
  const blockRe = /\[data-theme=(['"])([a-z0-9-]+)\1\]\s*\{([^}]*)\}/g;
  const seen = new Set();
  let m;
  while ((m = blockRe.exec(content))) {
    const name = m[2];
    if (seen.has(name)) continue; // theme.css lists `:root[data-theme='x'], [data-theme='x']` twice
    seen.add(name);
    const body = m[3];
    const palette = {};
    for (const [short, tokenName] of Object.entries(PALETTE_TOKENS)) {
      const declRe = new RegExp(`${tokenName}\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;`);
      const found = body.match(declRe);
      if (found) palette[short] = found[1];
    }
    themes.push({ name, palette, source, decls: parseDecls(body) });
  }
  return themes;
}

async function main() {
  const themeCss = readFileSync(path.join(uiSrc, 'styles/theme.css'), 'utf8');
  const layers = buildLayers(themeCss);
  let themes = extractThemes(themeCss, 'styles/theme.css');

  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles/presets'),
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const presetPath = path.join(entry.parentPath ?? entry.path, entry.name);
    const content = readFileSync(presetPath, 'utf8');
    themes.push(...extractThemes(content, `styles/presets/${entry.name}`));
  }

  themes.sort((a, b) => a.name.localeCompare(b.name));

  // A `[data-theme]` block that declares no palette token at all is not a theme — it is a
  // companion file layering something else onto one, like `presets/<name>.fonts.css`, whose whole
  // job is to re-point two font tokens for a theme defined elsewhere. Demanding a full palette
  // from it would be demanding it duplicate the preset it extends.
  //
  // A block declaring *some* palette still fails the missing-token check below: a half-stated
  // palette is a real defect, and the line between "extends a theme" and "is a broken theme" is
  // exactly none-vs-some. Dropped here rather than skipped inside the loop so the summary counts
  // themes actually checked, not files read.
  themes = themes.filter((t) => Object.keys(t.palette).length > 0);

  const styleFiles = [];
  for await (const entry of glob('**/*.{css,scss}', { cwd: uiSrc, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    // theme.css and the presets *are* the palette; theme-starter is a generated copy of it.
    const name = path.basename(file);
    if (name === 'theme.css' || name.startsWith('theme-starter') || file.includes('presets'))
      continue;
    styleFiles.push(file);
  }
  const statePairs = collectStatePairs(uiSrc, styleFiles);
  const variantPairs = collectVariantPairs(uiSrc, styleFiles);

  const failures = [];
  const findings = []; // informational, never fails
  let pairsChecked = 0;

  for (const { name, palette, source } of themes) {
    const missing = Object.entries(PALETTE_TOKENS)
      .filter(([short]) => !palette[short])
      .map(([, tokenName]) => tokenName);
    if (missing.length > 0) {
      failures.push(
        `[missing-token] ${source} theme '${name}' does not declare: ${missing.join(', ')}`,
      );
      continue;
    }

    for (const [label, aKey, bKey, threshold, gate] of PAIRS) {
      pairsChecked++;
      const ratio = contrastRatio(palette[aKey], palette[bKey]);
      const pass = ratio >= threshold;
      const line =
        `${name} — ${label}: ${ratio.toFixed(2)}:1 (need ${threshold}:1) ` +
        `[${palette[aKey]} vs ${palette[bKey]}]`;
      if (!pass) {
        (gate ? failures : findings).push(`${gate ? '[contrast]' : '[informational]'} ${line}`);
      }
    }
  }

  // The composited half. A theme's own block can override any of these, so the resolver is built
  // per theme rather than once.
  for (const { name, decls } of themes) {
    const resolve = makeResolver(layers, decls);
    for (const [label, labelToken, bgToken, groundTokens, threshold] of WASH_PAIRS) {
      const labelColour = resolve(labelToken);
      const wash = resolve(bgToken);
      if (labelColour === null || wash === null) {
        failures.push(
          `[unresolvable] ${name} — ${label}: ` +
            `${labelColour === null ? labelToken : bgToken} does not resolve to a colour
` +
            `      the token is misspelled, or its value is a syntax token-color.mjs does not read —
` +
            `      teach it that syntax rather than dropping the pair, or the state goes unchecked`,
        );
        continue;
      }

      for (const groundToken of groundTokens) {
        const ground = resolve(groundToken);
        if (ground === null) {
          failures.push(`[unresolvable] ${name} — ${label}: ground ${groundToken} has no colour`);
          continue;
        }
        pairsChecked++;
        const painted = over(wash, ground);
        const text = labelColour.a === 1 ? labelColour : over(labelColour, painted);
        const ratio = contrast(text, painted);
        if (ratio < threshold) {
          failures.push(
            `[contrast] ${name} — ${label} on ${groundToken.replace('--gog-', '')}: ` +
              `${ratio.toFixed(2)}:1 (need ${threshold}:1) ` +
              `[${toHex(text)} vs ${toHex(painted)}]`,
          );
        }
      }
    }
  }

  // The broad sweep: every state pair the stylesheets themselves state. Reported per rule with
  // the worst theme, since one line per theme for 11 themes would bury the finding.
  const sweepWorst = new Map();
  for (const { name, decls } of themes) {
    const resolve = makeResolver(layers, decls);
    const surface = resolve('--gog-surface-color');
    for (const state of statePairs) {
      const label = resolve(state.colour);
      const wash = resolve(state.bg);
      if (label === null || wash === null) continue; // reported once, below
      const restBg = state.restBg ? resolve(state.restBg) : null;
      const under = restBg && restBg.a === 1 ? restBg : surface;
      const ground = wash.a === 1 ? wash : over(wash, under);
      const text = label.a === 1 ? label : over(label, ground);
      const ratio = contrast(text, ground);
      pairsChecked++;
      const threshold = thresholdFor(state.selector);
      if (ratio >= threshold) continue;
      const key = `${state.file} ${state.selector}`;
      const worst = sweepWorst.get(key);
      if (!worst || ratio < worst.ratio)
        sweepWorst.set(key, { ratio, threshold, theme: name, text: toHex(text), ground: toHex(ground), state });
    }
  }
  for (const [key, w] of [...sweepWorst].sort((a, b) => a[1].ratio - b[1].ratio)) {
    failures.push(
      `[contrast] ${w.theme} — ${key}: ${w.ratio.toFixed(2)}:1 (need ${w.threshold}:1) ` +
        `[${w.text} vs ${w.ground}]
      ${w.state.colour} on ${w.state.bg}`,
    );
  }

  // The variant half of the sweep. Same reporting shape — worst theme per rule — because a
  // variant that fails usually fails in several themes and one line each buries the finding.
  const variantWorst = new Map();
  for (const { name, decls } of themes) {
    const surface = makeResolver(layers, decls)('--gog-surface-color');
    for (const candidate of variantPairs) {
      const resolve = makeResolver(layers, new Map([...decls, ...candidate.variantEnv]));
      const plain = makeResolver(layers, new Map([...decls, ...candidate.baseEnv]));
      const label = resolve(candidate.colour);
      const wash = resolve(candidate.bg);
      if (label === null || wash === null) continue;
      // A modifier that changes nothing this rule paints is a size class, or a state that only
      // moves a shadow. The unmodified pair is already measured by the sweep above.
      const plainLabel = plain(candidate.colour);
      const plainWash = plain(candidate.bg);
      if (
        !candidate.isRest &&
        plainLabel &&
        plainWash &&
        toHex(plainLabel) === toHex(label) &&
        toHex(plainWash) === toHex(wash)
      )
        continue;
      const restBg = candidate.restBg ? resolve(candidate.restBg) : null;
      const under = restBg && restBg.a === 1 ? restBg : surface;
      const ground = wash.a === 1 ? wash : over(wash, under);
      const text = label.a === 1 ? label : over(label, ground);
      const ratio = contrast(text, ground);
      pairsChecked++;
      const threshold = thresholdFor(candidate.selector);
      if (ratio >= threshold) continue;
      const key = `${candidate.file} ${candidate.selector}`;
      const worst = variantWorst.get(key);
      if (!worst || ratio < worst.ratio)
        variantWorst.set(key, {
          ratio,
          threshold,
          theme: name,
          text: toHex(text),
          ground: toHex(ground),
          candidate,
        });
    }
  }
  for (const [key, w] of [...variantWorst].sort((a, b) => a[1].ratio - b[1].ratio)) {
    failures.push(
      `[contrast] ${w.theme} — ${key}: ${w.ratio.toFixed(2)}:1 (need ${w.threshold}:1) ` +
        `[${w.text} vs ${w.ground}]
      ${w.candidate.colour} on ${w.candidate.bg}`,
    );
  }

  if (findings.length > 0) {
    console.log(`${findings.length} informational finding(s), not gated (see script header):\n`);
    for (const f of findings) console.log(`  ${f}`);
    console.log();
  }

  if (failures.length > 0) {
    console.error('Contrast check FAILED\n');
    for (const f of failures) console.error(`  ${f}`);
    console.error(
      `\n${failures.length} problem(s) across ${themes.length} theme(s), ${pairsChecked} pair(s) checked. ` +
        "See docs/themes.md, iteration 2, and this script's header for what each pair means.",
    );
    process.exit(1);
  }

  console.log(
    `Contrast check passed — ${themes.length} theme(s), ${pairsChecked} pair(s) checked, all at or above their WCAG threshold.`,
  );
}

main();
