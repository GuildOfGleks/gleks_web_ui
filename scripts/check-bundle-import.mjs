#!/usr/bin/env node
/**
 * Every built bundle of the package must load in plain Node.
 *
 * ng-packagr ships partial-compiled code: `static ɵcmp = ɵɵngDeclareComponent({ queries: [...] })`.
 * A static field is evaluated when its class is declared, so a component whose `contentChild` or
 * `viewChild` predicate names a class declared *later in the same bundle* reads that class in its
 * temporal dead zone and the whole module throws `ReferenceError: Cannot access 'X' before
 * initialization` on import. An Angular CLI app never sees it — its linker rewrites `queries` into
 * a `contentQueries` function that runs lazily — so every build, test and browser stayed green
 * while a consumer's Vitest run, or any Node script importing the package, crashed on the first
 * import of *any* root export. That is how `gog-card` shipped from 21.6.1 to 21.19.0 with
 * `GogCardLinkDirective` declared below `CardComponent`.
 *
 * The check imports each `fesm2022/*.mjs` of `dist/gleks/ui` with `@angular/compiler` loaded (the
 * JIT facade a partial declaration needs outside the linker). `@guildofgleks/ui` and its subpaths
 * are resolved to `dist/` through a resolve hook — left alone, Node would walk up to the root
 * `node_modules` and test the *published* version instead of the one just built.
 *
 * Needs `npm run build:lib` first. Run via `npm run check:bundle-import`.
 */

import { readdirSync, existsSync } from 'node:fs';
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist/gleks/ui');
const fesmDir = path.join(distDir, 'fesm2022');

if (!existsSync(fesmDir)) {
  console.error(
    `check:bundle-import: ${path.relative(rootDir, fesmDir)} not found — run npm run build:lib first.`,
  );
  process.exit(1);
}

const bundles = readdirSync(fesmDir)
  .filter((name) => name.endsWith('.mjs'))
  .sort();

// A check that passes on nothing is worse than none (see check-layering.mjs).
if (!bundles.includes('guildofgleks-ui.mjs') || bundles.length < 2) {
  console.error(
    `check:bundle-import: expected the root bundle and its entry points, found ${bundles.length} file(s).`,
  );
  process.exit(1);
}

// `@guildofgleks/ui` -> guildofgleks-ui.mjs, `@guildofgleks/ui/table` -> guildofgleks-ui-table.mjs.
const hook = `
const fesm = ${JSON.stringify(pathToFileURL(fesmDir).href)};
export async function resolve(specifier, context, next) {
  const match = /^@guildofgleks\\/ui(?:\\/([a-z-]+))?$/.exec(specifier);
  if (match) {
    const file = match[1] ? 'guildofgleks-ui-' + match[1] + '.mjs' : 'guildofgleks-ui.mjs';
    return { url: fesm + '/' + file, shortCircuit: true };
  }
  return next(specifier, context);
}
`;
register(`data:text/javascript,${encodeURIComponent(hook)}`);

await import('@angular/compiler');

const failures = [];
for (const name of bundles) {
  try {
    await import(pathToFileURL(path.join(fesmDir, name)).href);
  } catch (error) {
    failures.push({ name, error });
  }
}

if (failures.length > 0) {
  for (const { name, error } of failures) {
    console.error(`✗ ${name}: ${error?.name}: ${error?.message}`);
  }
  console.error(
    `\ncheck:bundle-import: ${failures.length} of ${bundles.length} bundles fail to load in Node. ` +
      'A "before initialization" error means a query predicate names a class declared below the ' +
      'component in the same file — declare the directive first.',
  );
  process.exit(1);
}

console.log(`check:bundle-import: all ${bundles.length} bundles load in Node.`);
