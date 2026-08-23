#!/usr/bin/env node
/**
 * Refuses to publish a tarball whose changelog does not describe the version being published.
 *
 * Two rules, both about the last manual step of a release:
 *
 *   A. version match  `CHANGELOG.md`'s top heading names the same version as `package.json`.
 *                     A bump without an entry ships notes that stop one release short, and the
 *                     documentation site — which renders this file out of `node_modules` — then
 *                     has no tab for the version its reader is running.
 *
 *   B. dated          That heading's date is a real date, not `planned`. `planned` is written by
 *                     whoever adds the entry and swapped for the date by whoever cuts the
 *                     release; the swap is the very last thing in a long list, and it is the one
 *                     with no consequence anywhere else, so nothing catches it.
 *
 * Rule B exists because it has already been missed twice in a row: 21.5.0 and 21.5.1 both went to
 * npm with `## [<version>] - planned` inside them, which is how a live release ends up telling a
 * reader it does not exist yet. 21.5.2 was cut to correct those two dates and to add this check.
 *
 * Deliberately not checked: whether the entry's *content* describes the change. No script can
 * know that, and pretending to check it would make the ones above look weaker than they are.
 *
 * **What this cannot catch, and did not:** content added to an entry that has *already shipped*.
 * A fix written into the released `## [21.6.0] - 23.08.2026` section passes every rule here —
 * version matches, date is real — while claiming the tarball on npm contains something it does
 * not. Caught by eye, not by this. The habit that avoids it is to open a new `- planned` heading
 * the moment a release goes out, rather than when the next change arrives.
 *
 * Wired into `npm run release`, ahead of the build. Run it on its own with
 * `npm run check:release`.
 */
import { readFileSync } from 'node:fs';

const PACKAGE = 'projects/gleks/ui/package.json';
const CHANGELOG = 'projects/gleks/ui/CHANGELOG.md';

const { version } = JSON.parse(readFileSync(PACKAGE, 'utf8'));
const changelog = readFileSync(CHANGELOG, 'utf8');

const heading = /^## \[([^\]]+)\](?: - (.+))?$/m.exec(changelog);

if (!heading) {
  console.error(
    `Release check failed — no \`## [<version>] - <date>\` heading found in ${CHANGELOG}.`,
  );
  process.exit(1);
}

const [, headingVersion, headingDate = ''] = heading;
const problems = [];

if (headingVersion !== version) {
  problems.push(
    `${PACKAGE} is at ${version}, but the changelog's top entry is [${headingVersion}].\n` +
      `    Add an entry for ${version}, or correct the version you are publishing.`,
  );
}

if (headingDate.trim() === 'planned') {
  problems.push(
    `The [${headingVersion}] heading still says \`planned\`.\n` +
      '    Swap it for the release date before publishing — it ships inside the tarball, and\n' +
      '    the documentation site renders it verbatim.',
  );
} else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(headingDate.trim())) {
  problems.push(
    `The [${headingVersion}] heading's date is \`${headingDate.trim()}\`, which is not DD.MM.YYYY.\n` +
      '    Every other entry in the file uses that shape, and the releases page parses it.',
  );
}

if (problems.length === 0) {
  console.log(
    `Release check passed — changelog's top entry is [${headingVersion}] ${headingDate}.`,
  );
  process.exit(0);
}

console.error(`Release check failed — ${problems.length} problem(s).\n`);
for (const problem of problems) console.error(`  ${problem}\n`);
process.exit(1);
