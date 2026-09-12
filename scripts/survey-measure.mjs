#!/usr/bin/env node
// D7's survey — L8 (fluid interpolation, adopted only as a narrow viewport exception) and
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
      '`max-width` is declared on `.confirm-dialog`, which sets no font-size of its own and ' +
      'inherits the page root (16px) — the description now reads --gog-confirmation-dialog-' +
      "description-font-size (--gog-text-sm, 14px), but that is a *descendant*'s size, and a " +
      "`ch` cap resolves against the element `max-width` is declared on, not a descendant's. " +
      'Pointing fontToken at the description token here would be the same bug the toast fix ' +
      'caught (docs/component-geometry.md, "A fourth finding"): measuring the cap against a font ' +
      'nothing on `.confirm-dialog` itself reads. 16px stays live-measured rather than traced to ' +
      'a token because `.confirm-dialog` reads none — it is inheritance, not an unwired class, ' +
      'now that the dead `heading-md`/`body-sm` classes are gone (docs/backlog.md, fixed). ' +
      "NOTE ON THE `measure:` LINE BELOW: it prints this entry's own declared 51ch, which is a " +
      'tautology for this token — the `ch` base and the width conversion both resolve against ' +
      "`.confirm-dialog`'s 16px, not the description's 14px, so the number below is not the " +
      'reading measure a viewer of the *description* experiences. That real number is computed ' +
      "by hand: 439.9px ÷ (0.5391 × 14px) ≈ 58ch, still inside L9's 45–75 band. Computing it in " +
      "the script would need a second font axis (the cap's own font vs. the wrapping text's), " +
      "which none of the other three entries need because their `ch` base and their text's font " +
      'are the same element — left as a documented gap rather than a feature grown for one entry.',
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
  {
    token: '--gog-calendar-max-width',
    fontToken: null,
    wraps: false,
    reason: 'max-content — not a cap at all, so neither law has anything to measure',
  },
];

/**
 * Live-measured fallback for the one cap whose governing element reads no font-size token of its
 * own. `.confirm-dialog` inherits the page root's 16px; do not repoint this at the description's
 * own font-size token once that is tokenized (see the CAPS entry's reason) — `max-width` is not
 * declared on the description.
 */
const LIVE_MEASURED_PX = new Map([['--gog-confirmation-dialog-max-width', 16]]);

/**
 * L8's exception: which caps are viewport-scoped (positioned or reachable near a screen edge) and
 * which token already governs that component's own edge inset, so the clamp reads a token instead
 * of a new literal. `null` means no such token exists on this component today.
 */
const EDGE_INSET = new Map([
  ['--gog-toast-max-width', '--gog-toast-stack-padding'], // already the container's own edge padding
  ['--gog-menu-max-width', null], // no edge-inset token on this component today
  ['--gog-tooltip-max-width', null],
  // The confirmation dialog is out of L8 entirely: `.gog-dialog__panel` already caps itself at
  // 90vw and `.gog-dialog__body` pads 20px a side inside it, so the space available to
  // `.confirm-dialog` is `0.9 * 100vw - 40px` — tighter than any `100vw - margin` clamp above an
  // 80px viewport. A clamp here would be a declaration that can never bind.
  ['--gog-confirmation-dialog-max-width', 'out-of-L8'],
]);

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const resolver = makeLengthResolver(layers, new Map(), { density: 1 });

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const heading = (t) => `\n${t}\n${'-'.repeat(t.length)}`;

console.log(`1ch ≈ ${CH_PER_EM}em (measured ${CH_PER_EM_MEASURED})`);

/**
 * The cap's own base term, in whatever unit it is written.
 *
 * Once D7 shipped, three of these tokens read `min(43ch, calc(100vw − …))` — a `ch` length and a
 * viewport unit, neither of which `geometry-length.mjs` can resolve (a `ch` needs to know which
 * element carries the property, a `vw` needs a viewport, and that file returns `null` with a reason
 * rather than guessing). So the survey reads the base term out of the declaration itself: it is the
 * first argument of the `min()`, or the whole value when there is no clamp. **This is why the
 * survey stayed useful after its own subject changed units** — the first version resolved to px and
 * only to px, and would have reported a 43px tooltip forever.
 */
