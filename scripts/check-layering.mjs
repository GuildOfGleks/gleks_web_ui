#!/usr/bin/env node
/**
 * The library's own layering, as a build failure rather than as a habit.
 *
 * `gleks-ui-library.instructions.md` sets it out: shared code holds "cross-component types,
 * tokens, utils" and components use it. Since `docs/entry-points.md` phase 1a, shared code is
 * also its own entry point, `@guildofgleks/ui/shared`, in `projects/gleks/ui/shared/` beside the
 * root's `src/` — and that turned three habits into invariants a build depends on:
 *
 *   A. shared-is-a-floor   Nothing in `shared/` may import the root package or reach out of its
 *                          own directory. The root imports shared; shared importing the root
 *                          back is a cycle ng-packagr refuses outright.
 *   B. no-mutual-units     No two units may import each other, where a unit is a component
 *                          folder, `shared`, `services`, `styles` or `directives`. A cycle that
 *                          is legal in one bundle is a cycle that cannot be split later.
 *   C. shared-by-package   Nothing outside `shared/` may import a shared module by relative path.
 *                          This is the rule the entry point exists for: a file compiled into two
 *                          bundles is two copies, and two copies of `GOG_CONFIG` are two different
 *                          `InjectionToken`s — `provideGogConfig` reaches one and silently misses
 *                          the other. Only `@guildofgleks/ui/shared` keeps it one.
 *   D. root-never-imports-a-split
 *                          Nothing in `src/` or `shared/` may import `@guildofgleks/ui/table`,
 *                          `/datepicker` or `/dialog`. The whole benefit of splitting them rests on
 *                          it: a root that imports a split entry point pulls it back into the
 *                          initial bundle of every app, silently, with every build green.
 *
 * **This check went blind once already, which is why it counts what it sees.** Before rule C, the
 * move left it scanning a `lib/shared/` that no longer existed: it reported 29 units instead of
 * 36, "no cycles", and a floor rule that examined no files at all. A layering check that passes on
 * nothing is worse than none, so it now fails if `shared/` holds no source.
 *
 * Run via `npm run check:layering`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = path.join(rootDir, 'projects/gleks/ui');
const libRoot = path.join(uiRoot, 'src/lib');
const sharedRoot = path.join(uiRoot, 'shared');

const ROOT_PACKAGE = '@guildofgleks/ui';
const SHARED_PACKAGE = '@guildofgleks/ui/shared';

/**
 * Entry points split out of the root so a lazy route can keep them out of the initial bundle.
 * The root must never import one: docs/entry-points.md measured that a root which re-exports a
 * module drags it into every app that imports anything from the root, and the split then does
 * nothing at all while every build stays green.
 */
const SPLIT_ENTRY_POINTS = ['table', 'datepicker', 'dialog'];

const rel = (file) => path.relative(rootDir, file).split(path.sep).join('/');

/** A component folder, a `src/lib` bucket, or `shared` for the entry point beside `src/`. */
function unitOf(file) {
  if (!path.relative(sharedRoot, file).startsWith('..')) return 'shared';
  const inLib = path.relative(libRoot, file).split(path.sep).join('/');
  if (inLib.startsWith('..')) return 'root';
  const [bucket, name] = inLib.split('/');
  return bucket === 'components' || bucket === 'directives' ? `${bucket}/${name}` : bucket;
}

async function collect(cwd) {
  const files = [];
  if (!existsSync(cwd)) return files;
  for await (const entry of glob('**/*.ts', { cwd, withFileTypes: true })) {
    if (entry.isFile() && !entry.name.endsWith('.spec.ts')) {
      files.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return files;
}

async function main() {
  const libFiles = await collect(libRoot);
  const sharedFiles = await collect(sharedRoot);

  const problems = [];
  if (sharedFiles.length === 0) {
    problems.push(
      `[blind] ${rel(sharedRoot)} holds no source\n` +
        `      the shared entry point moved or emptied, and every rule below would pass on nothing`,
    );
  }

  const edges = new Map();
  const where = new Map();
  const addEdge = (from, to, file) => {
    if (to === from) return;
    if (!edges.has(from)) edges.set(from, new Set());
    edges.get(from).add(to);
    if (!where.has(`${from}->${to}`)) where.set(`${from}->${to}`, rel(file));
  };

  for (const file of [...libFiles, ...sharedFiles]) {
    const from = unitOf(file);
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
      const specifier = match[1];

      if (specifier === SHARED_PACKAGE) {
        addEdge(from, 'shared', file);
        continue;
      }
      const split = SPLIT_ENTRY_POINTS.find((name) => specifier === `${ROOT_PACKAGE}/${name}`);
      if (split) {
        problems.push(
          `[root-never-imports-a-split] ${rel(file)}
` +
            `      imports ${specifier} — the root and shared must not depend on a split entry point,
` +
            `      or it rides into every app's initial bundle and the split buys nothing`,
        );
        continue;
      }
      if (specifier === ROOT_PACKAGE) {
        addEdge(from, 'root', file);
        if (from === 'shared') {
          problems.push(
            `[shared-is-a-floor] ${rel(file)}\n` +
              `      shared/ imports ${ROOT_PACKAGE} — the root imports shared, so this is a cycle\n` +
              `      ng-packagr refuses. A helper that needs a component belongs beside it, not here`,
          );
        }
        continue;
      }
      if (!specifier.startsWith('.')) continue;

      const target = path.resolve(path.dirname(file), specifier);
      const to = unitOf(target);

      if (from === 'shared' && to !== 'shared') {
        problems.push(
          `[shared-is-a-floor] ${rel(file)}\n` +
            `      shared/ reaches out of its own directory (${specifier}) — an entry point owns its\n` +
            `      files, and shared is the floor the rest of the package stands on`,
        );
        continue;
      }
      if (from !== 'shared' && to === 'shared') {
        problems.push(
          `[shared-by-package] ${rel(file)}\n` +
            `      imports ${specifier} by relative path — compile shared into this bundle and\n` +
            `      GOG_CONFIG exists twice, as two InjectionTokens. Import ${SHARED_PACKAGE}`,
        );
        continue;
      }
      addEdge(from, to, file);
    }
  }

  for (const [from, outs] of edges) {
    for (const to of outs) {
      if (from < to && edges.get(to)?.has(from)) {
        problems.push(
          `[no-mutual-units] ${from} <-> ${to}\n` +
            `      ${where.get(`${from}->${to}`)} and ${where.get(`${to}->${from}`)} import each\n` +
            `      other. Harmless in one bundle and impossible to split: ng-packagr refuses a cycle\n` +
            `      between entry points. Move the shared half down, or merge them`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error('Layering check FAILED\n');
    for (const problem of problems) console.error(`  ${problem}\n`);
    console.error(`${problems.length} problem(s). See docs/entry-points.md.`);
    process.exit(1);
  }

  const units = new Set([...edges.keys(), ...[...edges.values()].flatMap((s) => [...s])]);
  units.delete('root');
  console.log(
    `Layering check passed — ${units.size} unit(s) across ${libFiles.length + sharedFiles.length} ` +
      `file(s), no cycles, shared/ (${sharedFiles.length} file(s)) imports nothing above it, and ` +
      `nothing outside it imports shared by relative path.`,
  );
}

main();
