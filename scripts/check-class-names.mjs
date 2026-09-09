#!/usr/bin/env node
/**
 * Every class a library template applies to its own markup carries the `gog-` prefix.
 *
 * ## Why
 *
 * `docs/backlog.md`'s confirmation-dialog defect was exactly this: `heading-md` and `body-sm`,
 * two classes that looked like a small reusable utility pair, had no CSS rule anywhere in the
 * library — the text they were meant to size rendered at whatever the browser inherited instead.
 * A prefix convention would have made both visible immediately: everything else in the library is
 * `gog-*`, and an unprefixed class reads as either a utility that was never built or a name copied
 * from outside the library by habit. Either way it is worth a second look before it ships.
 *
 * ## Why the prefix, and not "every class has a rule"
 *
 * That stronger check was measured first and rejected: roughly 50 of the library's ~400 template
 * classes are `gog-*` state and behaviour hooks (`gog-scroll--dragging`, `gog-autocomplete--open`,
 * `gog-select--floated`, …) that carry no rule of their own by design — Angular's `[class.foo]`
 * toggles them and a parent selector or a consumer's own CSS reads them. A check that opens with a
 * fifty-entry exception list is not documentation, it is a threshold quietly worn down until it
 * passes, which `docs/component-geometry.md`'s own rule about exceptions warns against. The prefix
 * is cheap and precise instead: it does not care whether a class has a rule, only whether it says
 * where it came from.
 *
 * ## What it does not see, on purpose
 *
 * A `class` attribute containing an Angular interpolation (`class="{{ x }}"` or a `[ngClass]`
 * binding) is skipped rather than guessed at — a computed class name is not something this script
 * can resolve without evaluating the template, and pretending otherwise would be exactly the kind
 * of check that lies about what it reads (`survey-measure.mjs`'s vacuous `\bvw\b` self-check is the
 * cautionary example: a regex that cannot match what it claims to check for, printing "confirmed:
 * none").
 *
 * ## The exception list
 *
 * Each entry names the class and the reason, following `check-contrast.mjs`'s `DENSITY_EXEMPT`
 * pattern. If this list grows past a handful of entries, the convention it claims to enforce is
 * not a convention — stop, and record what was found in `docs/backlog.md` instead of loosening the
 * rule silently.
 *
 * Usage: node scripts/check-class-names.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'projects/gleks/ui/src/lib';

/** Unprefixed class name → why it is allowed to stay that way. */
const EXEMPT = new Map([
  [
    'confirm-dialog',
    'legacy unprefixed name on a shipped component (gog-confirmation-dialog); a rename is a ' +
      'consumer-visible change to a class a ::ng-deep may target, and a candidate for the next ' +
      'major rather than this one — the same deferral --gog-skeleton-line-height-* got (D4d, ' +
      'docs/component-geometry.md).',
  ],
  ['confirm-dialog__title', 'as above'],
  ['confirm-dialog__description', 'as above'],
  ['confirm-dialog__actions', 'as above'],
  [
    'slide-left',
    'legacy unprefixed name on gog-toast; painted (toast.component.scss ":host(.slide-left)") ' +
      'and working, same deferral as confirm-dialog above.',
  ],
]);

/** Every `.html` template under `dir`. */
function templatesIn(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...templatesIn(path));
    else if (entry.endsWith('.html')) found.push(path);
  }
  return found;
}

const findings = [];
let checked = 0;
let skippedInterpolated = 0;

for (const path of templatesIn(ROOT)) {
  const markup = readFileSync(path, 'utf8');
  const lines = markup.split('\n');

  lines.forEach((line, i) => {
    // Static `class="…"` attributes. A value containing `{{` is computed, not literal — skip it
    // rather than guess at what it might resolve to.
    for (const m of line.matchAll(/\sclass="([^"]*)"/g)) {
      if (m[1].includes('{{')) {
        skippedInterpolated += 1;
        continue;
      }
      for (const cls of m[1].split(/\s+/).filter(Boolean)) {
        checked += 1;
        if (!/^gog-/.test(cls) && !EXEMPT.has(cls)) {
          findings.push({ path, line: i + 1, cls });
        }
      }
    }
    // `[class.foo]="…"` bindings — the class name is the binding target, always literal.
    for (const m of line.matchAll(/\[class\.([\w-]+)\]/g)) {
      checked += 1;
      if (!/^gog-/.test(m[1]) && !EXEMPT.has(m[1])) {
        findings.push({ path, line: i + 1, cls: m[1] });
      }
    }
  });
}

// The exception list itself must still be in use — an entry for a class nobody applies any more
// is a stale allowance, not a documented one.
const seen = new Set();
for (const path of templatesIn(ROOT)) {
  const markup = readFileSync(path, 'utf8');
  for (const cls of EXEMPT.keys()) {
    if (markup.includes(cls)) seen.add(cls);
  }
}
for (const cls of EXEMPT.keys()) {
  if (!seen.has(cls)) findings.push({ path: '(exception list)', line: null, cls: `${cls} — no template applies this class any more; remove the exception` });
}

if (findings.length === 0) {
  console.log(
    `Class-name check passed — ${checked} class(es) across the library's templates all read ` +
      `\`gog-\`, or are named exceptions (${skippedInterpolated} computed class attribute(s) skipped).`,
  );
  process.exit(0);
}

console.error(
  `Class-name check failed — ${findings.length} class name(s) do not carry the \`gog-\` prefix ` +
    'and are not a named exception. An unprefixed class is either a utility that was never built ' +
    '(docs/backlog.md\'s confirmation-dialog defect was exactly this) or a name that should read ' +
    '`gog-*` like everything else in the library.\n',
);

for (const f of findings) {
  console.error(f.line ? `  ${f.path}:${f.line} — "${f.cls}"` : `  ${f.path} — ${f.cls}`);
}

process.exit(1);
