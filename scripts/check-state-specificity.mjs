#!/usr/bin/env node
/**
 * Fails the build on a **state** rule in the library's *global* stylesheets that an ordinary
 * consumer stylesheet can beat by accident.
 *
 * ## Why only the global stylesheets
 *
 * `styles/button.css`, `styles/menu.css`, `styles/ripple.css`, `styles/surfaces.css` and
 * `styles/utilities.css` are
 * the files whose rules land on elements the **consumer owns** — `[gogButton]` on their `<a>`,
 * `gogMenuItem` on their `<button>`, `gogCardHeader` on their `<h3>`, `gogCollapsibleTrigger`,
 * `gogRipple` and `gogBadge` on whatever they wrote. Everything
 * else in the library is a component stylesheet, scoped by Angular's emulated encapsulation to
 * markup the consumer cannot select into anyway.
 *
 * ## The arithmetic
 *
 * Angular stamps `[_ngcontent-…]` onto every rule in a component stylesheet, so the consumer's
 * plainest possible rule — one class — is **(0,2,0)**. `:disabled` is a pseudo-class and counts
 * as a class, so `.gog-btn:disabled` is also (0,2,0): a tie, and a tie is decided by source
 * order, which the consumer wins because the package's stylesheet is loaded first.
 *
 * Measured before this check existed: a disabled `.gog-btn` under a single-class consumer rule
 * rendered `cursor: pointer` at full opacity — enabled-looking and enabled-feeling while
 * disabled. For `.gog-menu__item` it is worse, because the arrow keys step over a disabled item,
 * so the pointer and the keyboard end up disagreeing about what is there.
 *
 * ## What counts as a state, and why only states
 *
 * `:disabled`, `:focus-visible`, `:checked`, `aria-disabled`, `aria-pressed` and friends.
 * `aria-pressed` joined them in 21.9.2, when the toggled ring stopped excluding `:disabled` and
 * therefore stopped being (0,3,0) by accident — a state saying "this toggle is on" is exactly
 * the kind whose silent loss is an accessibility regression rather than a taste one. A base look — plain
 * `.gog-btn` — is left beatable on purpose: restyling the library is the consumer's call, and
 * that is the whole point of the token system. A *state* is different. Losing it silently is a
 * correctness or accessibility regression, not a difference of taste.
 *
 * The fix is always one more point of specificity, never `!important`: double the class
 * (`.gog-btn.gog-btn:disabled`), or qualify it the way `:hover:not(:disabled)` already is. A
 * consumer who deliberately restyles the state still wins with two classes of their own.
 *
 * Usage: node scripts/check-state-specificity.mjs
 */
import { readFileSync } from 'node:fs';

const SHEETS = [
  'projects/gleks/ui/src/styles/button.css',
  'projects/gleks/ui/src/styles/menu.css',
  'projects/gleks/ui/src/styles/ripple.css',
  'projects/gleks/ui/src/styles/surfaces.css',
  'projects/gleks/ui/src/styles/utilities.css',
];

