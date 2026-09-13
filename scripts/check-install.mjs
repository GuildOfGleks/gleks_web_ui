#!/usr/bin/env node
/**
 * The consumer install check: the packed tarball, installed into a clean Angular app outside the
 * repository, built, prerendered and opened in a browser — the package the way a consumer gets it.
 *
 * **Why it exists.** `ui-showcase` resolves `@guildofgleks/ui` through a tsconfig path alias onto
 * `dist/gleks/ui`, so it never goes through `node_modules`, the `exports` map, `.npmignore`,
 * `peerDependencies` or the tarball's file list, and specs compile from source. A change that is
 * wrong only in how the package *ships* passes all of them. When this is required, and when it is
 * not, is in `.github/instructions/gleks-ui-library.instructions.md`, "The consumer install check".
 *
 * What it does, and fails on:
 *
 *   1. `npm run build:lib`, then `npm pack` of `dist/gleks/ui` into a scratch directory in the OS
 *      temp dir — never inside the repo, where the root tsconfig's `paths` would hijack resolution.
 *   2. **Against the last published version**, packed from the registry:
 *        - a file the new tarball no longer has fails, unless `--accept-removed-files`;
 *        - an export an entry point no longer has fails unless the top (in-progress) entry of
 *          `CHANGELOG.md` names it — a removal nobody announced is the one that breaks consumers.
 *   3. A fresh SSR app from the workspace's own Angular CLI version (`ng new --ssr`), the tarball
 *      installed with `npm install`, and the package's own `ng-add` schematic run on it — which
 *      must put the baseline stylesheet into `angular.json`.
 *   4. One page per public entry point, from `SMOKE` below, the root one eager and every other one
 *      behind `loadComponent`; `provideGogConfig` sets marker labels once, in the root. An entry
 *      point with no `SMOKE` page fails the check — a new one has to say how it is exercised.
 *   5. `ng build` with prerendering. An error fails; so does a warning that names the package. Each
 *      secondary entry point's lazy chunk must be at least its `minLazyBytes` — the 21.13.0 shape
 *      of this bug was a 442-byte chunk that left the whole component in the initial bundle.
 *   6. The prerendered HTML of each page must carry its expected marker labels, which is what proves
 *      the root's `GOG_CONFIG` reaches components from other entry points (two copies of the token
 *      would render the defaults instead).
 *   7. The app's own SSR server, driven by Playwright through the installed Chrome: every page loaded
 *      directly must hydrate with no console error and no page error; navigating from the first
 *      page to each lazy one must fetch a new script; and each page's `interact` step must pass.
 *
 * Slow on purpose — `ng new` installs a whole app — so it is not a CI step and not something to
 * run per commit. About three to five minutes.
 *
 *   node scripts/check-install.mjs [--keep] [--no-build] [--baseline <version>] [--accept-removed-files]
 *
 * `--keep` leaves the scratch directory in place (it is kept anyway when the check fails).
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist/gleks/ui');
const PACKAGE = '@guildofgleks/ui';
const APP = 'install-check';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

/** Labels no component ships by default, so finding one in the HTML proves the config reached it. */
const LABELS = {
  total: 'CHECK-TOTAL',
  today: 'CHECK-TODAY',
  closeDialog: 'CHECK-CLOSE',
};

/**
 * One page per public entry point. `imports` are named per module path; `components` is what the
 * template uses (an unused entry in `imports: []` is a compiler warning); `template` is the page;
 * `expectHtml` must appear in its prerendered HTML; `interact` runs against the live page.
 * Entry points in `INTERNAL` are not public and get no page.
 */
