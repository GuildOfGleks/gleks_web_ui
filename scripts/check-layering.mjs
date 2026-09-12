#!/usr/bin/env node
/**
 * The library's own layering, as a build failure rather than as a habit.
 *
 * `gleks-ui-library.instructions.md` sets it out: `lib/shared/` holds "cross-component types,
 * tokens, utils" and components use it. Nothing said what happens when it points back, and two
 * places did:
 *
 *   - `shared/config.ts` imported `ToastPosition` from `services/toast-service`, which imports
 *     `shared/config`.
 *   - `shared/tooltip-overlay.ts` imported a component out of `components/tooltip/`, which
 *     imports `shared/`.
 *
 * Neither hurt anything while the package builds as one flat bundle, which is exactly why they
 * survived: nothing renders a cycle visible until something tries to cut along it. A secondary
 * entry point is that something — ng-packagr refuses a cycle between entry points outright — so
 * this is the check that keeps the option open.
 *
 * Two rules:
 *
 *   A. shared-is-a-floor   Nothing in `lib/shared/` may import from `lib/components/` or
 *                          `lib/services/`. A helper that needs one belongs beside it.
 *   B. no-mutual-units     No two units may import each other, where a unit is a component
 *                          folder, `shared`, `services`, `styles` or `directives`. A cycle that
 *                          is legal today is a cycle that cannot be split tomorrow.
 *
 * Run via `npm run check:layering`.
 */

import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const libRoot = path.join(rootDir, 'projects/gleks/ui/src/lib');

/** A component folder, or the top-level bucket a file sits in. */
function unitOf(file) {
  const rel = path.relative(libRoot, file).split(path.sep).join('/');
  const [bucket, name] = rel.split('/');
  return bucket === 'components' || bucket === 'directives' ? `${bucket}/${name}` : bucket;
}

async function main() {
  const files = [];
  for await (const entry of glob('**/*.ts', { cwd: libRoot, withFileTypes: true })) {
    if (entry.isFile() && !entry.name.endsWith('.spec.ts')) {
      files.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }

  const edges = new Map();
  const where = new Map();
  for (const file of files) {
    const from = unitOf(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/from\s+'(\.[^']+)'/g)) {
      const to = unitOf(path.resolve(path.dirname(file), match[1]));
      if (to === from) continue;
      if (!edges.has(from)) edges.set(from, new Set());
      edges.get(from).add(to);
      where.set(`${from}->${to}`, path.relative(rootDir, file).split(path.sep).join('/'));
    }
  }

  const problems = [];

  for (const to of edges.get('shared') ?? []) {
    if (to.startsWith('components/') || to.startsWith('directives/') || to === 'services') {
      problems.push(
        `[shared-is-a-floor] ${where.get(`shared->${to}`)}\n` +
          `      lib/shared/ imports from ${to} — shared is the floor everything stands on, so a\n` +
          `      helper that needs a component or a service belongs beside it, not here`,
      );
    }
  }

  for (const [from, outs] of edges) {
    for (const to of outs) {
      if (from < to && edges.get(to)?.has(from)) {
        problems.push(
          `[no-mutual-units] ${from} <-> ${to}\n` +
            `      ${where.get(`${from}->${to}`)} and ${where.get(`${to}->${from}`)} import each\n` +
            `      other. Harmless in one flat bundle and impossible to split: ng-packagr refuses a\n` +
            `      cycle between secondary entry points. Move the shared half down, or merge them`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error('Layering check FAILED\n');
    for (const problem of problems) console.error(`  ${problem}\n`);
    console.error(`${problems.length} problem(s). See gleks-ui-library.instructions.md.`);
    process.exit(1);
  }

  const units = new Set([...edges.keys(), ...[...edges.values()].flatMap((s) => [...s])]);
  console.log(
    `Layering check passed — ${units.size} unit(s), no cycles, and lib/shared/ imports nothing above it.`,
  );
}

main();
