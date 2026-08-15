#!/usr/bin/env node
/**
 * Extracts the text of every documentation example into a generated map **per component folder**:
 * `projects/gleks-ui-lab/src/app/examples/<component>/sources.generated.ts`.
 *
 * **Why a generator rather than an import.** A doc page needs two things from an example: the
 * component, to render it live, and its source, to show it. Angular's build has no supported way
 * to import a file's own text (`?raw` is a Vite/webpack loader convention that
 * `@angular/build:application` does not expose), so the text is produced at build time instead —
 * the same trade `generate-tokens.mjs` makes for `theme.css`. `scripts/build-lab.mjs` runs this
 * before every build, and `--check` fails when a checked-in map is out of date.
 *
 * **Why per folder and not one big map.** The map is keyed by the class itself rather than by its
 * name — a name would be a string to keep in step, and would break under a minifier that renames
 * classes — so the file has to import every example it describes. One global map would therefore
 * drag all ~216 examples into whichever page imported it; per folder, a page pays for its own.
 *
 * **Why three sources per example.** An example is a component written the way a consumer writes
 * one — markup, class and styles in their own files — so the page shows the three files that
 * exist rather than one string with a template embedded in it. The map therefore carries a
 * `{ ts, html, css }` triple per example, which is also exactly what StackBlitz needs to write.
 *
 * Convention, enforced by `scripts/check-lab-examples.mjs`:
 *   src/app/examples/<component>/<name>/example.ts     exporting exactly one `*Example` class
 *   src/app/examples/<component>/<name>/example.html   one root `<div class="example">`
 *   src/app/examples/<component>/<name>/example.css    styles for that root, no `:host`
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesDir = path.join(rootDir, 'projects/gleks-ui-lab/src/app/examples');

/** `button` → `BUTTON_EXAMPLE_SOURCES`, the const a page provides. */
function mapConstName(folder) {
  return `${folder.replace(/-/g, '_').toUpperCase()}_EXAMPLE_SOURCES`;
}

/**
 * The class a page will reference. Exactly one per file: two would make "the source of this
 * example" ambiguous, and the page has no way to say which it meant.
 */
function exampleClassName(source, file) {
  const names = [...source.matchAll(/export class (\w+Example)\b/g)].map((m) => m[1]);
  if (names.length !== 1) {
    throw new Error(
      `${path.relative(rootDir, file)}: expected exactly one exported \`*Example\` class, found ${
        names.length
      }${names.length ? ` (${names.join(', ')})` : ''}.`,
    );
  }
  return names[0];
}

/**
 * What the reader sees: the file's own text, minus any line marked `// docs-hide` — the escape
 * hatch for an import or provider a page needs to mount the example but that would only distract
 * in a snippet someone is about to paste.
 */
function displaySource(source) {
  return source
    .split('\n')
    .filter((line) => !line.includes('// docs-hide'))
    .join('\n')
    .trimEnd();
}

function folders() {
  try {
    return readdirSync(examplesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

/** The example folders inside one component folder — those holding an `example.ts`. */
function examplesIn(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(path.join(dir, name, 'example.ts')))
    .sort();
}

/** One `{ path, content }` per folder that holds at least one example. */
export function buildSourceMaps() {
  const outputs = [];

  for (const folder of folders()) {
    const dir = path.join(examplesDir, folder);
    const names = examplesIn(dir);
    if (!names.length) continue;

    const entries = names.map((name) => {
      const file = path.join(dir, name, 'example.ts');
      const ts = readFileSync(file, 'utf8');
      return {
        name,
        className: exampleClassName(ts, file),
        ts: displaySource(ts),
        html: displaySource(readFileSync(path.join(dir, name, 'example.html'), 'utf8')),
        css: displaySource(readFileSync(path.join(dir, name, 'example.css'), 'utf8')),
      };
    });

    const imports = entries
      .map((e) => `import { ${e.className} } from './${e.name}/example';`)
      .join('\n');
    const pairs = entries
      .map(
        (e) =>
          `  [${e.className}, { html: ${JSON.stringify(e.html)}, ts: ${JSON.stringify(
            e.ts,
          )}, css: ${JSON.stringify(e.css)} }],`,
      )
      .join('\n');

    outputs.push({
      path: path.join(dir, 'sources.generated.ts'),
      content: `// GENERATED FILE — do not edit by hand.
// Run \`npm run generate:examples\` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

${imports}

/** The three files of each example in this folder, keyed by the example component itself. */
export const ${mapConstName(folder)}: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
${pairs}
]);
`,
    });
  }

  return outputs;
}

async function format(content, filepath) {
  const config = (await prettier.resolveConfig(filepath)) ?? {};
  return prettier.format(content, { ...config, filepath });
}

const normalize = (s) => s.replace(/\r\n/g, '\n');

async function main() {
  const outputs = await Promise.all(
    buildSourceMaps().map(async (o) => ({ ...o, content: await format(o.content, o.path) })),
  );

  if (process.argv.includes('--check')) {
    const stale = [];
    for (const { path: filepath, content } of outputs) {
      let current = '';
      try {
        current = readFileSync(filepath, 'utf8');
      } catch {
        stale.push(path.relative(rootDir, filepath) + ' (missing)');
        continue;
      }
      if (normalize(current) !== normalize(content)) stale.push(path.relative(rootDir, filepath));
    }
    if (stale.length) {
      console.error(
        `Example source maps are out of date:\n  ${stale.join('\n  ')}\n\nRun \`npm run generate:examples\`.`,
      );
      process.exit(1);
    }
    console.log(`Example sources are up to date — ${outputs.length} folder(s).`);
    return;
  }

  let count = 0;
  for (const { path: filepath, content } of outputs) {
    let existing = '';
    try {
      existing = readFileSync(filepath, 'utf8');
    } catch {
      /* new folder */
    }
    const crlf = existing.includes('\r\n');
    writeFileSync(filepath, crlf ? content.replace(/\r?\n/g, '\r\n') : content, 'utf8');
    // Counted from the imports, which prettier cannot reflow onto other lines.
    count += (content.match(/^import \{ \w+Example \}/gm) ?? []).length;
  }
  console.log(`Generated ${count} example source(s) across ${outputs.length} folder(s).`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
