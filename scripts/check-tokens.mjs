#!/usr/bin/env node
// Enforces the design-token contract from .github/instructions/styling.instructions.md
// ("Theming via CSS custom properties — the three layers"). Seven rules:
//
//   A. no-literal-fallback   A component stylesheet must not carry a real default in a
//                            var() fallback. `var(--gog-x, 8px)` puts the value in a file
//                            no theme can reach and no consumer can discover; the chain has
//                            to bottom out in a token that theme.css declares.
//   B. resolvable            Every token read must be declared somewhere (theme.css or a
//                            component's own internal variant/size tier) or be a known
//                            instance-layer token. Catches typos, which are otherwise
//                            invisible whenever the read has a fallback.
//   C. root-literals-only    theme.css's plain `:root` block holds literals only. A token
//                            whose value contains var() must live in the `:root,
//                            [data-theme]` block instead: var() is substituted where the
//                            property is *declared*, so a derived token declared on :root
//                            freezes to the root palette and stops following a scoped
//                            [data-theme] subtree.
//   D. allowlist-fresh       INSTANCE_TOKENS below must match reality — an entry that is
//                            now declared, or no longer read, is stale and fails the check.
//                            This is what keeps the list usable as documentation.
//
//   E. known-prefix          Every token's prefix is a component's own name, a shared block,
//                            or a foundation family — see NAMESPACES below. A consumer guesses
//                            a token name from the component they wrote in markup, so
//                            `--gog-dlg-bg` next to `<gog-dialog>` is a token nobody finds.
//                            api-design.instructions.md states the rule ("block token prefix
//                            spelled out, not abbreviated"); this is what stops the next
//                            abbreviation landing, since the four that exist were all added
//                            while the rule was already written down.
//
//   F. no-dead-read          A `var(--gog-x)` inside theme.css itself, with no fallback, must
//                            name a token something declares (or a known instance-layer token).
//                            Unlike rule B, this reads theme.css's *own* text, because a token
//                            can use another token as an ingredient one level inside its own
//                            fallback chain (`--gog-x-glow: var(--gog-x-glow, 0 0 8px
//                            var(--gog-x-ring))` — the inner read has no fallback of its own)
//                            and rule B never scans theme.css against itself. A dead read here
//                            is not a soft failure: it makes the *outer* property
//                            guaranteed-invalid, so the declaration reading it computes to
//                            nothing, silently, in every consumer — found 2026-08-28 in three
//                            multiselect/select tokens that had never painted. See
//                            docs/token-prefix-removal.md, iteration 0.
//
//   G. character-drift       A component-token literal whose value repeats a `docs/themes.md`
//                            character token's current value, in a category that layer covers
//                            (radius/border-width/border-style/text-transform/letter-spacing —
//                            CHARACTER_TOKENS below) — should read that token, not restate its
//                            value. This checks the *value*, not just the property name: a
//                            radius of 6px isn't flagged just for being a radius, only for
//                            being exactly 8px (today's --gog-radius) while staying a bare
//                            literal. Added 2026-08-29, iteration 1: this is the mechanical
//                            half of "give themes foundation tokens worth setting" — without
//                            it, a component added in a hurry silently reintroduces the exact
//                            drift the character layer exists to end.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';
import * as sass from 'sass';

import { DEPRECATED_NAMESPACES } from './deprecations.mjs';
import { INSTANCE_TOKENS } from './instance-tokens.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(rootDir, 'projects/gleks/ui/src');

/**
 * Rule-A exceptions. A literal fallback is legitimate only when the token carries no theme
 * default at all because something *else* writes it at runtime — the fallback is then the
 * identity value for "nobody has written it yet", not a design decision hidden in SCSS.
 * Anything else belongs in theme.css.
 */
