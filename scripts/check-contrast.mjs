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
 * ## What this found (2026-08-29) — recorded, not silently fixed
 *
 * Real AA failures, on the two threshold groups above, across the five shipped themes:
 * `mutedText`/`background` and `mutedText`/`surface` fail in `slate` (barely, 4.39:1),
 * `one-dark` (2.32–2.55:1) and `one-light` (2.47–2.58:1); `accentText`/`accent` fails in `light`
 * (4.44:1, essentially at the line) and `one-light` (4.05:1). `one-dark`/`one-light` deliberately
 * reproduce a real, recognisable third-party editor palette — see their own file comments — so
 * fixing this is a design decision about that fidelity promise, not a script's call to make.
 * Filed in `docs/backlog.md`. **Not yet wired into CI**: doing so with real, un-fixed findings
 * already in the shipped defaults would turn CI permanently red over a known, tracked condition
 * nobody has decided how to resolve, which trains everyone to ignore it — worse than not checking
 * at all. Wire the `check:contrast` step into `.github/workflows/ci.yml` once these are resolved
 * (or explicitly accepted and this comment is updated to say why); until then run it by hand.
 *
 * Usage: node scripts/check-contrast.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

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
  accentDim: '--gog-accent-dim',
  border: '--gog-border-color', // informational only — see header
};

/** [label, colorA, colorB, threshold, gate]. gate: false = printed, never fails the check. */
const PAIRS = [
  ['text/background', 'text', 'background', 4.5, true],
  ['text/surface', 'text', 'surface', 4.5, true],
  ['mutedText/background', 'mutedText', 'background', 4.5, true],
  ['mutedText/surface', 'mutedText', 'surface', 4.5, true],
  ['accentText/accent', 'accentText', 'accent', 4.5, true],
  ['accentDim(field border)/background', 'accentDim', 'background', 3.0, true],
  ['accentDim(field border)/surface', 'accentDim', 'surface', 3.0, true],
  ['accent(focus ring)/background', 'accent', 'background', 3.0, true],
  ['accent(focus ring)/surface', 'accent', 'surface', 3.0, true],
  ['border(decorative)/background', 'border', 'background', 3.0, false],
  ['border(decorative)/surface', 'border', 'surface', 3.0, false],
];

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
    themes.push({ name, palette, source });
  }
  return themes;
}

async function main() {
  const themeCss = readFileSync(path.join(uiSrc, 'styles/theme.css'), 'utf8');
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
