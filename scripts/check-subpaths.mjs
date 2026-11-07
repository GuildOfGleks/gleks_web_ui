#!/usr/bin/env node
/**
 * Every export of the root is also exported by a public subpath.
 *
 * The root re-exports every component entry point so that no import breaks, and an app splits by
 * route only if **all** of its imports are subpaths (`docs/component-entry-points.md`, Part 2: one
 * eager import of the root puts everything used from it in the initial chunk). So a symbol the root
 * exports and no subpath does — a helper added to `src/public-api.ts` straight from `shared`, say —
 * forces every such app back onto the root, silently, with every build green. This check reads the
 * built `.d.ts` through the TypeScript checker and fails on any root export that no public subpath
 * carries. `@guildofgleks/ui/shared` does not count: it is internal.
 *
 * It also fails if two public subpaths export the same name from different declarations, which
 * would make the root's `export *` ambiguous.
 *
 * Needs `npm run build:lib` first. Run via `npm run check:subpaths`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist/gleks/ui');
const PACKAGE = '@guildofgleks/ui';
const INTERNAL = new Set([`${PACKAGE}/shared`]);

if (!existsSync(path.join(distDir, 'package.json'))) {
  console.error('check:subpaths: dist/gleks/ui not found — run npm run build:lib first.');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(path.join(distDir, 'package.json'), 'utf8'));
const paths = {};
for (const [key, value] of Object.entries(pkg.exports)) {
  if (typeof value === 'object' && value.types) {
    paths[path.posix.join(PACKAGE, key)] = [path.join(distDir, value.types)];
  }
}
const entryPoints = Object.keys(paths);

const program = ts.createProgram(
  entryPoints.map((name) => paths[name][0]),
  {
    paths,
    baseUrl: distDir,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    types: [],
  },
);
const checker = program.getTypeChecker();

/** name -> the declaration it resolves to, for one entry point. */
function exportsOf(name) {
  const file = program.getSourceFile(paths[name][0]);
  const moduleSymbol = file && checker.getSymbolAtLocation(file);
  if (!moduleSymbol) throw new Error(`cannot read the types of ${name}`);
  const result = new Map();
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    result.set(symbol.name, target);
  }
  return result;
}

const root = exportsOf(PACKAGE);
const owners = new Map(); // name -> [subpath, declaration]
const problems = [];

for (const name of entryPoints) {
  if (name === PACKAGE || INTERNAL.has(name)) continue;
  for (const [symbol, target] of exportsOf(name)) {
    const seen = owners.get(symbol);
    if (seen && seen[1] !== target) {
      problems.push(
        `[ambiguous] ${symbol} is exported by ${seen[0]} and ${name} from different declarations`,
      );
    }
    if (!seen) owners.set(symbol, [name, target]);
  }
}

for (const symbol of root.keys()) {
  if (!owners.has(symbol)) {
    problems.push(
      `[root-only] ${symbol} is exported by ${PACKAGE} and by no public subpath — an app that imports\n` +
        `      only subpaths cannot reach it. Export it from the subpath it belongs to`,
    );
  }
}

const subpaths = entryPoints.filter((name) => name !== PACKAGE && !INTERNAL.has(name));
if (root.size === 0 || subpaths.length === 0) {
  console.error('check:subpaths: read no exports — the check would pass on nothing.');
  process.exit(1);
}

if (problems.length > 0) {
  console.error('Subpath check FAILED\n');
  for (const problem of problems) console.error(`  ${problem}\n`);
  console.error(`${problems.length} problem(s). See docs/component-entry-points.md.`);
  process.exit(1);
}

console.log(
  `check:subpaths: all ${root.size} root exports are on one of ${subpaths.length} public subpaths, ` +
    'none of them ambiguous.',
);