const LITERAL_FALLBACK_ALLOWED = new Set([
  // Written as an inline style by gog-dialog's drag handler; 0px means "not dragged".
  '--gog-dialog-offset-x',
  '--gog-dialog-offset-y',
  // Written by gog-textarea from its measured scrollbar width; 0px means "no scrollbar".
  '--gog-textarea-scrollbar-width',
  // Written by gog-menu from the room measured beside its trigger; 100vh means "not measured
  // yet", which is the frame before the first placement and every server-rendered pass.
  '--gog-menu-available-height',
]);

const DECLARATION_RE = /(--gog-[a-zA-Z0-9-]+)\s*:/g;

/**
 * Rule E's allowlist. A token is `--gog-<namespace>-<rest>`, and the namespace has to be one
 * of these — component names come from the folder list, so a new component needs no edit here;
 * everything else is a deliberate decision someone made once.
 */
const FOUNDATION_NAMESPACES = new Set([
  // palette
  'accent',
  'background',
  'border',
  'danger',
  'hover',
  'info',
  'muted',
  'primary',
  'secondary',
  'success',
  'surface',
  'text',
  'warning',
  // type, metrics, motion, state
  'density',
  'disabled',
  'duration',
  // The ground a raised surface paints; a dark theme lifts it where a light one shadows.
  'elevated',
  'easing',
  'focus',
  'font',
  'letter-spacing',
  'radius',
  'space',
  // shared tiers several components read
  'control',
  'field',
  'panel',
  // writing direction, for the few properties with no logical form (utilities.css)
  'direction',
  'inline',
]);

/**
 * Blocks that are not a single component's name, and why. Each of these is read by more than
 * one component on purpose, so naming it after either one would be worse than the shared name.
 */
const SHARED_BLOCK_NAMESPACES = new Map([
  ['input', 'the text-field block `gog-inputfield` and `gog-textarea` both render'],
  ['dropdown', 'the panel `gog-select`, `gog-multiselect` and `gog-autocomplete` share'],
  ['calendar', 'the month grid, rendered standalone and inside `gog-datepicker`'],
  // Checked when rule E first flagged it: `gog-radio-group` declares BOTH families on purpose —
  // `--gog-radio-group-*` for the container (gap, legend text, option spacing) and `--gog-radio-*`
  // for one radio control inside it. Aliasing the second onto the first collides with real
  // tokens: `--gog-radio-group-label-size` already exists and means something else.
  ['radio', 'one radio control inside `gog-radio-group`, which owns `--gog-radio-group-*` too'],
]);

// The abbreviations that predate the rule live in `deprecations.mjs`, together with the dates
// they carry — one list, read here by rule E and expanded by the manifest generator.

/**
 * Rule G's targets — docs/themes.md's character layer, added in iteration 1 (2026-08-29).
 * Each entry maps a component-token suffix to the foundation token(s) that already give a
 * theme one place to set this exact value. A `--gog-<component>-<suffix>` declared as a bare
 * literal whose value equals one of these is the drift the character layer exists to catch:
 * someone typed the value they saw next door instead of reading the token that already carries
 * it, and the next theme has to re-discover and re-list it by hand. This does **not** mean
 * every token in these categories must derive from the character layer — a pill radius, a
 * genuinely flat corner, a component's own tuned tracking are real per-component choices, not
 * drift, which is exactly why this checks the *value*, not the property name: a literal that
 * doesn't match today's character value isn't flagged, because nothing suggests it should have
 * used the token instead of picking its own.
 */
const CHARACTER_TOKENS = new Map([
  ['radius', ['--gog-radius']],
  [
    'border-width',
    ['--gog-border-width', '--gog-control-border-width', '--gog-panel-border-width'],
  ],
  [
    'border-style',
    ['--gog-border-style', '--gog-control-border-style', '--gog-panel-border-style'],
  ],
  ['text-transform', ['--gog-text-transform']],
  ['letter-spacing', ['--gog-letter-spacing']],
]);