const INTERNAL = new Set([`${PACKAGE}/shared`]);
const SMOKE = {
  [PACKAGE]: {
    imports: { [PACKAGE]: ['ButtonComponent', 'IconComponent'] },
    components: ['ButtonComponent', 'IconComponent'],
    template: `<gog-button>Root</gog-button><gog-icon name="check" />`,
    expectHtml: [],
  },
  [`${PACKAGE}/table`]: {
    imports: { [`${PACKAGE}/table`]: ['GogColumn', 'TableComponent'] },
    components: ['GogColumn', 'TableComponent'],
    fields: `protected readonly rows = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];`,
    template: `<gog-table [value]="rows" [showTotal]="true" [pageSize]="2">
      <gog-column field="name" header="Name" />
    </gog-table>`,
    expectHtml: [LABELS.total],
    minLazyBytes: 2048,
  },
  [`${PACKAGE}/datepicker`]: {
    imports: { [`${PACKAGE}/datepicker`]: ['CalendarComponent', 'DatepickerComponent'] },
    components: ['CalendarComponent', 'DatepickerComponent'],
    template: `<gog-calendar /><gog-datepicker label="When" />`,
    expectHtml: [LABELS.today],
    minLazyBytes: 2048,
  },
  [`${PACKAGE}/dialog`]: {
    imports: {
      [PACKAGE]: ['ButtonComponent'],
      [`${PACKAGE}/dialog`]: ['ConfirmationDialogComponent', 'DialogComponent', 'DialogService'],
    },
    components: ['ButtonComponent', 'DialogComponent'],
    inject: `private readonly dialogs = inject(DialogService);`,
    fields: `protected open(): void {
    this.dialogs.open({
      title: 'Check',
      component: ConfirmationDialogComponent,
      data: { title: 'Check', description: 'Opened from the dialog entry point.', confirmText: 'Yes' },
    });
  }`,
    template: `<gog-button id="open" (gogClick)="open()">Open</gog-button><gog-dialog />`,
    expectHtml: [],
    minLazyBytes: 1024,
    async interact(page) {
      await page.click('#open button, #open');
      await page.waitForSelector(`[aria-label="${LABELS.closeDialog}"]`, { timeout: 5000 });
    },
  },
};

const problems = [];
const notes = [];
const step = (text) => console.log(`\n▸ ${text}`);

