#!/usr/bin/env node
// `ng build gleks-ui-lab` finishes its work (bundle + prerender) and then never exits — a
// documented Angular CLI teardown bug (see .github/instructions/running-commands.instructions.md
// for what was ruled out: proxy env vars, prerendering, .angular/cache, server.ts, the npm
// wrapper). That's harmless in an interactive shell but fatal for `docker build`, which waits on
// the process forever with no timeout. This wrapper runs the real build, watches its output for
// the completion marker Angular CLI prints last, and kills the process itself once the work is
// actually done — so `npm run build:lab` behaves like every other script in this workspace.

import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ngBin = path.join(rootDir, 'node_modules/@angular/cli/bin/ng.js');

// Generated inputs, refreshed before every build — including the Dockerfile's — so a deploy can
// never ship a stale one:
//
//   - the sitemap, derived from the sidebar's nav-data (writes into `public/`, an asset input);
//   - the example source maps, derived from `src/app/examples/**` (compiled into the app).
//
// `check-lab-examples.mjs` runs with them, and fails the build rather than shipping a demo whose
// markup and stylesheet have drifted apart — the failure mode that has no compiler behind it.
for (const script of [
  'scripts/generate-sitemap.mjs',
  'scripts/generate-example-sources.mjs',
  'scripts/check-lab-examples.mjs',
]) {
  const result = spawnSync(process.execPath, [path.join(rootDir, script)], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.stderr.write(`build-lab: ${script} failed — not starting the build.\n`);
    process.exit(result.status ?? 1);
  }
}

const SUCCESS_MARKER = /Output location:/;
const MAX_WAIT_MS = 90_000;
const GRACE_MS = 500;

const child = spawn(process.execPath, [ngBin, 'build', 'gleks-ui-lab'], {
  cwd: rootDir,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let markerSeen = false;
let finished = false;

function finish(code) {
  if (finished) return;
  finished = true;
  clearTimeout(watchdog);
  child.kill('SIGKILL');
  process.exit(code);
}

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  output += chunk;
  if (!markerSeen && SUCCESS_MARKER.test(output)) {
    markerSeen = true;
    // Angular CLI keeps writing for a moment after the marker — let that land before killing it.
    setTimeout(() => finish(0), GRACE_MS);
  }
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

child.on('exit', (code) => {
  // Should never fire before the marker — this whole script exists because it doesn't — but if
  // a future Angular CLI release fixes the teardown, honor its real exit code instead of racing it.
  finish(code ?? 1);
});

const watchdog = setTimeout(() => {
  process.stderr.write(
    `\nbuild-lab: no "Output location:" after ${MAX_WAIT_MS}ms — this is a real failure, not the known hang.\n`,
  );
  finish(1);
}, MAX_WAIT_MS);
