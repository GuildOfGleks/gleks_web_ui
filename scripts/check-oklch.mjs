#!/usr/bin/env node
/**
 * The perceptual half of the palette gate — what a contrast ratio cannot say.
 *
 * `check:contrast` computes WCAG's ratio, which is a luminance formula. It says nothing about
 * whether a ramp *looks* evenly stepped, and it scores two wildly different hues as identical
 * when their luminance matches. Every colour finding in 21.10.0 came out of that gap, and
 * `docs/backlog.md` asked for this half in OKLCH, where lightness, chroma and hue are separable.
 *
 * ## Three gated rules, and one number that is reported rather than gated
 *
 * Each threshold was set after measuring all eleven shipped palettes, never before — a threshold
 * chosen in advance is a threshold chosen to flatter what is already there. The observed spread is
 * quoted beside each so the next reader can see how much room the gate leaves.
 *
 *   **R1 — a state change must be perceptible.** `--gog-accent-bright` is the hover fill and
 *   `--gog-accent-dim` the pressed/boundary step; both have to read as *different* from
 *   `--gog-accent-color` or the state is invisible. Gated at ΔL ≥ 0.03, which is roughly the
 *   just-noticeable difference for an area of flat colour. Observed on the hover step: 0.049 to
 *   0.092, comfortable everywhere. On the dim step: 0.023 to 0.195 — and the low end is
 *   `one-light`, which is the finding this rule was written by.
 *
 *   **The rule is deliberately NOT "the ramp is monotonic in L", which `docs/backlog.md` proposed
 *   and the measurement disproved.** Eight of the eleven palettes are non-monotonic and eight are
 *   right to be: on a light ground the hover fill is *darker* than the rest state, because a gold
 *   light enough to read as "a brighter gleam" cannot carry white text — that is a decision taken
 *   in 21.7.0 with the numbers behind it. Monotonic-in-L would have failed the themes that got it
 *   right. What is checkable is that the step exists, not which way it points. Nor is
 *   `--gog-accent-pale` part of the ramp: it is a wash *behind* content, sitting at L 0.88–0.96 on
 *   light themes, and including it made every light palette look broken.
 *
 *   **R2 — a chroma band per role.** A status colour that is nearly grey stops reading as a
 *   status; one at maximum chroma reads as neon in a parchment theme. Gated at 0.04 ≤ C ≤ 0.25.
 *   Observed 0.055 (`parchment`'s info) to 0.230 (`slate`'s accent). Both bounds catch the absurd
 *   rather than enforce a taste: `ledger` and `parchment` are deliberately muted and must stay
 *   able to be, and `primeng` and `slate` are deliberately vivid.
 *
 *   **R3 — two statuses must be tellable apart, and greyscale is the test.** Hue alone is not
 *   enough (a reader with achromatopsia sees none of it) and lightness alone is not enough (two
 *   colours can share a luminance and differ obviously). So the rule is a disjunction: every pair
 *   of the four status colours differs by **≥15° of hue or ≥0.10 of L**. Observed closest pairs
 *   run 21.7° to 62.2° — except `terminal`, whose success and info sit **4.6° apart** with 0.03 of
 *   L between them, which is two statuses one badge cannot distinguish from the other in any
 *   rendering. That is the second finding this file was written by.
 *
 *   **Reported, not gated: ΔL between the page and the surface stacked on it.** It runs 0.0149
 *   (`one-light`) to 0.1325 (`ledger`), and the low end is not a defect: those themes mark the
 *   tier with a border rather than with lightness, which is a legitimate answer and the one
 *   `material` and `primeng` are built on. Gating it would fail three themes for a choice they
 *   made on purpose. The thing that actually has to be visible — the boundary — is gated by
 *   `check:contrast`'s boundary sweep, against the ratio *and* now against this number's own
 *   logic. Printed so the audit keeps the figure rather than dropping it.
 *
 * Usage: node scripts/check-oklch.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import { hexToRgb, rgbToOklch } from './oklch.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(rootDir, 'projects/gleks/ui/src');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/** ΔL below which a change in a flat area of colour stops being noticeable. */
const MIN_STATE_STEP = 0.03;
const CHROMA_MIN = 0.04;
const CHROMA_MAX = 0.25;
const MIN_STATUS_HUE = 15;
const MIN_STATUS_L = 0.1;

const STATUSES = ['success', 'warning', 'danger', 'info'];

/**
 * Every palette block, merged per theme name. A preset states its palette in one block and
 * `theme.css` states light and dark in theirs; `:root`'s literals are the light defaults and are
 * folded into `light` rather than reported as a theme of their own.
 */
