#!/usr/bin/env node
// ng-packagr only compiles projects/gleks/ui/src through the Angular compiler; the ng-add
// schematic under projects/gleks/ui/schematics is plain Node/CommonJS code, so it gets its own
// tsc pass here, plus a copy step for the non-.ts files (collection.json, schema.json) tsc
// doesn't touch. The result is out-tsc/schematics, a complete runnable collection that
// `npm run test:schematics` points at directly.
//
// Pass --dist to also copy it into dist/gleks/ui/schematics, which is what makes the built
// package's "schematics" field resolve. Only `build:lib` does that: dist is the build
// ui-showcase links against, and a test run has no business rewriting it.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const copyToDist = process.argv.includes('--dist');

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const libDir = path.join(rootDir, 'projects/gleks/ui');
const schematicsSrc = path.join(libDir, 'schematics');
const outTsc = path.join(rootDir, 'out-tsc/schematics');
const distPkgDir = path.join(rootDir, 'dist/gleks/ui');
const distDir = path.join(distPkgDir, 'schematics');

const tscBin = path.join(rootDir, 'node_modules/typescript/bin/tsc');
const tsc = spawnSync(
  process.execPath,
  [tscBin, '-p', path.join(libDir, 'tsconfig.schematics.json')],
  {
    cwd: rootDir,
    stdio: 'inherit',
  },
);
if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}

// tsc only emits compiled .js — copy the schematic metadata (collection.json, schema.json) next
// to it so out-tsc/schematics is a complete, runnable schematics collection on its own.
copyMatching(schematicsSrc, outTsc, (name) => name.endsWith('.json'));

if (copyToDist) {
  // `ng build @gleks/ui` has to have run first — this only fills in a folder next to the package
  // manifest ng-packagr writes, it does not create the package.
  const distPkgPath = path.join(distPkgDir, 'package.json');
  if (!fs.existsSync(distPkgPath)) {
    fail(
      `${path.relative(rootDir, distPkgPath)} is missing — the library has not been built. ` +
        'Run `npm run build:lib`, which builds it and then calls this script.',
    );
  }

  // The published package must not ship spec files — dist gets everything except *.spec.cjs.
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.cpSync(outTsc, distDir, {
    recursive: true,
    filter: (src) => !src.endsWith('.spec.cjs'),
  });

  // The `$schema` in the source collection.json is a path into the workspace's node_modules, for
  // the editor's benefit. It resolves to nothing once the package is installed somewhere else, so
  // the shipped copy goes without it.
  const distCollectionPath = path.join(distDir, 'collection.json');
  const collection = JSON.parse(fs.readFileSync(distCollectionPath, 'utf8'));
  delete collection.$schema;
  fs.writeFileSync(distCollectionPath, `${JSON.stringify(collection, null, 2)}\n`);

  // Last: the package manifest's "schematics" field is what `ng add` follows, and nothing else
  // checks that it lands on a real file. A rename on either side turns into a crash for whoever
  // runs `ng add` on the published package, so it is verified here.
  const schematicsField = JSON.parse(fs.readFileSync(distPkgPath, 'utf8')).schematics;
  if (!schematicsField) {
    fail(
      'the built package.json has no "schematics" field — `ng add` would not find the collection.',
    );
  }
  const resolved = path.resolve(distPkgDir, schematicsField);
  if (!fs.existsSync(resolved)) {
    fail(
      `the built package.json points "schematics" at ${schematicsField}, which does not exist ` +
        `(looked in ${path.relative(rootDir, resolved)}).`,
    );
  }
}

const written = copyToDist ? distDir : outTsc;
process.stdout.write(`build-schematics: wrote ${path.relative(rootDir, written)}\n`);

function fail(message) {
  process.stderr.write(`build-schematics: ${message}\n`);
  process.exit(1);
}

function copyMatching(srcDir, destDir, predicate) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyMatching(srcPath, path.join(destDir, entry.name), predicate);
    } else if (predicate(entry.name)) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(srcPath, path.join(destDir, entry.name));
    }
  }
}
