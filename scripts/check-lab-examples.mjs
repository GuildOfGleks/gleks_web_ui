#!/usr/bin/env node
/**
 * Structural check for the docs site's examples.
 *
 * **Why this exists.** Moving every demo out of its page and into its own component (see
 * `docs/lab-examples-refactor.md`) silently took the markup out of reach of the page-scoped CSS
 * that used to lay it out: `.action-row` was declared in `_doc-page.scss`, the buttons now lived
 * in a child component, and a scoped rule cannot cross that boundary. Nothing failed — not the
 * build, not the linter, not a test — and ~200 demos lost their layout at once, which read as the
 * library having broken. Every rule below is that failure, made loud:
 *
 *   1. an example is exactly three files, `example.ts` / `example.html` / `example.css`;
 *   2. its markup has one root, `<div class="example">`, so the CSS has something to hang on;
 *   3. every class the markup uses is declared in that example's own CSS (library `gog-*`
 *      classes excepted — those come from the package);
 *   4. every class the CSS declares is used by that markup, so dead rules do not accumulate;
 *   5. no `:host` — layout belongs to the root element, which is what makes the CSS the same
 *      code a consumer would write outside Angular;
 *   6. nothing is left in the old flat `<name>.example.ts` layout.
 *
 * Run by `npm run check:examples` (alongside the generator's own `--check`) and by every
 * `npm run build:lab`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesDir = path.join(rootDir, 'projects/gleks-ui-lab/src/app/examples');

const REQUIRED = ['example.ts', 'example.html', 'example.css'];
const problems = [];

const report = (where, message) => problems.push(`${where}: ${message}`);

/** Classes a template asks for, from `class="…"`, `[class.x]` and `[ngClass]="'x'"`. */
function classesUsed(html) {
  const used = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g))
    m[1]
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => used.add(c));
  for (const m of html.matchAll(/\[class\.([A-Za-z0-9_-]+)\]/g)) used.add(m[1]);
  for (const m of html.matchAll(/\[ngClass\]="'([^']+)'"/g)) used.add(m[1]);
  return used;
}

/** Classes a stylesheet declares. Selectors only — `var(--x)` and values are not matched. */
function classesDeclared(css) {
  const declared = new Set();
  const selectorsOnly = css.replace(/\{[^{}]*\}/g, '{}').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of selectorsOnly.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)) declared.add(m[1]);
  return declared;
}

for (const component of readdirSync(examplesDir).sort()) {
  const componentDir = path.join(examplesDir, component);
  if (!statSync(componentDir).isDirectory()) continue;

  for (const entry of readdirSync(componentDir).sort()) {
    const full = path.join(componentDir, entry);

    if (entry.endsWith('.example.ts')) {
      report(
        `${component}/${entry}`,
        'left in the old flat layout — an example is a folder holding example.ts/.html/.css',
      );
      continue;
    }
    if (!statSync(full).isDirectory()) continue;

    const where = `${component}/${entry}`;
    const missing = REQUIRED.filter((f) => !existsSync(path.join(full, f)));
    if (missing.length) {
      report(where, `missing ${missing.join(', ')}`);
      continue;
    }

    const ts = readFileSync(path.join(full, 'example.ts'), 'utf8');
    const html = readFileSync(path.join(full, 'example.html'), 'utf8');
    const css = readFileSync(path.join(full, 'example.css'), 'utf8');

    if (!ts.includes("templateUrl: './example.html'"))
      report(where, 'example.ts does not point at ./example.html');
    if (!ts.includes("styleUrl: './example.css'"))
      report(where, 'example.ts does not point at ./example.css');

    const roots = html
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (roots[0] !== '<div class="example">' || roots[roots.length - 1] !== '</div>')
      report(where, 'example.html must be one root `<div class="example">…</div>`');

    if (/:host\b/.test(css))
      report(where, 'example.css uses :host — style `.example` (the markup root) instead');

    const used = classesUsed(html);
    const declared = classesDeclared(css);

    // `example` is the mandatory root from rule 2 and exists whether or not it needs styling;
    // `gog-*` comes from the package, and the CSS may legitimately hang a rule off one of them
    // (`.gog-collapsible__trigger--open .chevron`) without the markup ever writing it out.
    const isLibrary = (c) => c.startsWith('gog-');
    const undeclared = [...used].filter(
      (c) => c !== 'example' && !isLibrary(c) && !declared.has(c),
    );
    if (undeclared.length)
      report(where, `markup uses class(es) its CSS does not declare: ${undeclared.join(', ')}`);

    const unused = [...declared].filter((c) => c !== 'example' && !isLibrary(c) && !used.has(c));
    if (unused.length)
      report(where, `CSS declares class(es) the markup does not use: ${unused.join(', ')}`);
  }
}

if (problems.length) {
  console.error(`Example structure check failed — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nSee docs/lab-examples-refactor.md for the convention these rules enforce.');
  process.exit(1);
}

const count = readdirSync(examplesDir)
  .filter((c) => statSync(path.join(examplesDir, c)).isDirectory())
  .flatMap((c) =>
    readdirSync(path.join(examplesDir, c)).filter((e) =>
      existsSync(path.join(examplesDir, c, e, 'example.ts')),
    ),
  ).length;

console.log(`Example structure is sound — ${count} example(s).`);
