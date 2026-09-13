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
 *                          `/datepicker` or `/dialog` — by package name or by relative path. The
 *                          whole benefit of splitting them rests on it: a root that imports a split
 *                          entry point pulls it back into the initial bundle of every app, silently,
 *                          with every build green.
 *   E. split-imports-by-package
 *                          A split entry point's directory may not reach into `src/` or another
 *                          split directory by relative path. ng-packagr refuses an entry point that
 *                          does not own its files, and a relative path would compile the root's
 *                          components into the split bundle a second time. It imports
 *                          `@guildofgleks/ui` instead (docs/entry-points.md, Part 2, finding 4).
 *
 * **This check went blind once already, which is why it counts what it sees.** Before rule C, the
 * move left it scanning a `lib/shared/` that no longer existed: it reported 29 units instead of
 * 36, "no cycles", and a floor rule that examined no files at all. A layering check that passes on
 * nothing is worse than none, so it now fails if `shared/` or any split directory holds no source.
 *
 * Run via `npm run check:layering`.
 */

import { existsSync, readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROOT_LIB_DIR as libRoot,
  SHARED_DIR as sharedRoot,
  SPLIT_DIRS,
  SPLIT_ENTRY_POINTS,
} from './library-sources.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ROOT_PACKAGE = '@guildofgleks/ui';
const SHARED_PACKAGE = '@guildofgleks/ui/shared';

const rel = (file) => path.relative(rootDir, file).split(path.sep).join('/');

/** `split:<name>`, `shared`, a component folder or a `src/lib` bucket — or `root` for `src/` itself. */
function unitOf(file) {
  if (!path.relative(sharedRoot, file).startsWith('..')) return 'shared';
  const split = SPLIT_DIRS.findIndex((dir) => !path.relative(dir, file).startsWith('..'));
  if (split !== -1) return `split:${SPLIT_ENTRY_POINTS[split]}`;
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
  const splitFiles = (await Promise.all(SPLIT_DIRS.map(collect))).flat();

  const problems = [];
  for (const [dir, count] of [
    [sharedRoot, sharedFiles.length],
    ...SPLIT_DIRS.map((d) => [
      d,
      splitFiles.filter((f) => !path.relative(d, f).startsWith('..')).length,
    ]),
  ]) {
    if (count === 0) {
      problems.push(
        `[blind] ${rel(dir)} holds no source\n` +
          `      the entry point moved or emptied, and every rule below would pass on nothing`,
      );
    }
  }

  const edges = new Map();
  const where = new Map();
  const addEdge = (from, to, file) => {
    if (to === from) return;
    if (!edges.has(from)) edges.set(from, new Set());
    edges.get(from).add(to);
    if (!where.has(`${from}->${to}`)) where.set(`${from}->${to}`, rel(file));
  };

  for (const file of [...libFiles, ...sharedFiles, ...splitFiles]) {
    const from = unitOf(file);
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
      const specifier = match[1];

      if (specifier === SHARED_PACKAGE) {
        addEdge(from, 'shared', file);
        continue;
      }
      const split = SPLIT_ENTRY_POINTS.find((name) => specifier === `${ROOT_PACKAGE}/${name}`);
      if (split && from.startsWith('split:')) {
        addEdge(from, `split:${split}`, file);
        continue;
      }
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

      if (from.startsWith('split:') && to !== from && to !== 'shared') {
        problems.push(
          `[split-imports-by-package] ${rel(file)}\n` +
            `      reaches ${specifier} by relative path — a split entry point owns its files and\n` +
            `      imports the rest of the library as ${ROOT_PACKAGE}`,
        );
        continue;
      }
      if (to.startsWith('split:') && !from.startsWith('split:')) {
        problems.push(
          `[root-never-imports-a-split] ${rel(file)}\n` +
            `      reaches ${specifier} by relative path — the root must not depend on a split entry\n` +
            `      point, or it rides into every app's initial bundle`,
        );
        continue;
      }

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
  const fileCount = libFiles.length + sharedFiles.length + splitFiles.length;
  console.log(
    `Layering check passed — ${units.size} unit(s) across ${fileCount} ` +
      `file(s), no cycles, shared/ (${sharedFiles.length} file(s)) imports nothing above it, and ` +
      `nothing outside it imports shared by relative path; ${SPLIT_DIRS.length} split entry point(s) ` +
      `(${splitFiles.length} file(s)) import the root by package name and nothing imports them back.`,
  );
}

main();
