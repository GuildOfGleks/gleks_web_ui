#!/usr/bin/env node
// Verifies the rule in .github/instructions/styling.instructions.md's "Design-token
// contract": a `var(--gog-*)` read with no fallback resolves to nothing if the token is
// never declared anywhere — the declaration becomes invalid at computed-value time and
// silently drops to `transparent`/`initial` instead of falling back to the previous value.
// A fallback chain (`var(--gog-btn-bg, var(--gog-btn-primary-bg))`) is exempt: as long as
// the chain bottoms out at a declared token, it is safe by construction.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSrc = path.join(rootDir, 'projects/gleks/ui/src');

const DECLARATION_RE = /(--gog-[a-zA-Z0-9-]+)\s*:/g;
const BARE_VAR_RE = /var\(\s*(--gog-[a-zA-Z0-9-]+)\s*\)/g;

async function collectFiles(dir, extensions) {
  const out = [];
  for await (const entry of glob('**/*', { cwd: dir, withFileTypes: true })) {
    if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      out.push(path.join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return out;
}

function findDeclared(content) {
  const found = new Set();
  for (const match of content.matchAll(DECLARATION_RE)) {
    found.add(match[1]);
  }
  return found;
}

function findBareReads(content) {
  const found = [];
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (const match of line.matchAll(BARE_VAR_RE)) {
      found.push({ token: match[1], line: i + 1 });
    }
  });
  return found;
}

async function main() {
  const themeCss = readFileSync(path.join(uiSrc, 'styles/theme.css'), 'utf8');
  const declared = findDeclared(themeCss);

  const scssFiles = await collectFiles(path.join(uiSrc, 'lib'), ['.scss']);
  for (const file of scssFiles) {
    const content = readFileSync(file, 'utf8');
    for (const token of findDeclared(content)) {
      declared.add(token);
    }
  }

  const problems = [];
  for (const file of scssFiles) {
    const content = readFileSync(file, 'utf8');
    for (const { token, line } of findBareReads(content)) {
      if (!declared.has(token)) {
        problems.push(`${path.relative(rootDir, file)}:${line}  ${token} has no default and no fallback`);
      }
    }
  }

  if (problems.length > 0) {
    console.error('Token consistency check failed:\n');
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
      `\n${problems.length} token(s) read with var(--gog-x) and no fallback are never declared in theme.css or any component .scss.`,
    );
    process.exit(1);
  }

  console.log(`Token consistency check passed (${declared.size} declared tokens, ${scssFiles.length} scss files scanned).`);
}

main();
