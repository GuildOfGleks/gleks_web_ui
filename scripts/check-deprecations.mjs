#!/usr/bin/env node
/**
 * Enforces the deprecation lifecycle from
 * `.github/instructions/api-design.instructions.md` ("Breaking changes & the deprecation
 * lifecycle"). Two rules, both about the same thing — a deprecation is a dated promise, and a
 * promise nothing checks is decoration:
 *
 *   A. format    Every `@deprecated` tag in the library source spells out all four parts, in
 *                order: the version it was deprecated in, the date in `(YYYY-MM-DD)`, the
 *                replacement, and the version that removes it —
 *
 *                  @deprecated since 21.3.0 (2026-08-07) — use `gog-column` instead. Removed in 21.5.0.
 *
 *                The format is fixed so the whole set stays greppable and machine-readable;
 *                a tag missing the removal version is a deprecation that can never come due.
 *
 *   B. on-time   No tag may name a removal version at or below the library's current version
 *                in `projects/gleks/ui/package.json`. Once the version being worked on has
 *                reached the removal date, the symbol goes — the check is what turns
 *                "removal happens on schedule, not when someone gets round to it" into a build
 *                failure.
 *
 * This exists because the ratchet has already slipped once in practice: `GogSelectOption` and
 * `GogMultiselectOption` were tagged `Removed in 21.4.0` and 21.4.0 shipped with both still
 * exported. See `docs/hardening-21.5.0.md`, iteration 3.
 *
 * Note what this *cannot* see: a removal promised in prose rather than by a tag (the
 * `./src/styles/*` export in `package.json`, promised in the README) has nothing to grep for.
 * Promise removals with a tag where a tag can be written.
 *
 * Run via `npm run check:deprecations`; runs in CI next to `check:tokens`.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import { compareVersions, parseTag, readContext, readTag } from './deprecations.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = path.join(rootDir, 'projects/gleks/ui');
const uiSrc = path.join(uiRoot, 'src');

/** Written by `generate-deprecations.mjs`; a record of tags, not a tag. */
const GENERATED_MANIFEST = 'deprecations.ts';

async function main() {
  const currentVersion = JSON.parse(
    readFileSync(path.join(uiRoot, 'package.json'), 'utf8'),
  ).version;

  const files = [];
  for await (const entry of glob('**/*.ts', { cwd: uiSrc, withFileTypes: true })) {
    // The generated manifest *describes* deprecations, so its prose says "@deprecated" without
    // being one. Scanning it would have this check fail on the artifact it feeds.
    if (entry.isFile() && entry.name !== GENERATED_MANIFEST) {
      files.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  files.sort();

  const problems = [];
  const tags = [];

  for (const file of files) {
    const where = path.relative(rootDir, file).replace(/\\/g, '/');
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes('@deprecated')) continue;

      const at = `${where}:${i + 1}`;
      const context = readContext(lines, i);
      const label = context ? `${at}\n      on: ${context}` : at;
      const parsed = parseTag(readTag(lines, i));
      if (!parsed.ok) {
        problems.push(`[format] ${label}
      ${parsed.problem}`);
        continue;
      }

      const { since, sinceDate, removedIn } = parsed.tag;
      tags.push({ at: label, since, sinceDate, removedIn });

      if (compareVersions(removedIn, currentVersion) <= 0) {
        problems.push(
          `[overdue] ${label}\n      tagged \`Removed in ${removedIn}\` but the library is already at ${currentVersion} — delete it, or move the tag's removal version and say so in CHANGELOG.md`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error('Deprecation ratchet check FAILED\n');
    for (const problem of problems) console.error(`  ${problem}\n`);
    console.error(
      `${problems.length} problem(s). See .github/instructions/api-design.instructions.md — "Breaking changes & the deprecation lifecycle".`,
    );
    process.exit(1);
  }

  const byVersion = new Map();
  for (const tag of tags) {
    byVersion.set(tag.removedIn, (byVersion.get(tag.removedIn) ?? 0) + 1);
  }
  const due = [...byVersion.entries()]
    .sort((a, b) => compareVersions(a[0], b[0]))
    .map(([version, count]) => `${version} (${count})`)
    .join(', ');

  console.log(
    `Deprecation ratchet check passed — ${tags.length} tag(s) in ${files.length} source file(s), ` +
      `library at ${currentVersion}. Due: ${due || 'nothing deprecated'}.`,
  );
}

main();
