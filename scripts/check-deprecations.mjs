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

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = path.join(rootDir, 'projects/gleks/ui');
const uiSrc = path.join(uiRoot, 'src');

/** `since <version> (<date>) — <replacement>. Removed in <version>.` */
const TAG_HEAD_RE = /^since\s+(\d+\.\d+\.\d+)\s+\((\d{4}-\d{2}-\d{2})\)\s+—\s+(.+)$/s;
const REMOVAL_RE = /Removed in\s+(\d+\.\d+\.\d+)\./;

function compareVersions(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Reads a tag's text starting at the line holding `@deprecated`.
 *
 * A tag runs to the end of its own paragraph, not to the end of the comment: several blocks
 * here continue with migration prose after the tag, and one (`column.ts`) puts the tag in a
 * `//` comment inside a decorator. So collection stops at the next JSDoc tag, a blank comment
 * line, the end of the block, or the first line that is not a comment at all.
 */
function readTag(lines, startIndex) {
  const parts = [];
  for (let i = startIndex; i < lines.length; i++) {
    const raw = lines[i];
    const isBlockLine = /^\s*\*/.test(raw);
    const isLineComment = /^\s*\/\//.test(raw);
    if (i > startIndex && !isBlockLine && !isLineComment) break;

    let text = raw
      .replace(/^\s*\/\*+/, '')
      .replace(/^\s*\/\//, '')
      .replace(/^\s*\*(?!\/)/, '')
      .replace(/\*\/\s*$/, '')
      .trim();

    if (i === startIndex) {
      text = text.slice(text.indexOf('@deprecated') + '@deprecated'.length).trim();
    } else {
      if (text === '' || text.startsWith('@')) break;
    }

    parts.push(text);
    if (/\*\/\s*$/.test(raw)) break;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** The first line of real code after the tag — enough to name what the tag is on. */
function readContext(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw === '' || raw.startsWith('*') || raw.startsWith('//') || raw.startsWith('/*')) {
      continue;
    }
    return raw.length > 90 ? `${raw.slice(0, 87)}…` : raw;
  }
  return '';
}

async function main() {
  const currentVersion = JSON.parse(
    readFileSync(path.join(uiRoot, 'package.json'), 'utf8'),
  ).version;

  const files = [];
  for await (const entry of glob('**/*.ts', { cwd: uiSrc, withFileTypes: true })) {
    if (entry.isFile()) files.push(path.join(entry.parentPath ?? entry.path, entry.name));
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
      const text = readTag(lines, i);
      const head = TAG_HEAD_RE.exec(text);

      if (!head) {
        problems.push(
          `[format] ${label}\n      @deprecated ${text}\n      does not match \`@deprecated since <version> (<YYYY-MM-DD>) — <replacement>. Removed in <version>.\``,
        );
        continue;
      }

      const [, since, date, rest] = head;
      const removal = REMOVAL_RE.exec(rest);
      if (!removal) {
        problems.push(
          `[format] ${label}\n      no \`Removed in <version>.\` — a deprecation without a removal version never comes due`,
        );
        continue;
      }

      const replacement = rest.slice(0, removal.index).trim();
      if (replacement === '') {
        problems.push(
          `[format] ${label}\n      names no replacement between the date and the removal version`,
        );
        continue;
      }

      const removedIn = removal[1];
      if (compareVersions(removedIn, since) <= 0) {
        problems.push(
          `[format] ${label}\n      removal version ${removedIn} is not after the deprecation version ${since}`,
        );
        continue;
      }

      tags.push({ at: label, since, date, removedIn });

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