/**
 * Component stylesheets are analysed **after** compiling them with sass, not as raw source.
 *
 * Token names are increasingly assembled by interpolation inside shared mixins
 * (`var(--gog-#{$prefix}-float-label-on-bg, …)` in `lib/styles/_float-label.scss`), which a
 * text scan of the `.scss` cannot resolve — it would report those tokens as never read and
 * miss any violation hidden inside a mixin. Compiled CSS is the ground truth for what a
 * component actually paints, so the rules below run against that and stay correct no matter
 * how the SCSS is factored.
 *
 * Partials (`_name.scss`) are skipped: they emit nothing on their own and are compiled as part
 * of whichever component stylesheet uses them.
 */
async function collectCompiledScss(dir) {
  const files = [];
  for await (const entry of glob('**/*.scss', { cwd: dir, withFileTypes: true })) {
    if (entry.isFile() && !entry.name.startsWith('_')) {
      files.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  files.sort();

  const compiled = new Map();
  for (const file of files) {
    try {
      compiled.set(file, sass.compile(file, { style: 'expanded', sourceMap: false }).css);
    } catch (error) {
      console.error(`Failed to compile ${path.relative(rootDir, file)}:\n  ${error.message}`);
      process.exit(1);
    }
  }
  return compiled;
}

function findDeclared(content) {
  return new Set([...content.matchAll(DECLARATION_RE)].map((m) => m[1]));
}

/**
 * Every `--gog-x: value;` declaration in `content`, name paired with its raw value text.
 * Paren-depth-aware so a value containing `calc(...)`/`color-mix(...)` doesn't end the
 * declaration at a `;` that's actually inside one of those calls — there is none today, but
 * the character-layer values this feeds (radius/border/casing/tracking) are exactly the kind
 * a future one might grow.
 */
function findDeclaredWithValues(content) {
  const decls = [];
  const head = /(--gog-[a-zA-Z0-9-]+)\s*:/g;
  let m;
  while ((m = head.exec(content))) {
    let depth = 0;
    let i = head.lastIndex;
    const valueStart = i;
    for (; i < content.length; i++) {
      const c = content[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ';' && depth === 0) break;
    }
    decls.push({ name: m[1], value: content.slice(valueStart, i).trim(), index: m.index });
    head.lastIndex = i;
  }
  return decls;
}

/**
 * Every `var(--gog-*)` read in `content`, with its fallback text (null when there is none).
 * Hand-written rather than regex-only because fallbacks nest arbitrarily deep
 * (`var(--a, var(--b, var(--c)))`) and regexes cannot balance parentheses.
 */
function parseVarReads(content) {
  const reads = [];
  const head = /var\(\s*(--gog-[a-zA-Z0-9-]+)\s*/g;
  let match;
  while ((match = head.exec(content))) {
    const after = match.index + match[0].length;
    if (content[after] === ')') {
      reads.push({ token: match[1], fallback: null, index: match.index });
      continue;
    }
    if (content[after] !== ',') continue;
    let depth = 1;
    let i = after + 1;
    for (; i < content.length && depth > 0; i++) {
      if (content[i] === '(') depth++;
      else if (content[i] === ')') depth--;
    }
    reads.push({
      token: match[1],
      fallback: content.slice(after + 1, i - 1).trim(),
      index: match.index,
    });
  }
  return reads;
}

/** The fallback with every complete `var(...)` expression removed, leaving only literals. */
function literalResidue(fallback) {
  let out = '';
  for (let i = 0; i < fallback.length;) {
    if (fallback.startsWith('var(', i)) {
      let depth = 1;
      let j = i + 4;
      for (; j < fallback.length && depth > 0; j++) {
        if (fallback[j] === '(') depth++;
        else if (fallback[j] === ')') depth--;
      }
      i = j;
      continue;
    }
    out += fallback[i];
    i++;
  }
  return out;
}

/** A residue carrying a number, a hex colour or a bare colour keyword is a real default. */
function residueHasLiteralValue(residue) {
  if (/[0-9#]/.test(residue)) return true;
  return /\b(transparent|currentcolor|none|black|white|red|blue|green|inherit|initial|unset)\b/i.test(
    residue,
  );
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

/**
 * Blanks every `/* ... *\/` comment to spaces, preserving line breaks and every other
 * character's offset — so a regex run against the result still reports correct line numbers
 * via `lineOf`. Needed because theme.css's own header comment writes real-looking
 * `var(--gog-x, --gog-y)` examples in prose, which would otherwise read as declarations or
 * reads to a token scanner that only sees text.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Component names, from the folder layout — `lib/components/<name>/`, plus nested ones like
 * `dialog/confirmation-dialog`. Reading the filesystem rather than a hand-kept list is what
 * makes rule E free for a new component: add the folder, its tokens validate.
 */
async function collectComponentNames(dir) {
  const names = new Set();
  for await (const entry of glob('**/', { cwd: dir, withFileTypes: true })) {
    names.add(entry.name);
  }
  return names;
}

/** theme.css's plain `:root { … }` block — the literals-only tier. */
function extractRootLiteralBlock(themeCss) {
  const match = themeCss.match(/\n:root\s*\{([\s\S]*?)\n\}/);
  return match ? { body: match[1], offset: match.index + 1 } : null;
}

async function main() {
  const themePath = path.join(uiSrc, 'styles/theme.css');
  const themeCss = readFileSync(themePath, 'utf8');
  const themeDeclared = findDeclared(themeCss);

  const scssContent = await collectCompiledScss(path.join(uiSrc, 'lib'));

  // The global stylesheets carry the classes for everything that renders into a *consumer's*
  // DOM — `gog-collapsible`'s projected trigger/content, the `gogBadge` directive's badge, the
  // `.gog-btn` block that `[gogButton]` puts on a consumer's own `<a>`. A scoped component
  // stylesheet can't reach those, so the rules have to live here or that whole surface goes
  // unchecked: a typo'd or undeclared token there fails silently, in the one place the token
  // system is hardest to eyeball.
  //
  // Scanned as a directory rather than a list of names, so a new global stylesheet is covered
  // the moment it exists instead of whenever someone remembers to add it here. `theme.css` is
  // excluded because it is the *declaration* source this check compares everything against, and
  // `presets/` because a preset declares palette tokens and reads nothing.
  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles'),
    withFileTypes: true,
  })) {
    if (!entry.isFile() || entry.name === 'theme.css') continue;
    const cssPath = path.join(entry.parentPath ?? entry.path, entry.name);
    scssContent.set(cssPath, readFileSync(cssPath, 'utf8'));
  }

  const scssFiles = [...scssContent.keys()];

  const componentDeclared = new Set();
  for (const content of scssContent.values()) {
    for (const token of findDeclared(content)) componentDeclared.add(token);
  }

  const problems = [];
  const rel = (f) => path.relative(rootDir, f).replace(/\\/g, '/');
  const readTokens = new Set();
  /** Rule E: tokens still using a pre-21.5.0 abbreviated prefix. Reported, not failed. */
  const deprecatedSpellings = new Set();

  for (const [file, content] of scssContent) {
    for (const { token, fallback, index } of parseVarReads(content)) {
      readTokens.add(token);
      // Line numbers are into the *compiled* CSS, so they don't map onto the .scss when the
      // rule came from a mixin. The token name is the thing to grep for.
      const where = `${rel(file)} (compiled, line ${lineOf(content, index)})`;

      // Rule A
      if (
        fallback !== null &&
        !LITERAL_FALLBACK_ALLOWED.has(token) &&
        residueHasLiteralValue(literalResidue(fallback))
      ) {
        const shown = fallback.replace(/\s+/g, ' ').slice(0, 60);
        problems.push(
          `[no-literal-fallback] ${where}\n      var(${token}, ${shown}) — move this default into theme.css and read the token directly`,
        );
      }

      // Rule B
      if (
        !themeDeclared.has(token) &&
        !componentDeclared.has(token) &&
        !INSTANCE_TOKENS.has(token)
      ) {
        problems.push(
          `[resolvable] ${where}\n      ${token} is declared nowhere and is not a known instance-layer token (typo, or add it to INSTANCE_TOKENS in this script)`,
        );
      }
    }
  }

  // Rule C
  const rootBlock = extractRootLiteralBlock(themeCss);
  if (!rootBlock) {
    problems.push(
      `[root-literals-only] could not locate the plain \`:root { … }\` block in theme.css`,
    );
  } else {
    for (const line of rootBlock.body.split('\n')) {
      const decl = line.match(/(--gog-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/);
      if (decl && decl[2].includes('var(')) {
        problems.push(
          `[root-literals-only] styles/theme.css  ${decl[1]}: ${decl[2].trim()}\n      derived value in the literals-only \`:root\` block — move it to \`:root, [data-theme]\` or it will not follow a scoped theme`,
        );
      }
    }
  }

  // Rule D
  for (const token of INSTANCE_TOKENS) {
    if (themeDeclared.has(token) || componentDeclared.has(token)) {
      problems.push(
        `[allowlist-fresh] ${token} is listed in INSTANCE_TOKENS but is now declared — either drop the declaration (it pins every instance) or remove it from the list`,
      );
    } else if (!readTokens.has(token)) {
      problems.push(
        `[allowlist-fresh] ${token} is listed in INSTANCE_TOKENS but no component reads it — stale entry, remove it`,
      );
    }
  }

  // Rule E
  const componentNames = await collectComponentNames(path.join(uiSrc, 'lib/components'));
  const knownNamespace = (token) => {
    const rest = token.slice('--gog-'.length);
    const matches = (name) => rest === name || rest.startsWith(name + '-');
    for (const name of componentNames) if (matches(name)) return 'component';
    for (const name of FOUNDATION_NAMESPACES) if (matches(name)) return 'foundation';
    for (const name of SHARED_BLOCK_NAMESPACES.keys()) if (matches(name)) return 'shared';
    for (const name of DEPRECATED_NAMESPACES.keys()) if (matches(name)) return name;
    return null;
  };

  // theme.css keeps each deprecated spelling inside its replacement's fallback
  // (`--gog-button-md-padding: var(--gog-btn-md-padding, …)`), where it is read but never
  // declared — so it has to be counted from the source text, not from the declaration sets.
  for (const match of themeCss.matchAll(/--gog-[a-zA-Z0-9-]+/g)) {
    for (const short of DEPRECATED_NAMESPACES.keys()) {
      const prefix = `--gog-${short}-`;
      // `> prefix.length`, not `startsWith` alone: a bare `--gog-btn-` with nothing after it
      // isn't a real token — it only shows up because prose like `` `--gog-btn-*` `` in a
      // comment matches this regex up to the `*`, which isn't a CSS identifier character.
      if (match[0].startsWith(prefix) && match[0].length > prefix.length) {
        deprecatedSpellings.add(match[0]);
      }
    }
  }

  // Rule F — scanned with comments blanked out, so the header's prose example
  // (`var(--gog-btn-x)`) doesn't read as a dead reference; line numbers still match themeCss.
  for (const { token, fallback, index } of parseVarReads(stripComments(themeCss))) {
    if (
      fallback === null &&
      !themeDeclared.has(token) &&
      !componentDeclared.has(token) &&
      !INSTANCE_TOKENS.has(token)
    ) {
      const line = lineOf(themeCss, index);
      problems.push(
        `[no-dead-read] styles/theme.css:${line}\n      var(${token}) has no fallback and ${token} is declared nowhere — this reference always resolves to nothing`,
      );
    }
  }

  // Rule G — docs/themes.md iteration 1's character-layer drift check. A component-token
  // literal that repeats a character token's current value, in a category the character layer
  // covers, should read that token instead — see CHARACTER_TOKENS above for what this is and
  // is not catching.
  const allCharacterTokenNames = new Set([...CHARACTER_TOKENS.values()].flat());
  const themeDecls = findDeclaredWithValues(stripComments(themeCss));
  const characterValues = new Map(); // suffix -> Map(tokenName -> currentValue)
  for (const [suffix, tokenNames] of CHARACTER_TOKENS) {
    const values = new Map();
    for (const { name, value } of themeDecls) {
      if (tokenNames.includes(name)) values.set(name, value);
    }
    characterValues.set(suffix, values);
  }
  for (const { name, value, index } of themeDecls) {
    if (allCharacterTokenNames.has(name)) continue; // the character tokens themselves
    if (value.includes('var(')) continue; // already derives from something
    for (const [suffix, values] of characterValues) {
      if (!name.endsWith(`-${suffix}`)) continue;
      for (const [charToken, charValue] of values) {
        if (value !== charValue) continue;
        const line = lineOf(themeCss, index);
        problems.push(
          `[character-drift] styles/theme.css:${line}\n      ${name}: ${value}; repeats ${charToken}'s value verbatim — read it instead: var(${charToken})`,
        );
      }
    }
  }

  // Rule H — docs/themes.md iteration 6's density check, the spacing half of rule G.
  //
  // It cannot be folded into rule G, which compares a literal against a character token's
  // literal value: a scale step is `calc(10px * var(--gog-density))`, so `10px` never matches
  // it textually even though it is exactly the drift worth catching. This compares the number
  // instead, after resolving the step's own base value at density 1.
  //
  // A padding or gap written as a literal is invisible to `--gog-density`, which is how the
  // library got 177 of them in two different units: each was correct where it was typed, and
  // together they made theme-level density impossible.
  const SCALE_STEP = /^--gog-space-(\d+)$/;
  const scaleSteps = new Map(); // px at density 1 -> token name
  for (const { name } of themeDecls) {
    const step = SCALE_STEP.exec(name);
    if (step) scaleSteps.set(Number(step[1]), name);
  }
  const lengthToPx = (v) => {
    const m = /^([\d.]+)(px|rem)$/.exec(v.trim());
    if (!m) return null;
    return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
  };
  for (const { name, value, index } of themeDecls) {
    if (SCALE_STEP.test(name)) continue; // the scale itself
    if (!/-(padding|gap)(-[a-z]+)?$/.test(name)) continue;
    if (value.includes('var(')) continue;
    for (const part of value.trim().split(/\s+/)) {
      const px = lengthToPx(part);
      if (px === null || px === 0) continue;
      const step = scaleSteps.get(px);
      if (!step) continue;
      const line = lineOf(themeCss, index);
      problems.push(
        `[density-drift] styles/theme.css:${line}\n      ${name}: ${value}; ${part} is ${step}'s value — read the scale instead: var(${step}), or it will not follow --gog-density`,
      );
    }
  }

  // Rule I — a theme's ramps must be ramps: tokens meant as separate steps must hold separate
  // colours. Two groups. The surface tiers came first:
  //
  // `--gog-surface-color` (the resting card), `--gog-hover-color` (a light lift: hover states and
  // the table/accordion header strips) and `--gog-elevated-surface-color` (a bigger lift) express
  // three distinct depths. Give any two of them the same value and the components that read them
  // become indistinguishable — which is not theoretical: 21.7.1's first attempt at fixing
  // "`elevated` looks like `outlined` on dark themes" set `--gog-elevated-surface-color` to the
  // hover colour in all three dark themes, so an accordion header sitting inside an elevated
  // panel vanished into it, reproducing the exact bug one level up. Caught by eye, not by any
  // check, which is why this exists.
  //
  // Only literal palette blocks are compared, since that is where a theme states its own colours.
  // The accent ramp joined it on 2026-09-03, for the same reason one release later: 21.8.1 made
  // `--gog-accent-dim` the button's *pressed* fill, which only reads as a press if it differs from
  // the rest and hover tones. `bevel` had `--gog-accent-dim: #000080`, byte-identical to its
  // `--gog-accent-color`, so a pressed button in that theme painted itself the colour it already
  // was. Nothing failed — the token existed, resolved, and passed every contrast pair.
  const RAMPS = [
    {
      label: 'surface-tier-collision',
      tokens: ['--gog-surface-color', '--gog-hover-color', '--gog-elevated-surface-color'],
      why: 'they are different depths — components reading one become invisible against the other',
    },
    {
      label: 'accent-ramp-collision',
      tokens: ['--gog-accent-color', '--gog-accent-bright', '--gog-accent-dim'],
      why: 'they are rest, hover and press — two of them equal means one state cannot be seen',
    },
  ];
  const paletteSources = [themeCss];
  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles/presets'),
    withFileTypes: true,
  })) {
    if (entry.isFile()) {
      paletteSources.push(
        readFileSync(path.join(entry.parentPath ?? entry.path, entry.name), 'utf8'),
      );
    }
  }

  const seenThemes = new Set();
  for (const source of paletteSources) {
    const themeBlockRe = /\[data-theme=(['"])([a-z0-9-]+)\1\]\s*\{([^}]*)\}/g;
    let block;
    while ((block = themeBlockRe.exec(stripComments(source)))) {
      const [, , themeName, body] = block;
      if (seenThemes.has(themeName)) continue;
      seenThemes.add(themeName);
      for (const ramp of RAMPS) {
        const values = new Map();
        for (const token of ramp.tokens) {
          const hit = body.match(new RegExp(`${token}\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
          if (hit) values.set(token, hit[1].toLowerCase());
        }
        for (const [a, b] of [
          [ramp.tokens[0], ramp.tokens[1]],
          [ramp.tokens[0], ramp.tokens[2]],
          [ramp.tokens[1], ramp.tokens[2]],
        ]) {
          if (values.has(a) && values.has(b) && values.get(a) === values.get(b)) {
            problems.push(
              `[${ramp.label}] theme '${themeName}': ${a} and ${b} are both ${values.get(a)}
` +
                `      ${ramp.why}`,
            );
          }
        }
      }
    }
  }

  const allTokens = new Set([...themeDeclared, ...componentDeclared, ...readTokens]);
  for (const token of [...allTokens].sort()) {
    const namespace = knownNamespace(token);
    if (namespace === null) {
      problems.push(
        `[known-prefix] ${token} starts with no namespace this library has\n` +
          `      a component's own name (lib/components/<name>/), a foundation family or a shared block —\n` +
          `      spell the component out (\`--gog-multiselect-*\`, not \`--gog-ms-*\`), or add the namespace to\n` +
          `      FOUNDATION_NAMESPACES / SHARED_BLOCK_NAMESPACES in this script with the reason`,
      );
    } else if (DEPRECATED_NAMESPACES.has(namespace)) {
      // Not a failure — these are the pre-rule spellings, kept resolving until 21.7.0. Counted
      // so the number is visible in the summary rather than quietly growing.
      deprecatedSpellings.add(token);
    }
  }

  if (problems.length > 0) {
    console.error('Design-token contract check FAILED\n');
    for (const problem of problems) console.error(`  ${problem}\n`);
    console.error(
      `${problems.length} problem(s). See .github/instructions/styling.instructions.md — "Theming via CSS custom properties".`,
    );
    process.exit(1);
  }

  console.log(
    `Design-token contract check passed — ${themeDeclared.size} tokens in theme.css, ` +
      `${INSTANCE_TOKENS.size} instance-layer tokens, ${scssFiles.length} component stylesheets scanned.`,
  );
  if (deprecatedSpellings.size > 0) {
    const byNamespace = [...DEPRECATED_NAMESPACES.entries()]
      .map(([short, meta]) => {
        const count = [...deprecatedSpellings].filter((t) =>
          t.startsWith(`--gog-${short}-`),
        ).length;
        return count > 0 ? `--gog-${short}-* → ${meta.replacementPrefix}* (${count})` : null;
      })
      .filter(Boolean)
      .join(', ');
    console.log(
      `  ${deprecatedSpellings.size} on a deprecated prefix, removed in 21.7.0: ${byNamespace}`,
    );
  }
}

main();