function run(command, commandArgs, { cwd = rootDir, timeoutMs = 600_000, allowFail = false } = {}) {
  // One command string rather than an argument array: `npm`/`npx` are `.cmd` shims on Windows and
  // need a shell, and Node deprecates handing an array to a shell (DEP0190) because it does not
  // quote. Nothing here passes an argument with a space except a path, which is quoted below.
  const line = [command, ...commandArgs.map((a) => (/\s/.test(a) ? `"${a}"` : a))].join(' ');
  const result = spawnSync(line, {
    cwd,
    encoding: 'utf8',
    shell: true,
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false', CI: 'true' },
  });
  const strip = (text) => (text ?? '').replace(/\x1b\[[0-9;]*m/g, '');
  const output = `${strip(result.stdout)}${strip(result.stderr)}`;
  if (result.status !== 0 && !allowFail) {
    throw new Error(
      `${command} ${commandArgs.join(' ')} exited ${result.status}\n${output.slice(-4000)}`,
    );
  }
  // `stdout` on its own as well: `npm pack` prints the file name there and its notices on stderr.
  return { status: result.status, output, stdout: strip(result.stdout) };
}

/** Every entry in a `.tgz`, name → contents, with npm's `package/` prefix removed. */
function readTarball(file) {
  const data = gunzipSync(readFileSync(file));
  const entries = new Map();
  let offset = 0;
  let paxPath = null;
  while (offset + 512 <= data.length) {
    const header = data.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) =>
      header
        .subarray(start, start + length)
        .toString('utf8')
        .replace(/\0.*$/s, '');
    const size = parseInt(field(124, 12).trim() || '0', 8);
    const type = field(156, 1);
    const prefix = field(345, 155);
    const body = data.subarray(offset + 512, offset + 512 + size);
    if (type === 'x') {
      const match = body.toString('utf8').match(/\d+ path=([^\n]*)\n/);
      paxPath = match ? match[1] : null;
    } else if (type === '0' || type === '') {
      const name = paxPath ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
      entries.set(name.replace(/^package\//, ''), Buffer.from(body));
      paxPath = null;
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}

/** Public entry points of a packed package: module path → the text of its bundled `.d.ts`. */
function entryPoints(entries) {
  const manifest = JSON.parse(entries.get('package.json').toString('utf8'));
  const found = new Map();
  for (const [key, target] of Object.entries(manifest.exports ?? {})) {
    if (!target?.types) continue;
    const specifier = key === '.' ? PACKAGE : `${PACKAGE}/${key.slice(2)}`;
    const types = entries.get(target.types.replace(/^\.\//, ''));
    found.set(specifier, types ? types.toString('utf8') : '');
  }
  return found;
}

/** Every name a bundled `.d.ts` exports, values and types alike. */
function exportedNames(dts) {
  const names = new Set();
  for (const match of dts.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}/gm)) {
    for (const raw of match[1].split(',')) {
      const name = raw
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.add(name);
    }
  }
  return names;
}

function topChangelogEntry() {
  const changelog = readFileSync(path.join(rootDir, 'projects/gleks/ui/CHANGELOG.md'), 'utf8');
  const start = changelog.indexOf('\n## [');
  const next = changelog.indexOf('\n## [', start + 1);
  return changelog.slice(start, next === -1 ? undefined : next);
}

function compareWithBaseline(scratch, newEntries) {
  const baseline = option('--baseline') ?? run('npm', ['view', PACKAGE, 'version']).stdout.trim();
  step(`Comparing with the published ${PACKAGE}@${baseline}`);
  // Its own directory, and this is not tidiness: until the version is bumped the local tarball has
  // the published one's file name, and packing the baseline beside it silently replaced it — the
  // first run of this check installed the published package and reported on that instead.
  const baselineDir = path.join(scratch, 'baseline');
  mkdirSync(baselineDir, { recursive: true });
  const packed = run('npm', ['pack', `${PACKAGE}@${baseline}`, '--pack-destination', baselineDir], {
    cwd: baselineDir,
  });
  const baselineFile = path.join(baselineDir, packed.stdout.trim().split(/\r?\n/).pop());
  const oldEntries = readTarball(baselineFile);

  const removedFiles = [...oldEntries.keys()].filter((name) => !newEntries.has(name));
  const addedFiles = [...newEntries.keys()].filter((name) => !oldEntries.has(name));
  notes.push(
    `files: ${oldEntries.size} in ${baseline}, ${newEntries.size} now (+${addedFiles.length} / -${removedFiles.length})`,
  );
  if (removedFiles.length > 0 && !flag('--accept-removed-files')) {
    problems.push(
      `[removed-files] ${removedFiles.length} file(s) the published ${baseline} has and this tarball does not:\n` +
        removedFiles.map((f) => `      ${f}`).join('\n') +
        `\n      if every one is intended, re-run with --accept-removed-files`,
    );
  }

  const changelog = topChangelogEntry();
  const oldApi = entryPoints(oldEntries);
  const newApi = entryPoints(newEntries);
  for (const [specifier, dts] of oldApi) {
    const before = exportedNames(dts);
    const after = exportedNames(newApi.get(specifier) ?? '');
    const removed = [...before].filter((name) => !after.has(name));
    const added = [...after].filter((name) => !before.has(name));
    if (removed.length || added.length) {
      notes.push(
        `${specifier}: +${added.length} / -${removed.length} export(s)${removed.length ? ` (removed: ${removed.join(', ')})` : ''}`,
      );
    }
    const unannounced = removed.filter((name) => !changelog.includes(name));
    if (unannounced.length > 0) {
      problems.push(
        `[unannounced-removal] ${specifier} no longer exports ${unannounced.join(', ')}\n` +
          `      and the top CHANGELOG.md entry does not name them — a consumer's build breaks on this`,
      );
    }
  }
  for (const specifier of newApi.keys()) {
    if (!oldApi.has(specifier)) notes.push(`${specifier}: new entry point`);
  }
}

function writeApp(appDir, specifiers) {
  const src = path.join(appDir, 'src/app');
  const pages = [];
  for (const specifier of specifiers) {
    const smoke = SMOKE[specifier];
    const slug = specifier === PACKAGE ? 'root' : specifier.slice(PACKAGE.length + 1);
    const className = `Page${slug[0].toUpperCase()}${slug.slice(1)}`;
    const importLines = Object.entries(smoke.imports)
      .map(([from, names]) => `import { ${names.join(', ')} } from '${from}';`)
      .join('\n');
    writeFileSync(
      path.join(src, `ep-${slug}.ts`),
      `import { Component${smoke.inject ? ', inject' : ''} } from '@angular/core';
${importLines}

@Component({
  selector: 'app-ep-${slug}',
  imports: [${smoke.components.join(', ')}],
  template: \`${smoke.template}\`,
})
export class ${className} {
  ${smoke.inject ?? ''}
  ${smoke.fields ?? ''}
}
`,
    );
    pages.push({ specifier, slug, className, smoke });
  }

  const routes = pages
    .map((p) =>
      p.specifier === PACKAGE
        ? `  { path: '', loadComponent: () => import('./ep-root').then((m) => m.${p.className}) },`
        : `  { path: '${p.slug}', loadComponent: () => import('./ep-${p.slug}').then((m) => m.${p.className}) },`,
    )
    .join('\n');
  writeFileSync(
    path.join(src, 'app.routes.ts'),
    `import { Routes } from '@angular/router';\n\nexport const routes: Routes = [\n${routes}\n];\n`,
  );
  writeFileSync(
    path.join(src, 'app.ts'),
    `import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: \`<nav>${pages.map((p) => `<a id="nav-${p.slug}" routerLink="/${p.specifier === PACKAGE ? '' : p.slug}">${p.slug}</a>`).join(' ')}</nav><router-outlet />\`,
})
export class App {}
`,
  );
  writeFileSync(
    path.join(src, 'app.config.ts'),
    `import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideGogConfig } from '${PACKAGE}';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideGogConfig({ labels: ${JSON.stringify(LABELS)} }),
  ],
};
`,
  );
  for (const leftover of ['app.html', 'app.css', 'app.spec.ts'])
    rmSync(path.join(src, leftover), { force: true });
  return pages;
}

/** `name → estimated transfer bytes` for the browser build's lazy chunks. */
function lazyChunkSizes(buildOutput) {
  const sizes = new Map();
  const lazy = buildOutput.split('Lazy chunk files')[1] ?? '';
  for (const line of lazy.split(/\r?\n/)) {
    const match = line.match(/^\S+\.js\s+\|\s+(\S+)\s+\|[^|]*\|\s+([\d.]+)\s+(bytes|kB|MB)/);
    if (!match) continue;
    const factor = { bytes: 1, kB: 1000, MB: 1_000_000 }[match[3]];
    sizes.set(match[1], Math.round(parseFloat(match[2]) * factor));
  }
  return sizes;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`the app's SSR server did not answer at ${url}`);
}

async function checkInBrowser(appDir, pages) {
  const port = 4700 + Math.floor(Math.random() * 200);
  const base = `http://localhost:${port}`;
  const server = spawn(process.execPath, [path.join(appDir, `dist/${APP}/server/server.mjs`)], {
    cwd: appDir,
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    await waitForServer(`${base}/`);
    for (const page of pages) {
      const route = page.specifier === PACKAGE ? '/' : `/${page.slug}`;
      const context = await browser.newContext();
      const tab = await context.newPage();
      const errors = [];
      tab.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      tab.on('pageerror', (error) => errors.push(error.message));

      await tab.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      const hydrated = await tab.evaluate(() => document.querySelector('[ng-version]') !== null);
      if (!hydrated) problems.push(`[browser] ${route} did not bootstrap (no [ng-version])`);
      if (page.smoke.interact) {
        try {
          await page.smoke.interact(tab);
        } catch (error) {
          problems.push(`[browser] ${route} interaction failed: ${error.message.split('\n')[0]}`);
        }
      }

      if (page.specifier !== PACKAGE) {
        await tab.goto(`${base}/`, { waitUntil: 'networkidle' });
        const scripts = [];
        tab.on('request', (request) => {
          if (request.url().endsWith('.js')) scripts.push(request.url());
        });
        await tab.click(`#nav-${page.slug}`);
        await tab.waitForLoadState('networkidle');
        if (scripts.length === 0) {
          problems.push(
            `[not-lazy] navigating to ${route} fetched no script — its code is already in the initial bundle`,
          );
        }
      }

      if (errors.length > 0) {
        problems.push(
          `[browser] ${route} logged ${errors.length} error(s):\n` +
            errors.map((e) => `      ${e.slice(0, 200)}`).join('\n'),
        );
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

async function main() {
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'gog-install-check-'));
  console.log(`Scratch directory: ${scratch}`);
  let keep = flag('--keep');

  try {
    if (!flag('--no-build')) {
      step('Building the library');
      run('npm', ['run', 'build:lib'], { timeoutMs: 300_000 });
    }

    step('Packing dist/gleks/ui');
    const localDir = path.join(scratch, 'local');
    mkdirSync(localDir, { recursive: true });
    const packed = run('npm', ['pack', '--pack-destination', localDir], { cwd: distDir });
    const tarball = path.join(localDir, packed.stdout.trim().split(/\r?\n/).pop());
    const newEntries = readTarball(tarball);
    notes.push(`tarball: ${path.basename(tarball)}, ${newEntries.size} file(s)`);

    compareWithBaseline(scratch, newEntries);

    const specifiers = [...entryPoints(newEntries).keys()].filter((s) => !INTERNAL.has(s));
    const missing = specifiers.filter((s) => !SMOKE[s]);
    if (missing.length > 0) {
      problems.push(
        `[no-smoke-page] ${missing.join(', ')} ${missing.length === 1 ? 'is a public entry point' : 'are public entry points'} ` +
          `with no page in scripts/check-install.mjs's SMOKE — add one, or list it in INTERNAL`,
      );
    }
    const covered = specifiers.filter((s) => SMOKE[s]);

    const cliVersion = JSON.parse(
      readFileSync(path.join(rootDir, 'node_modules/@angular/cli/package.json'), 'utf8'),
    ).version;
    step(
      `Generating a clean SSR app with @angular/cli@${cliVersion} (installs dependencies — the slow part)`,
    );
    run(
      'npx',
      [
        '-y',
        `@angular/cli@${cliVersion}`,
        'new',
        APP,
        '--ssr',
        '--defaults',
        '--skip-git',
        '--style=css',
        '--skip-tests',
        '--zoneless',
      ],
      {
        cwd: scratch,
        timeoutMs: 600_000,
      },
    );
    const appDir = path.join(scratch, APP);

    step('Installing the tarball and running its ng-add schematic');
    run('npm', ['install', tarball], { cwd: appDir, timeoutMs: 300_000 });
    run('npx', ['ng', 'generate', `${PACKAGE}:ng-add`], { cwd: appDir, timeoutMs: 120_000 });
    const workspace = JSON.parse(readFileSync(path.join(appDir, 'angular.json'), 'utf8'));
    const styles = workspace.projects[APP].architect.build.options.styles ?? [];
    if (!styles.includes(`node_modules/${PACKAGE}/styles/index.css`)) {
      problems.push(
        `[ng-add] the schematic did not add the baseline stylesheet to angular.json (styles: ${JSON.stringify(styles)})`,
      );
    }

    const pages = writeApp(appDir, covered);

    step('Building and prerendering the app');
    const build = run('npx', ['ng', 'build'], { cwd: appDir, timeoutMs: 600_000, allowFail: true });
    writeFileSync(path.join(scratch, 'build.log'), build.output);
    if (build.status !== 0) {
      problems.push(
        `[build] ng build exited ${build.status}:\n${build.output
          .split('\n')
          .filter((l) => /ERROR|error TS/.test(l))
          .slice(0, 10)
          .join('\n')}`,
      );
      throw new Error('build failed');
    }
    for (const line of build.output.split(/\r?\n/)) {
      if (/\[WARNING\]/.test(line) && line.includes(PACKAGE))
        problems.push(`[build-warning] ${line.trim()}`);
    }
    const initial = build.output.match(/Initial total\s+\|\s+\S+ \S+\s+\|\s+([\d.]+ \S+)/);
    if (initial) notes.push(`initial bundle, estimated transfer: ${initial[1]}`);

    const lazy = lazyChunkSizes(build.output);
    for (const page of pages) {
      if (page.specifier === PACKAGE) continue;
      const bytes = lazy.get(`ep-${page.slug}`);
      notes.push(`lazy chunk for ${page.specifier}: ${bytes ?? '?'} bytes`);
      if (bytes === undefined) {
        problems.push(`[not-lazy] no lazy chunk named ep-${page.slug} in the build output`);
      } else if (page.smoke.minLazyBytes && bytes < page.smoke.minLazyBytes) {
        problems.push(
          `[not-lazy] ${page.specifier}'s lazy chunk is ${bytes} bytes, under ${page.smoke.minLazyBytes} — ` +
            `its code landed in the initial bundle (a root that re-exports it drags it there)`,
        );
      }
    }

    step('Checking the prerendered HTML');
    for (const page of pages) {
      const htmlFile = path.join(
        appDir,
        `dist/${APP}/browser`,
        page.specifier === PACKAGE ? '' : page.slug,
        'index.html',
      );
      if (!existsSync(htmlFile)) {
        problems.push(`[prerender] no prerendered page for ${page.specifier} (${htmlFile})`);
        continue;
      }
      const html = readFileSync(htmlFile, 'utf8');
      for (const expected of page.smoke.expectHtml) {
        if (!html.includes(expected)) {
          problems.push(
            `[config] ${page.specifier}'s prerendered page lacks "${expected}" — the root's GOG_CONFIG did not reach it`,
          );
        }
      }
    }

    step('Loading every page in Chrome');
    await checkInBrowser(appDir, pages);
  } catch (error) {
    if (problems.length === 0) problems.push(`[run] ${error.message}`);
  } finally {
    console.log('');
    for (const note of notes) console.log(`  · ${note}`);
    if (problems.length > 0) keep = true;
    if (!keep) rmSync(scratch, { recursive: true, force: true });
  }

  if (problems.length > 0) {
    console.error('\nConsumer install check FAILED\n');
    for (const problem of problems) console.error(`  ${problem}\n`);
    console.error(`Scratch directory kept: ${scratch}`);
    process.exit(1);
  }
  console.log(
    `\nConsumer install check passed — the packed tarball installs, builds, prerenders and hydrates in a clean app.${keep ? `\nScratch directory kept: ${scratch}` : ''}`,
  );
}

main();