function palettes(raw) {
  const out = [];
  const css = stripComments(raw);
  const re =
    /(?::root(?:\[data-theme=['"]([a-z-]+)['"]\])?|\[data-theme=['"]([a-z-]+)['"]\])[^{]*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(css))) {
    const name = m[1] ?? m[2] ?? 'root';
    const decls = {};
    for (const d of m[3].matchAll(/(--gog-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
      decls[d[1]] = d[2];
    }
    if (Object.keys(decls).length) out.push({ name, decls });
  }
  return out;
}

const oklch = (hex) => rgbToOklch(hexToRgb(hex));
const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

async function main() {
  const themeCss = readFileSync(path.join(uiSrc, 'styles/theme.css'), 'utf8');
  const blocks = palettes(themeCss);
  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles/presets'),
    withFileTypes: true,
  })) {
    if (!entry.isFile() || entry.name.includes('.fonts.')) continue;
    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    blocks.push(...palettes(readFileSync(file, 'utf8')));
  }

  const merged = new Map();
  for (const { name, decls } of blocks) {
    const key = name === 'root' ? 'light' : name;
    merged.set(key, { ...(merged.get(key) ?? {}), ...decls });
  }

  const failures = [];
  const findings = [];
  let checks = 0;

  for (const [theme, d] of [...merged].sort((a, b) => a[0].localeCompare(b[0]))) {
    const at = (token) => (d[token] ? oklch(d[token]) : null);

    // ── R1 — the two state steps off the accent are perceptible ──────────────────────────────
    const accent = at('--gog-accent-color');
    for (const [label, token] of [
      ['hover', '--gog-accent-bright'],
      ['pressed / boundary', '--gog-accent-dim'],
    ]) {
      const step = at(token);
      if (!accent || !step) continue;
      checks++;
      const dL = Math.abs(step.L - accent.L);
      if (dL < MIN_STATE_STEP) {
        failures.push(
          `[R1 state step] ${theme} — ${token.replace('--gog-', '')} is ${dL.toFixed(3)} of ` +
            `lightness from the accent (need ${MIN_STATE_STEP}); the ${label} state reads as the ` +
            `same colour\n      ${d[token]} against ${d['--gog-accent-color']} — ` +
            `\`npm run suggest:color\` will not help here, this is a step to widen by hand`,
        );
      }
    }

    // ── R2 — chroma stays inside the band ────────────────────────────────────────────────────
    for (const role of [...STATUSES, 'accent']) {
      const token = `--gog-${role}-color`;
      const c = at(token);
      if (!c) continue;
      checks++;
      if (c.C < CHROMA_MIN) {
        failures.push(
          `[R2 chroma] ${theme} — ${token.replace('--gog-', '')} has chroma ${c.C.toFixed(3)} ` +
            `(need ≥ ${CHROMA_MIN}); it is effectively grey and stops reading as a status`,
        );
      } else if (c.C > CHROMA_MAX) {
        failures.push(
          `[R2 chroma] ${theme} — ${token.replace('--gog-', '')} has chroma ${c.C.toFixed(3)} ` +
            `(max ${CHROMA_MAX}); at this saturation it reads as neon rather than as this theme`,
        );
      }
    }

    // ── R3 — the four statuses are tellable apart, in colour and in greyscale ────────────────
    const present = STATUSES.filter((s) => d[`--gog-${s}-color`]);
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const a = at(`--gog-${present[i]}-color`);
        const b = at(`--gog-${present[j]}-color`);
        checks++;
        const dh = hueGap(a.h, b.h);
        const dL = Math.abs(a.L - b.L);
        if (dh < MIN_STATUS_HUE && dL < MIN_STATUS_L) {
          failures.push(
            `[R3 status pair] ${theme} — ${present[i]} and ${present[j]} are ` +
              `${dh.toFixed(1)}° of hue and ${dL.toFixed(3)} of lightness apart ` +
              `(need ${MIN_STATUS_HUE}° or ${MIN_STATUS_L})\n` +
              `      ${d[`--gog-${present[i]}-color`]} vs ${d[`--gog-${present[j]}-color`]} — ` +
              `a badge in one cannot be told from a badge in the other, and greyscale does not ` +
              `separate them either`,
          );
        }
      }
    }

    // ── Reported: how far apart the two surface tiers sit in lightness ───────────────────────
    if (d['--gog-background-color'] && d['--gog-surface-color']) {
      const dL = Math.abs(oklch(d['--gog-surface-color']).L - oklch(d['--gog-background-color']).L);
      findings.push(
        `${theme.padEnd(11)} page → surface ΔL ${dL.toFixed(4)}` +
          (dL < 0.02 ? '  (the tier is carried by its border, not by lightness)' : ''),
      );
    }
  }

  for (const line of findings) console.log(`  [informational] ${line}`);

  if (failures.length) {
    console.error(`\nOKLCH palette check failed — ${failures.length} problem(s).\n`);
    for (const f of failures) console.error(`  ${f}\n`);
    console.error("See this script's header for what each rule measures and why.\n");
    process.exit(1);
  }

  console.log(
    `\nOKLCH palette check passed — ${merged.size} theme(s), ${checks} check(s): ` +
      `state steps perceptible, chroma inside the band, every status pair tellable apart.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