function baseTerm(raw) {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  const inner = /^min\(\s*([^,]+),/.exec(text);
  const term = (inner ? inner[1] : text).trim();
  const m = /^([\d.]+)(ch|px|rem)$/.exec(term);
  if (!m) return null;
  return { n: Number(m[1]), unit: m[2] };
}

console.log(heading('Every *-max-width token'));
for (const cap of CAPS) {
  const raw = resolver.lookup(cap.token);
  const base = baseTerm(raw);
  if (base === null) {
    console.log(`  ${cap.token}: base term not a plain length — declared as: ${raw}`);
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

  // A `ch` base *is* the measure; a `px` base has to be divided by the width of a character in the
  // font that actually applies. Reporting both, always, so the two are never confused again.
  const chCount = base.unit === 'ch' ? base.n : fontPx ? base.n / (CH_PER_EM * fontPx) : null;
  const widthPx = base.unit === 'ch' ? (fontPx ? base.n * CH_PER_EM * fontPx : null) : base.n;
  const clamped = /min\(/.test(String(raw)) ? ', viewport-clamped' : '';

  const wrapNote = cap.wraps ? 'WRAPS' : 'non-wrapping (outside L9)';
  const widthNote = widthPx === null ? `${base.n}${base.unit}` : `${fmt(widthPx)}px`;
  console.log(
    `  ${cap.token}: ${widthNote} (${base.n}${base.unit}${clamped}) — ${wrapNote}${fontNote}`,
  );
  console.log(`    reason: ${cap.reason}`);

  if (cap.wraps && chCount !== null) {
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
  if (edgeToken === 'out-of-L8') {
    console.log(
      `    L8: out of the clamp — its own container already caps against the viewport, so a clamp here could never bind`,
    );
  } else if (edgeToken === null) {
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

// ── Every viewport unit in the library, wherever it lives ────────────────────────────────────
//
// Two bugs lived in the one line this replaces, and both flattered the answer. `\bvw\b` can never
// match `100vw`: `0` and `v` are both word characters, so there is no boundary between them, and
// the check printed "confirmed: none" while `theme.css` held four. And it read `theme.css` alone,
// so `dialog.component.html`'s `[style.max-width]="… ?? '90vw'"` was invisible — which is how
// "the only place `vw` appears in the library" reached both `README.md` and `CHANGELOG.md`, the two
// documents that ship inside the package. A claim about the whole library has to be measured
// against the whole library.
console.log(heading('Every viewport unit in the library'));
const sources = [['styles/theme.css', themeCss]];
const walk = async (dir) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    // CSS, SCSS and templates only. `.ts` was tried and dropped: `scroll.component.ts` calls a
    // JavaScript `clamp()` helper and `table.component.ts` names `'60vh'` in a JSDoc example, and
    // a survey that reports those as viewport geometry is a survey nobody re-runs.
    else if (/\.(css|scss|html)$/.test(entry.name) && !entry.name.includes('.spec.')) {
      sources.push([
        path.relative(root, full).replace(/\\/g, '/'),
        await fs.readFile(full, 'utf8'),
      ]);
    }
  }
};
await walk(path.join(root, 'projects/gleks/ui/src'));

const FLUID = /[\d.]+(?:vw|vh|vi|vb|vmin|vmax)\b|clamp\(/g;
let found = 0;
for (const [name, text] of sources) {
  if (name === 'styles/theme.css') continue; // counted through the full-path copy in the walk
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(FLUID)) {
      found++;
      console.log(`  ${name}:${i + 1} — ${m[0]} in: ${line.trim().slice(0, 100)}`);
    }
  });
}
console.log(
  `  ${found === 0 ? 'none' : `${found} occurrence(s) — any claim of "the only place" must account for all of them`}`,
);

console.log('\nDone. Take D7 in docs/component-geometry.md against this output.');
