#!/usr/bin/env node
// D7's survey — L8 (fluid interpolation, adopted only as the four-token viewport exception) and
// L9 (measure: 45-75 characters per line, adopted for wrapping text). Follows the project's own
// rule for every law before it: `survey:geometry` came before D1/D3/D6 because a threshold chosen
// before seeing the spread is a threshold chosen to flatter what is already there, and D4/D8
// needed a *second* survey because the first read theme.css only. This one reads both from the
// first line, for the same reason.
//
// It reports; it does not fail. `docs/component-geometry.md`'s "D7 — taken" section is written
// against this output, then `scripts/check-measure.mjs` gates the decision.
//
// Usage:
//   node scripts/survey-measure.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLengthLayers, makeLengthResolver } from './geometry-length.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeCssPath = path.join(root, 'projects/gleks/ui/src/styles/theme.css');

/**
 * `1ch` as a fraction of `1em`, for the library's default `--gog-font-body` stack
 * (`system-ui, -apple-system, "Segoe UI", sans-serif`).
 *
 * L9 states the textbook figure (~0.5) as an assumption, not a fact, and says the check must
 * name it rather than hide it. **Measured live, 2026-09-09, Chrome on Windows**: a `<div>` sized
 * to `1ch` and to `1em` at eight font sizes (11, 12, 14, 16, 18, 20, 32, 48px) returned a constant
 * 0.5391 at every size — this stack's "0" is wider than the textbook half-em. No headless-browser
 * or canvas dependency exists in this toolchain (`jsdom` does not lay out real glyphs), so this is
 * a recorded measurement, the same way `token-color.mjs`'s Chrome `color-mix()` quirk is: a
 * constant with a date and a method, not a library call. If the font stack changes, re-measure —
 * do not assume the ratio moved with it without checking.
 */
const CH_PER_EM = 0.5391;
const CH_PER_EM_MEASURED =
  '2026-09-09, Chrome/Windows, system-ui stack, 8 sizes 11-48px, constant to 4 places';

/**
 * Every `*-max-width` token in `theme.css`, with: the font-size token that governs the text inside
 * it (traced by hand — grep for the reader, then confirmed live via `getComputedStyle` in
 * `ui-showcase`, per the project's "measured in a browser, not read off the stylesheet" rule),
 * whether that text wraps, and the reason. `null` font means "traced and found unreliable" — see
 * the confirmation-dialog entry.
 */
const CAPS = [
  {
    token: '--gog-tooltip-max-width',
    fontToken: '--gog-tooltip-font-size',
    wraps: true,
    reason: 'a bubble around prose',
  },
  {
    token: '--gog-menu-max-width',
    fontToken: '--gog-menu-item-font-size',
    wraps: false,
    reason: 'menu items do not wrap (L9 table, docs/component-geometry.md)',
  },
  {
    token: '--gog-toast-max-width',
    fontToken: '--gog-toast-message-font-size',
    wraps: true,
    reason: 'a message that may run long',
  },
  {
    token: '--gog-confirmation-dialog-max-width',
    fontToken: null,
    wraps: true,
    reason:
      'the description carries a "body-sm" class with no CSS definition anywhere in the library ' +
      '(confirmed: no `.body-sm` / `.heading-md` rule in styles/*.css or lib/**/*.scss) — the text ' +
      'renders at whatever the browser inherits (measured live: 16px, not the --gog-text-sm the ' +
      "class name implies). Filed as a defect in docs/backlog.md; not this branch's to fix. The ch " +
      'figure below uses the real 16px so the cap does not shrink if the class is later wired up ' +
      '(it would then read a smaller token and the text would only get roomier).',
  },
  {
    token: '--gog-autocomplete-panel-max-width',
    fontToken: null,
    wraps: false,
    reason: 'text-overflow: ellipsis; white-space: nowrap on the option row (confirmed in scss)',
  },
  {
    token: '--gog-multiselect-panel-max-width',
    fontToken: null,
    wraps: false,
    reason: 'text-overflow: ellipsis; white-space: nowrap on the option row (confirmed in scss)',
  },
  {
    token: '--gog-select-panel-max-width',
    fontToken: null,
    wraps: false,
    reason: 'text-overflow: ellipsis; white-space: nowrap on the option row (confirmed in scss)',
  },
];