/** Selectors that express a state rather than a look. */
const STATE =
  /:disabled|:checked|:focus-visible|:focus\b|:indeterminate|:invalid|\[aria-disabled|\[aria-checked|\[aria-pressed|\[disabled\]|--disabled\b/;

/** The plainest rule a consumer's component stylesheet can produce: one class + `[_ngcontent]`. */
const CONSUMER_FLOOR = [0, 2, 0];

/**
 * (ids, classes, elements) for one compound selector. Good enough for these files, which use
 * flat selectors and no `:is()`/`:where()`.
 *
 * **Attribute selectors are removed before anything else is counted**, and that is not tidiness.
 * A quoted value is made of ordinary word characters, so counting element names over the raw
 * selector read `[aria-pressed='true']` as one attribute *and* an element called `true` — which
 * inflated `.gog-btn[aria-pressed='true']` from (0,2,0) to (0,2,1) and floated it over the
 * consumer floor. This check then passed a rule an app beats by accident, which is the one thing
 * it exists to catch. Found 2026-09-05, when the toggled-ring rule was deliberately weakened to
 * test the check and the check did not notice.
 *
 * `:not(...)` contributes only its argument, so the functional pseudo-class name itself is
 * dropped: `.gog-btn:hover:not(:disabled)` is (0,3,0), which is what the comments in
 * `button.css` say it is.
 */
function specificity(selector) {
  const attributes = selector.match(/\[[^\]]+\]/g) ?? [];
  const bare = selector.replace(/\[[^\]]+\]/g, ' ').replace(/:(not|is|where|has)\(/g, '(');

  const ids = (bare.match(/(?<![\w-])#[\w-]+/g) ?? []).length;
  const pseudoClasses = bare.match(/(?<!:):(?!:)[\w-]+/g) ?? [];
  const pseudoElements = bare.match(/::[\w-]+/g) ?? [];
  const classes =
    (bare.match(/\.[\w-]+/g) ?? []).length + attributes.length + pseudoClasses.length;
  // A pseudo name is preceded by `:`, which the lookbehind excludes, so plain names are element
  // names and nothing else. Pseudo-elements are added back: they count in this slot.
  const elements =
    (bare.match(/(?<![\w.\-#:])[a-z][\w-]*/g) ?? []).length + pseudoElements.length;

  return [ids, classes, elements];
}

/**
 * The arithmetic above, checked against selectors whose values are not in dispute — including the
 * two shapes that have actually been wrong: a quoted attribute value read as an element name, and
 * `:not()` counted as a class of its own.
 *
 * A specificity check that miscounts does not fail loudly; it passes a rule it should have caught.
 * This runs every time for a few microseconds, which is the price of knowing that did not happen.
 */
const SELF_TEST = [
  ['.gog-btn', [0, 1, 0]],
  ['.gog-btn:disabled', [0, 2, 0]],
  ['.gog-btn.gog-btn:disabled', [0, 3, 0]],
  ['.gog-btn:hover:not(:disabled)', [0, 3, 0]],
  [".gog-btn[aria-pressed='true']", [0, 2, 0]],
  [".gog-btn.gog-btn[aria-pressed='true']", [0, 3, 0]],
  ["button[gogButton]:focus-visible", [0, 2, 1]],
  ['.gog-menu__item::before', [0, 1, 1]],
];

for (const [selector, expected] of SELF_TEST) {
  const found = specificity(selector);
  if (found.join(',') !== expected.join(',')) {
    console.error(
      `check-state-specificity is broken: ${selector} computed (${found.join(',')}), ` +
        `expected (${expected.join(',')}). Fix \`specificity()\` before trusting this run.`,
    );
    process.exit(1);
  }
}

/** Is `a` less than or equal to `b`, comparing left to right? */
function atMost(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return true;
}

const problems = [];

for (const path of SHEETS) {
  const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  for (const rule of source.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const raw = rule[1].replace(/\s+/g, ' ').trim();
    if (!raw || raw.startsWith('@')) continue;

    for (const selector of raw.split(',')) {
      const trimmed = selector.trim();
      if (!trimmed || trimmed.startsWith(':root') || !STATE.test(trimmed)) continue;

      const found = specificity(trimmed);
      if (atMost(found, CONSUMER_FLOOR)) {
        const line = source.slice(0, rule.index).split('\n').length;
        problems.push({ path, line, selector: trimmed, found });
      }
    }
  }
}

if (problems.length === 0) {
  console.log(
    `State-specificity check passed — every state rule in ${SHEETS.length} global stylesheet(s) ` +
      'outranks a single-class consumer rule.',
  );
  process.exit(0);
}

console.error(
  `State-specificity check failed — ${problems.length} rule(s) an app can beat by accident.\n` +
    "These land on the consumer's own element, and their plainest rule is (0,2,0) once Angular\n" +
    'stamps `[_ngcontent-…]` on it. Add one point — double the class, or qualify it the way\n' +
    '`:hover:not(:disabled)` already is. Never `!important`.\n',
);

for (const { path, line, selector, found } of problems) {
  console.error(`  ${path}:${line}\n    ${selector}   (${found.join(',')})`);
}

process.exit(1);
