/*
 * check-elevation.mjs — the elevation ladder holds together.
 *
 * Added with the ladder itself in 21.12.0 (docs/component-geometry.md, D5 / L10). Before it,
 * eleven themes hand-authored 22 shadow values with no relationship to each other: a dropdown
 * menu carried a modal dialog's shadow, `material` and `primeng` each gave their dialog the
 * elevation of a card, and the same panel sat at 4px of lift on the light theme and 10px on the
 * dark one. None of that was a bug anybody typed — every one of them is what happens when a
 * value has to be restated by hand in a tenth file.
 *
 * Three rules. The ladder's own arithmetic is deliberately NOT one of them: every step is the
 * same two layers with a single number changed, so it is asserted by construction, and a check
 * that re-derives it would only be re-typing it. What is checked is everything around the
 * ladder, which is where the drift actually lives.
 *
 *   A. Every theme declares the COMPLETE knob set.
 *      A custom property inherits. A theme that declares six of the ten silently picks up the
 *      other four from whatever scope encloses it — so `data-theme="light"` nested inside a dark
 *      page renders light-coloured surfaces with dark-weight shadows. This is not hypothetical:
 *      it is exactly what happened on the first run of the ladder, caught in a browser and not
 *      by any check that existed. A theme owns all ten or it owns none.
 *
 *   B. Every `*-shadow` token resolves to the ladder, or is a named exception.
 *      "Resolves to" means: `none`, a `var(--gog-elevation-N)` step, a composition of a step with
 *      the ring/highlight character layers, or an alias of another shadow token that itself
 *      resolves. Anything else is a hand-written shadow, which is the thing this family exists to
 *      abolish. The exception list is for tokens whose name says "shadow" but whose job is not
 *      elevation — an inset ring marking a pressed toggle, an accent glow on hover. Each entry
 *      names why, because an exception that states a reason is documentation and a threshold
 *      quietly relaxed is a check that stopped checking.
 *
 *   C. No theme file may hand-write a shadow at all.
 *      Rule B is about the token; this is about the preset. A preset's job is to turn knobs. The
 *      day one of them writes `--gog-panel-shadow: 0 10px 30px …` again, the family has a hole in
 *      it and every other theme's dialog silently stops matching.
 */

import fs from 'node:fs';
import path from 'node:path';

const STYLES = 'projects/gleks/ui/src/styles';
const THEME = path.join(STYLES, 'theme.css');
const PRESETS = path.join(STYLES, 'presets');

/** The full set a theme owns. Rule A checks for exactly these, per theme scope. */
const KNOBS = [
  'ink',
  'key-alpha',
  'ambient-alpha',
  'contact-blur',
  'key-x',
  'key-y',
  'key-blur',
  'ring-width',
  'highlight-ink',
  'highlight-alpha',
];

/** The six heights. Rule B accepts a reference to any of them. */
const STEPS = new Set(['0', '1', '2', '3', '4', '5'].map((n) => `--gog-elevation-${n}`));

/** The two composable character layers a surface may prepend to a step. */
const LAYERS = new Set(['--gog-elevation-ring', '--gog-elevation-highlight']);

/**
 * Tokens named `*-shadow` that are not elevation. Each says what it is instead, so the next
 * reader does not have to work out whether it was forgotten.
 */
const NOT_ELEVATION = new Map([
  [
    '--gog-button-primary-toggled-shadow',
    'an inset ring marking aria-pressed, not a height — see the token’s own comment',
  ],
  ['--gog-button-secondary-toggled-shadow', 'aliases the primary toggled ring'],
  ['--gog-button-outline-toggled-shadow', 'an inset ring marking aria-pressed'],
  ['--gog-button-ghost-toggled-shadow', 'aliases the outline toggled ring'],
  ['--gog-chip-selected-shadow', 'an inset ring marking a selected filter chip (21.9.0)'],
  [
    '--gog-button-primary-hover-shadow',
    'an accent glow on hover: feedback, and it does not lift the button',
  ],
  [
    '--gog-slider-thumb-shadow',
    'carries a COLOUR, not a shadow — the thumb’s glow ring composes it as ' +
      '`0 0 <glow-size> var(--gog-slider-thumb-shadow)`. Misnamed; renaming it is a ' +
      'deprecation cycle, filed in docs/backlog.md',
  ],
]);

const problems = [];
const fail = (where, msg) => problems.push({ where, msg });

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

/** Split a stylesheet into `{ selector, body }` blocks, comments already gone. */
function blocks(css) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

const declarations = (body) => {
  const out = [];
  const re = /(--gog-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(body))) out.push({ name: m[1], value: m[2].replace(/\s+/g, ' ').trim() });
  return out;
};

