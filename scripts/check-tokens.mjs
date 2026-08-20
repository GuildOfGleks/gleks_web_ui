#!/usr/bin/env node
// Enforces the design-token contract from .github/instructions/styling.instructions.md
// ("Theming via CSS custom properties — the three layers"). Four rules:
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
  'disabled',
  'duration',
  'easing',
  'focus',
  'font',
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
      if (match[0].startsWith(`--gog-${short}-`)) deprecatedSpellings.add(match[0]);
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
