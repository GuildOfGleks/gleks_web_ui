#!/usr/bin/env node
/**
 * Every component with a `loading` input must set `aria-busy` on its host.
 *
 * ## Why
 *
 * A loading component replaces its content with something decorative — skeleton bones, a spinner
 * — and those are correctly `aria-hidden`, because announcing "bone, bone, bone" is worse than
 * saying nothing. The consequence is that without `aria-busy` the component is not *loading* to a
 * screen reader, it is **empty**: "there is nothing here" rather than "this is coming".
 *
 * The rule is in `.github/instructions/api-design.instructions.md`, "Loading states". This is the
 * part of it a script can hold.
 *
 * ## Why a check and not a review note
 *
 * It was written down as a rule *after* three of the five components with a `loading` input had
 * already shipped without it — `gog-accordion`, `gog-table` and `gog-autocomplete`, against
 * `gog-button` and `gog-spinner-overlay` which had it from the start and had specs for it. A rule
 * that half the library breaks is a rule nobody is enforcing, and nothing about the omission is
 * visible: the component renders, the tests pass, and the loading state looks right to everyone
 * who can see it.
 *
 * There is deliberately no allowlist. The check was added at the moment the last violation was
 * fixed, so an exception would only ever mean a regression.
 *
 * ## Where it looks
 *
 * The component's own source **and its template**. Both are legitimate: a component that renders
 * its own control puts the attribute on that control rather than on the host — `gog-button` does,
 * because a screen reader should hear the busy state on the `<button>` it is focused on, not on a
 * wrapper. Looking only at the `.ts` reports it as a violation, which it is not.
 *
 * Usage: node scripts/check-loading-aria.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'projects/gleks/ui/src/lib/components';

/** Every component source under `dir`, specs excluded — a test host may declare its own input. */
function componentsIn(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...componentsIn(path));
    else if (entry.endsWith('.component.ts')) found.push(path);
  }
  return found;
}

const problems = [];
let checked = 0;

for (const path of componentsIn(ROOT)) {
  const source = readFileSync(path, 'utf8');

  // `loading = input(...)`, with or without `readonly` and with or without a type argument.
  if (!/(?<![\w.])loading\s*=\s*input(<[^>]*>)?\s*\(/.test(source)) continue;
  checked += 1;

  const template = path.replace(/\.ts$/, '.html');
  const markup = existsSync(template) ? readFileSync(template, 'utf8') : '';

  if (!source.includes('aria-busy') && !markup.includes('aria-busy')) {
    problems.push(path);
  }
}

if (problems.length === 0) {
  console.log(
    `Loading-aria check passed — all ${checked} component(s) with a \`loading\` input set aria-busy.`,
  );
  process.exit(0);
}

console.error(
  `Loading-aria check failed — ${problems.length} of ${checked} component(s) with a \`loading\`\n` +
    'input do not set `aria-busy`. Their content is replaced by `aria-hidden` placeholders while\n' +
    'loading, so without it the component reads as empty rather than busy. Add to the host:\n\n' +
    `    '[attr.aria-busy]': 'loading() ? "true" : null',\n`,
);

for (const path of problems) console.error(`  ${path}`);

process.exit(1);