// ── Rule A — every theme scope declares all ten knobs ────────────────────────────────────────
//
// A scope counts as a theme if it declares any knob at all: that is the moment it takes
// ownership, and a partial set is the failure mode.
function checkKnobSets(file, css) {
  for (const { selector, body } of blocks(stripComments(css))) {
    const all = declarations(body)
      .map((d) => d.name)
      .filter((n) => n.startsWith('--gog-elevation-'))
      .map((n) => n.slice('--gog-elevation-'.length))
      .filter((k) => KNOBS.includes(k));
    const declared = new Set(all);
    if (declared.size === 0) continue;

    // A knob written twice in one scope: the later wins silently, so the earlier value is a
    // decision that reads as live and is not. This is not a hypothetical either — the script
    // that first filled these blocks in stacked three whole sets into `:root`, and the missing
    // -knob rule below caught only the neighbouring symptom.
    const seen = new Set();
    const duplicated = [...new Set(all.filter((k) => seen.has(k) || (seen.add(k), false)))];
    if (duplicated.length) {
      fail(
        `${file} — ${selector}`,
        `declares ${duplicated.map((k) => `--gog-elevation-${k}`).join(', ')} more than once` +
          '\n      The last one silently wins. Keep one declaration per knob per scope.',
      );
    }

    const missing = KNOBS.filter((k) => !declared.has(k));
    if (missing.length) {
      fail(
        `${file} — ${selector}`,
        `declares ${declared.size} of the ${KNOBS.length} elevation knobs; missing ` +
          missing.map((k) => `--gog-elevation-${k}`).join(', ') +
          '\n      A custom property inherits, so the missing ones resolve against whatever scope' +
          '\n      encloses this theme. Declare the whole set, even where a value equals the default.',
      );
    }
  }
}

// ── Rule B — every shadow token resolves to the ladder ───────────────────────────────────────
function resolvesToLadder(value, shadowTokens) {
  if (value === 'none') return true;
  const refs = [...value.matchAll(/var\(\s*(--gog-[a-z0-9-]+)/gi)].map((m) => m[1]);
  if (refs.length === 0) return false; // a literal shadow
  // Every reference must be a step, a character layer, or another shadow token that resolves.
  return refs.every(
    (r) =>
      STEPS.has(r) ||
      LAYERS.has(r) ||
      (shadowTokens.has(r) && !NOT_ELEVATION.has(r)) ||
      r === '--gog-border-color',
  );
}

function checkShadowTokens(css) {
  const decls = declarations(stripComments(css)).filter((d) => /-shadow[a-z0-9-]*$/.test(d.name));
  const names = new Set(decls.map((d) => d.name));
  for (const { name, value } of decls) {
    if (NOT_ELEVATION.has(name)) continue;
    if (!resolvesToLadder(value, names)) {
      fail(
        `theme.css — ${name}`,
        `is a hand-written shadow: \`${value}\`` +
          '\n      Point it at a step (`var(--gog-elevation-3)`), optionally composed with' +
          '\n      `--gog-elevation-ring` or `--gog-elevation-highlight`. If it is not a height at' +
          '\n      all, add it to NOT_ELEVATION in this script with the reason it is not.',
      );
    }
  }
}

// ── Rule C — a preset turns knobs and writes no shadows ──────────────────────────────────────
function checkPresetsWriteNoShadows() {
  for (const file of fs.readdirSync(PRESETS).filter((f) => f.endsWith('.css'))) {
    const css = stripComments(fs.readFileSync(path.join(PRESETS, file), 'utf8'));
    for (const { name, value } of declarations(css)) {
      if (!/-shadow[a-z0-9-]*$/.test(name)) continue;
      if (NOT_ELEVATION.has(name)) continue;
      fail(
        `presets/${file} — ${name}`,
        `a preset hand-writes a shadow: \`${value}\`` +
          '\n      Presets turn the ten knobs; the ladder does the rest. A hand-written value here' +
          '\n      is how this theme’s dialog stops matching every other theme’s dialog.',
      );
    }
    checkKnobSets(`presets/${file}`, fs.readFileSync(path.join(PRESETS, file), 'utf8'));
  }
}

const themeCss = fs.readFileSync(THEME, 'utf8');
checkKnobSets('theme.css', themeCss);
checkShadowTokens(themeCss);
checkPresetsWriteNoShadows();

if (problems.length) {
  console.error(`\nElevation check failed — ${problems.length} problem(s).\n`);
  for (const { where, msg } of problems) console.error(`  [${where}]\n      ${msg}\n`);
  console.error('See docs/component-geometry.md, D5 — "Shadow as two lights".\n');
  process.exit(1);
}

const themeScopes = blocks(stripComments(themeCss)).filter((b) =>
  /--gog-elevation-ink\s*:/.test(b.body),
).length;
const presetScopes = fs
  .readdirSync(PRESETS)
  .filter((f) => f.endsWith('.css'))
  .filter((f) =>
    /--gog-elevation-ink\s*:/.test(stripComments(fs.readFileSync(path.join(PRESETS, f), 'utf8'))),
  ).length;

console.log(
  `Elevation check passed — ${themeScopes + presetScopes} theme scopes, ` +
    `${KNOBS.length} knobs each, 6 generated steps, ` +
    `${NOT_ELEVATION.size} tokens named \`shadow\` that are deliberately not heights.`,
);
