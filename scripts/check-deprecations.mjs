#!/usr/bin/env node
/**
 * Enforces the deprecation lifecycle from
 * `.github/instructions/api-design.instructions.md` ("Breaking changes & the deprecation
 * lifecycle"). Three rules, all about the same thing — a deprecation is a dated promise, and a
 * promise nothing checks is decoration:
 *
 *   A. format       Every `@deprecated` tag in the library source spells out all four parts, in
 *                   order: the version it was deprecated in, the date in `(YYYY-MM-DD)`, the
 *                   replacement, and the version that removes it —
 *
 *                     @deprecated since 21.3.0 (2026-08-07) — use `gog-column` instead. Removed in 21.5.0.
 *
 *                   The format is fixed so the whole set stays greppable and machine-readable;
 *                   a tag missing the removal version is a deprecation that can never come due.
 *
 *   B. on-time      No tag may name a removal version at or below the library's current version
 *                   in `projects/gleks/ui/package.json`. Once the version being worked on has
 *                   reached the removal date, the symbol goes — the check is what turns
 *                   "removal happens on schedule, not when someone gets round to it" into a build
 *                   failure.
 *
 *   C. css-on-time  The same rule as B, for the CSS custom-property prefixes in
 *                   `DEPRECATED_NAMESPACES` (`deprecations.mjs`) — a token can't carry a `@deprecated`
 *                   tag a compiler sees, so its removal deadline lives in that map instead of in
 *                   source. Fails once a namespace's `removedIn` is at or below the current version
 *                   **and** the stylesheets still contain a token under it. Added 2026-08-28: until
 *                   then this half of the ratchet was pure documentation — `CLAUDE.md` claimed
 *                   `check:deprecations` would fail the build on an overdue token prefix, but the
 *                   script never read the CSS namespace map at all, so nothing enforced it. See
 *                   `docs/token-prefix-removal.md`, iteration 2.
 *
 * This exists because the ratchet has already slipped once in practice: `GogSelectOption` and
 * `GogMultiselectOption` were tagged `Removed in 21.4.0` and 21.4.0 shipped with both still
 * exported. See `docs/hardening-21.5.0.md`, iteration 3.
 *
 * Note what this *cannot* see: a removal promised in prose rather than by a tag or a
 * `DEPRECATED_NAMESPACES` entry (the `./src/styles/*` export in `package.json`, promised in the
 * README) has nothing to grep for. Promise removals with a tag, or a namespace entry, where one
 * can be written.
 *
 * Run via `npm run check:deprecations`; runs in CI next to `check:tokens`.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

import {
  collectDeprecatedTokens,
  compareVersions,
  DEPRECATED_NAMESPACES,
  parseTag,
  readContext,
  readTag,
} from './deprecations.mjs';

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

  // Rule C — the CSS half of the ratchet. Same sources generate-deprecations.mjs scans: the
  // flat *.css files directly under styles/ (theme.css, button.css, …) — not presets/, which
  // declares palette only, and not component .scss, which no longer carries any of these
  // prefixes after the 21.7.0 removal (see docs/token-prefix-removal.md, iteration 1).
  const cssSources = [];
  const cssFiles = [];
  for await (const entry of glob('*.css', {
    cwd: path.join(uiSrc, 'styles'),
    withFileTypes: true,
  })) {
    if (entry.isFile()) {
      const cssPath = path.join(entry.parentPath ?? entry.path, entry.name);
      cssFiles.push(cssPath);
      cssSources.push(readFileSync(cssPath, 'utf8'));
    }
  }

  const stillPresent = collectDeprecatedTokens(cssSources);
  const cssNamespacesDue = [];
  for (const [short, meta] of DEPRECATED_NAMESPACES) {
    cssNamespacesDue.push({ short, removedIn: meta.removedIn });
    if (compareVersions(meta.removedIn, currentVersion) > 0) continue;

    const survivors = stillPresent.filter((entry) => entry.name.startsWith(`--gog-${short}-`));
    if (survivors.length > 0) {
      const names = survivors.map((entry) => entry.name).join(', ');
      problems.push(
        `[css-overdue] --gog-${short}-* (deprecations.mjs, DEPRECATED_NAMESPACES)\n` +
          `      tagged \`removedIn: '${meta.removedIn}'\` but the library is already at ${currentVersion}, ` +
          `and the stylesheets still declare or read: ${names}`,
      );
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
  for (const { removedIn } of cssNamespacesDue) {
    byVersion.set(removedIn, (byVersion.get(removedIn) ?? 0) + 1);
  }
  const due = [...byVersion.entries()]
    .sort((a, b) => compareVersions(a[0], b[0]))
    .map(([version, count]) => `${version} (${count})`)
    .join(', ');

  console.log(
    `Deprecation ratchet check passed — ${tags.length} tag(s) in ${files.length} source file(s), ` +
      `${cssNamespacesDue.length} CSS namespace(s) in ${cssFiles.length} stylesheet(s), ` +
      `library at ${currentVersion}. Due: ${due || 'nothing deprecated'}.`,
  );
}

main();
