#!/usr/bin/env node
/**
 * `npm run suggest:color -- <ink> <ground> [target] [--allow-chroma-loss]`
 *
 * Answers the question a failing contrast check leaves open: *what value would have passed?*
 *
 * Both arguments may be a hex literal or a `--gog-*` token name; a token is resolved per theme,
 * so `npm run suggest:color -- --gog-input-field-border --gog-background-color 3` prints one line
 * per shipped theme with the nearest passing colour for each. That is the shape the fixes
 * actually need — a palette problem is almost never in one theme alone.
 *
 * The walk itself is in `oklch.mjs`: hold hue and chroma, move lightness, verify by measuring.
 * See that file for why sRGB darkening is not good enough.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import { buildLayers, makeResolver, parseDecls, toHex as rgbaToHex } from './token-color.mjs';
import { contrastRatio, hexToRgb, rgbToOklch, solve, toHex } from './oklch.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(rootDir, 'projects/gleks/ui/src');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * A handful of cases with answers that do not depend on the palette, run on every invocation.
 * The bisection is the kind of code that returns plausible numbers when it is subtly wrong —
 * `check:state-specificity` self-tests its arithmetic for the same reason.
 */
function selfTest() {
  const cases = [
    // Already passing: returned unchanged, never "improved".
    { ink: '#000000', ground: '#ffffff', target: 4.5, expect: 'unchanged' },
    // A light ground darkens the ink; a dark ground lightens it.
    { ink: '#e2e8f0', ground: '#f8fafc', target: 3, expect: 'darker' },
    { ink: '#3d3122', ground: '#0d0b08', target: 3, expect: 'lighter' },
  ];
  for (const { ink, ground, target, expect } of cases) {
    const r = solve(ink, ground, target);
    if (!r.ok) throw new Error(`self-test: ${ink} on ${ground} at ${target}:1 found nothing`);
    if (r.ratio < target - 1e-9) {
      throw new Error(`self-test: returned ${r.hex} at ${r.ratio.toFixed(3)}:1, under ${target}`);
    }
    const before = rgbToOklch(hexToRgb(ink)).L;
    const after = rgbToOklch(hexToRgb(r.hex)).L;
    if (expect === 'unchanged' && r.hex !== ink) {
      throw new Error(`self-test: ${ink} already passes but came back ${r.hex}`);
    }
    if (expect === 'darker' && after >= before) {
      throw new Error(`self-test: ${ink} on a light ground should darken, got ${r.hex}`);
    }
    if (expect === 'lighter' && after <= before) {
      throw new Error(`self-test: ${ink} on a dark ground should lighten, got ${r.hex}`);
    }
  }
}

function themeBlocks(raw, source) {
  const out = [];
  const css = stripComments(raw);
  const re = /(?::root)?\[data-theme=['"]([a-z-]+)['"]\][^{]*\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ name: m[1], decls: parseDecls(m[2]), source });
  return out;
}

async function loadThemes() {
  const themeCss = readFileSync(path.join(uiSrc, 'styles/theme.css'), 'utf8');
  const themes = themeBlocks(themeCss, 'theme.css');
  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles/presets'),
    withFileTypes: true,
  })) {
    if (!entry.isFile() || entry.name.includes('.fonts.')) continue;
    const file = path.join(entry.parentPath ?? entry.path, entry.name);
    themes.push(...themeBlocks(readFileSync(file, 'utf8'), `presets/${entry.name}`));
  }
  const seen = new Set();
  return {
    layers: buildLayers(themeCss),
    themes: themes
      .filter((t) => !seen.has(t.name) && seen.add(t.name))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

const isHex = (s) => /^#[0-9a-fA-F]{3,8}$/.test(s);

async function main() {
  selfTest();

  const argv = process.argv.slice(2);
  const allowChromaLoss = argv.includes('--allow-chroma-loss');
  const [inkArg, groundArg, targetArg] = argv.filter((a) => !a.startsWith('--allow'));
  const target = Number(targetArg ?? 4.5);

  if (!inkArg || !groundArg || !Number.isFinite(target)) {
    console.error(
      'usage: npm run suggest:color -- <ink> <ground> [target] [--allow-chroma-loss]\n' +
        '  ink/ground: a hex literal or a --gog-* token name\n' +
        '  target:     the ratio to clear (default 4.5; use 3 for non-text, WCAG 1.4.11)',
    );
    process.exit(2);
  }

  if (isHex(inkArg) && isHex(groundArg)) {
    const r = solve(inkArg, groundArg, target, { allowChromaLoss });
    const before = contrastRatio(hexToRgb(inkArg), hexToRgb(groundArg));
    console.log(
      `${inkArg} on ${groundArg}: ${before.toFixed(2)}:1 → ` +
        `${r.ok ? r.hex : 'NO SOLUTION'} ${r.ratio.toFixed(2)}:1  (${r.note})`,
    );
    process.exit(r.ok ? 0 : 1);
  }

  const { layers, themes } = await loadThemes();
  const resolveArg = (resolve, arg) => (isHex(arg) ? arg : rgbaToHex(resolve(arg)));

  console.log(`${inkArg} on ${groundArg}, target ${target}:1\n`);
  let anyUnsolved = false;
  for (const { name, decls } of themes) {
    const resolve = makeResolver(layers, decls);
    let ink;
    let ground;
    try {
      ink = resolveArg(resolve, inkArg);
      ground = resolveArg(resolve, groundArg);
    } catch {
      console.log(`  ${name.padEnd(11)} unresolvable in this theme`);
      continue;
    }
    const before = contrastRatio(hexToRgb(ink), hexToRgb(ground));
    if (before >= target) {
      console.log(`  ${name.padEnd(11)} ${ink} on ${ground}  ${before.toFixed(2)}:1  ok`);
      continue;
    }
    const r = solve(ink, ground, target, { allowChromaLoss });
    if (!r.ok) anyUnsolved = true;
    console.log(
      `  ${name.padEnd(11)} ${ink} on ${ground}  ${before.toFixed(2)}:1  →  ` +
        `${r.ok ? r.hex : 'NO SOLUTION'}  ${r.ratio.toFixed(2)}:1   ${r.note}`,
    );
  }
  process.exit(anyUnsolved ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