/** Live-measured fallback for the one cap whose font token does not resolve. */
const LIVE_MEASURED_PX = new Map([['--gog-confirmation-dialog-max-width', 16]]);

/**
 * L8's exception: which caps are viewport-scoped (positioned or reachable near a screen edge) and
 * which token already governs that component's own edge inset, so the clamp reads a token instead
 * of a new literal. `null` means no such token exists on this component today.
 */
const EDGE_INSET = new Map([
  ['--gog-toast-max-width', '--gog-toast-stack-padding'], // already the container's own edge padding
  ['--gog-confirmation-dialog-max-width', '--gog-dialog-backdrop-padding'], // the backdrop it renders inside
  ['--gog-menu-max-width', null], // no edge-inset token on this component today
  ['--gog-tooltip-max-width', null],
]);

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const resolver = makeLengthResolver(layers, new Map(), { density: 1 });

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const heading = (t) => `\n${t}\n${'-'.repeat(t.length)}`;

console.log(`1ch ≈ ${CH_PER_EM}em (measured ${CH_PER_EM_MEASURED})`);

console.log(heading('Every *-max-width token'));
for (const cap of CAPS) {
  const width = resolver.declaration(cap.token);
  if (width.px === null) {
    console.log(`  ${cap.token}: UNRESOLVED — ${width.why}`);
    continue;
  }

  let fontPx = null;
  let fontNote = '';
  if (cap.fontToken) {
    const font = resolver.declaration(cap.fontToken);
    fontPx = font.px;
    fontNote =
      font.px === null
        ? ` (${cap.fontToken} unresolved: ${font.why})`
        : ` (${cap.fontToken} = ${fmt(font.px)}px)`;
  } else if (LIVE_MEASURED_PX.has(cap.token)) {
    fontPx = LIVE_MEASURED_PX.get(cap.token);
    fontNote = ` (font untokenized — live-measured ${fontPx}px, see reason)`;
  }

  const wrapNote = cap.wraps ? 'WRAPS' : 'non-wrapping (outside L9)';
  console.log(`  ${cap.token}: ${fmt(width.px)}px — ${wrapNote}${fontNote}`);
  console.log(`    reason: ${cap.reason}`);

  if (cap.wraps && fontPx) {
    const chCount = width.px / (CH_PER_EM * fontPx);
    const band =
      chCount < 45
        ? 'UNDER the 45ch floor'
        : chCount > 75
          ? 'OVER the 75ch ceiling'
          : 'in band (45-75)';
    console.log(`    measure: ≈${fmt(chCount)}ch — ${band}`);
  } else if (cap.wraps) {
    console.log(`    measure: cannot compute — no font size resolved`);
  }

  const edgeToken = EDGE_INSET.get(cap.token);
  if (edgeToken === undefined) continue;
  if (edgeToken === null) {
    console.log(
      `    L8 edge inset: no existing token on this component — a clamp margin would read var(--gog-space-16) directly`,
    );
  } else {
    const inset = resolver.declaration(edgeToken);
    console.log(
      `    L8 edge inset: ${edgeToken} = ${inset.px === null ? 'UNRESOLVED' : fmt(inset.px) + 'px'} (this component's own edge padding — reuse it, do not invent a new margin token)`,
    );
  }
}

console.log(heading("The wrapping / non-wrapping partition (L9's own deliverable)"));
for (const cap of CAPS) {
  console.log(`  ${cap.wraps ? 'WRAPS    ' : 'no-wrap  '} ${cap.token} — ${cap.reason}`);
}

console.log(heading('L8 — zero clamp()/vw/vi in the library today'));
const anyFluid = /clamp\(|(?<!--gog-)\bvw\b|\bvi\b/.test(themeCss);
console.log(`  ${anyFluid ? 'FOUND some — re-check the claim' : 'confirmed: none'}`);

console.log('\nDone. Take D7 in docs/component-geometry.md against this output.');
