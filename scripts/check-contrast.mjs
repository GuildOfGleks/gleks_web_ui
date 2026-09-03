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
 * ## Two halves, since 21.8.1
 *
 * `PAIRS` compares **palette** tokens: hex against hex, straight out of a theme block. That is the
 * foundation, and it is blind to a label sitting on a `color-mix()` wash, because the wash has no
 * colour until it is composited over whatever it covers. Two real AA failures went through that
 * gap and were found by hand — the outline button's hover label, failing in all 11 themes, and
 * the ghost button's, failing in three.
 *
 * `WASH_PAIRS` closes it. `token-color.mjs` resolves a component token the way a browser does
 * (theme block, then the `@supports` mixed layer, then the derived layer, then the literals),
 * composites it over the ground that component actually sits on, and measures the label against
 * the result. It found 24 problems on its first run, every one of them real.
 *
 * All 11 shipped themes now pass all 132 pairs. **A new preset that does not is what this is
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
  // And one press later. 21.8.1 gave the press a colour of its own — `--gog-accent-dim` is
  // `--gog-button-primary-active-bg` — because the press used to be a transform that
  // `prefers-reduced-motion` switched off, leaving no feedback at all. That makes `dim` a fill
  // under a label for the first time; it was only ever a field border before, which is why the
  // two `accentDim` pairs below ask for 3.0 and this one asks for 4.5. Added with the state
  // itself rather than after a report, which is the lesson the pair above is here to teach.
  ['accentText/accentDim(press)', 'accentText', 'accentDim', 4.5, true],
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
 * Every entry here is a state that shipped or changed in 21.8.1, plus the hover it steps past,
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
  ['chip hover', '--gog-chip-color', '--gog-chip-hover-bg', ['--gog-chip-bg'], 4.5],
  ['chip press', '--gog-chip-color', '--gog-chip-press-bg', ['--gog-chip-bg'], 4.5],
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
