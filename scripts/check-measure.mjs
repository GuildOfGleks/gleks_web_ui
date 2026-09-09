#!/usr/bin/env node
// D7 — L8 (fluid interpolation, adopted only as a four-token viewport exception) and L9 (measure:
// 45-75 characters per line, adopted for wrapping text only), gated. Written red on
// `npm run survey:measure`'s findings and folded into `check:geometry` once green, the sequence
// every law in this file has followed.
//
//   L8. VIEWPORT EXCEPTION  Chrome genuinely positioned against the viewport (not a container)
//                           caps itself with `min(<base>, calc(100vw - <margin> * 2))`, so it is
//                           never wider than the screen it floats over. The margin is never a
//                           literal — it reads the component's own edge-inset token where one
//                           exists, or the spacing scale directly where none does.
//
//   L9. MEASURE             A cap on text that *wraps* is expressed in `ch`, not `px` — a `px` cap
//                           beside a `rem` font size silently stops being a measure the moment a
//                           consumer raises the font. A cap on text that does not wrap is not a
//                           measure at all and stays in `px`.
//
// `docs/component-geometry.md`, "D7 — taken 2026-09-09", holds the decision and the survey it was
// taken against. This does not re-derive the numbers (`survey:measure` did that); it checks that
// the decision is what actually shipped, structurally, the same division of labour
// `check-radii.mjs` / `check-typography.mjs` keep from their own surveys.
//
// This resolver does not attempt generic `ch` arithmetic — a `ch` cap's real pixel width depends
// on *which* font-size token applies, which is per-declaration knowledge, not something
// `geometry-length.mjs`'s generic resolver carries. So this checks structure, against the CAPS
// table taken from `survey-measure.mjs`: unit, clamp shape and margin source, not the numbers
// themselves — those were decided by hand against the survey and are the plan's territory to
// revise, not this gate's.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLengthLayers } from './geometry-length.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themeCssPath = path.join(root, 'projects/gleks/ui/src/styles/theme.css');

/**
 * Every overlay cap D7 took a decision on, plus the three that were decided OUT of the clamp.
 * `wraps` decides L9's unit; `edgeToken` (a token name, or `'scale'` for a direct
 * `var(--gog-space-16)` margin) decides L8's clamp and its margin source; `clamp: false` means
 * the decision was to leave this one alone.
 */
const DECISIONS = [
  { token: '--gog-tooltip-max-width', wraps: true, clamp: true, edgeToken: 'scale' },
  { token: '--gog-menu-max-width', wraps: false, clamp: true, edgeToken: 'scale' },
  {
    token: '--gog-toast-max-width',
    wraps: true,
    clamp: true,
    edgeToken: '--gog-toast-stack-padding',
  },
  {
    token: '--gog-confirmation-dialog-max-width',
    wraps: true,
    clamp: true,
    edgeToken: '--gog-dialog-backdrop-padding',
  },
  { token: '--gog-autocomplete-panel-max-width', wraps: false, clamp: false },
  { token: '--gog-multiselect-panel-max-width', wraps: false, clamp: false },
  { token: '--gog-select-panel-max-width', wraps: false, clamp: false },
];

const themeCss = await fs.readFile(themeCssPath, 'utf8');
const layers = buildLengthLayers(themeCss);
const declared = new Map([...layers.rootLiteral, ...layers.derivedBase]);

const findings = [];
const add = (rule, token, message) => findings.push({ rule, token, message });

for (const decision of DECISIONS) {
  const raw = declared.get(decision.token);
  if (raw === undefined) {
    add(
      'A',
      decision.token,
      `not declared in theme.css — update DECISIONS in this script or restore the token`,
    );
    continue;
  }
  const value = raw.trim();

  // ── Rule B: a wrapping cap's base is a measure (ch), a non-wrapping cap's is not ────────────
  if (decision.wraps) {
    if (!/(?:^|[\s(,])[\d.]+ch\b/.test(value)) {
      add('B', decision.token, `wraps (L9 applies) but its base value is not in ch: ${value}`);
    }
  } else if (/[\d.]+ch\b/.test(value)) {
    add('B', decision.token, `does not wrap (outside L9) but its base value is in ch: ${value}`);
  }

  // ── Rule C: the clamp decision shipped, or explicitly did not ───────────────────────────────
  const hasClamp = /min\(\s*[\d.]+(?:ch|px)\s*,\s*calc\(\s*100vw\s*-/.test(value);
  if (decision.clamp && !hasClamp) {
    add(
      'C',
      decision.token,
      `D7 took the viewport clamp for this token but it is not min(<base>, calc(100vw - ...)): ${value}`,
    );
  }
  if (!decision.clamp && hasClamp) {
    add(
      'C',
      decision.token,
      `D7 left this token out of the viewport clamp (docs/component-geometry.md, "D7 — taken") but it now has one: ${value} — update the decision doc and this script if that changed on purpose`,
    );
  }

  // ── Rule D: the margin reads a token, never a literal ────────────────────────────────────────
  if (decision.clamp) {
    const margin = decision.edgeToken === 'scale' ? '--gog-space-16' : decision.edgeToken;
    const readsMargin = new RegExp(`calc\\(\\s*100vw\\s*-\\s*var\\(\\s*${margin}\\s*\\)`).test(
      value,
    );
    if (!readsMargin) {
      add(
        'D',
        decision.token,
        `the clamp's margin should read var(${margin}) (docs/component-geometry.md, "D7 — taken") but the declaration is: ${value}`,
      );
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────────────────────
if (findings.length > 0) {
  console.error(`Measure check FAILED — ${findings.length} finding(s):\n`);
  for (const f of findings.sort((a, b) => a.token.localeCompare(b.token))) {
    console.error(`  [rule ${f.rule}] ${f.token}: ${f.message}`);
  }
  console.error(
    `\ndocs/component-geometry.md, "D7 — taken". Re-run npm run survey:measure to re-derive the numbers.`,
  );
  process.exit(1);
}

console.log(
  `Measure check passed — L8's clamp and L9's ch unit across ${DECISIONS.length} overlay cap(s).`,
);
