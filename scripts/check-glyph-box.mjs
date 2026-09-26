#!/usr/bin/env node
/**
 * Enforces `styling.instructions.md`'s rule that **a box that holds a glyph is never smaller than
 * the glyph** — measured in a real browser, because it cannot honestly be measured anywhere else.
 *
 * ## Why this one is not a text scan
 *
 * Every other check in this repo reads source: `check-tokens` parses `theme.css`, `check-contrast`
 * resolves `var()` chains, `check-geometry` reads the compiled stylesheets. This rule resists that
 * for one reason, and the reason already cost a wrong fix once (21.13.0, `gog-select`'s chevron):
 *
 *   A glyph is `--gog-icon-size` (1.2em) of its element's resolved font-size, and **an `em`
 *   attaches to the element carrying the property, not to the one you were thinking about.**
 *   Resolving that statically means following a `var()` chain through the per-size blocks *and*
 *   knowing which element in the cascade each relative unit lands on. The first attempt at the
 *   chevron got the second part wrong and produced a fix that measured 25% worse at `slg`.
 *
 * `docs/backlog.md` put it plainly: build it against a real rendering, or not at all. So this
 * loads the prerendered `ui-showcase` and asks the browser, which is the only party that knows.
 *
 * ## What it does
 *
 * Serves `dist/ui-showcase/browser` statically, visits every prerendered route, and for each
 * `<gog-icon>` on the page compares the `<svg>` it draws against the box that holds it — the
 * icon's own parent element. A box narrower or shorter than its glyph is a finding.
 *
 * The rule is **one-directional and has no exemption list**, which is unusual here and is the
 * argument for having it: ten elements in the library put an icon in a box, three were under it
 * (all fixed in 21.13.0) and seven are deliberately roomier. Roomier is fine; smaller never is.
 *
 * ## What it cannot see
 *
 * Only what `ui-showcase` renders. An icon in a state no page reaches — a variant nobody
 * demonstrates, a slot nobody fills — is not measured. That is a real limit and the reason the
 * showcase's coverage matters beyond documentation.
 *
 * Run via `npm run check:glyph-box`. Needs `npm run build:showcase` first; it says so rather than
 * building one for you, because a 15-second build inside a check is how checks stop being run.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browserDir = path.join(rootDir, 'dist/ui-showcase/browser');

/**
 * Sub-pixel slack. A box and its glyph are sized from the same chain but land on different
 * fractional boundaries, and `getBoundingClientRect` reports what the compositor rounded to — the
 * three real defects were 5% and 9% out, which is nowhere near this.
 */
const EPSILON = 0.5;

const MIME = new Map([
  ['.html', 'text/html'],
  ['.js', 'text/javascript'],
  ['.mjs', 'text/javascript'],
  ['.css', 'text/css'],
  ['.json', 'application/json'],
  ['.svg', 'image/svg+xml'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
]);

/**
 * The measurement, run in the page. Kept as one expression so it is obvious what crosses over.
 *
 * **The border box is the box**, and the first version of this check compared against the content
 * box instead. That reported `gog-checkbox`: its square is 12px including a 2px border, so the
 * content area is 8px while the tick is 12px — a tick that spans its own outline, which is what a
 * checkbox looks like and has looked like since checkboxes existed. Padding and border are both
 * room the glyph may use.
 *
 * What the rule is actually about is a glyph drawing *outside* the thing that holds it, where a
 * focus ring lands inside the mark and a hover fill stops short of it.
 */
const PROBE = `(() => {
  const findings = [];
  for (const icon of document.querySelectorAll('gog-icon')) {
    const svg = icon.querySelector('svg');
    const box = icon.parentElement;
    if (!svg || !box) continue;

    const glyph = svg.getBoundingClientRect();
    const inner = box.getBoundingClientRect();
    if (glyph.width === 0 || inner.width === 0) continue;

    // The BORDER box is the box. See the note above this constant for why -- backticks cannot
    // live in here, since this whole probe is a template literal.
    if (glyph.width - inner.width > ${EPSILON} || glyph.height - inner.height > ${EPSILON}) {
      findings.push({
        icon: icon.getAttribute('name') || '(template)',
        box: box.className || box.tagName.toLowerCase(),
        glyph: [+glyph.width.toFixed(2), +glyph.height.toFixed(2)],
        inner: [+inner.width.toFixed(2), +inner.height.toFixed(2)],
      });
    }
  }
  return findings;
})()`;

async function serve(dir) {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.join(dir, url);
    if (!path.extname(url)) {
      // A prerendered route is `<route>/index.html`. A route that only ever redirects —
      // `/legacy` is one — has no prerender, and its folder exists only if a child's does. It
      // falls back to the client-side shell at the root, which boots the app and lands wherever
      // the router sends it, as any static host serving an SPA would. Both are measurable.
      const prerendered = path.join(file, 'index.html');
      file = existsSync(prerendered) ? prerendered : path.join(dir, 'index.csr.html');
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME.get(path.extname(file)) ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, port: server.address().port };
}

async function main() {
  if (!existsSync(browserDir)) {
    console.error(
      `No prerendered showcase at dist/ui-showcase/browser.\n` +
        `Run \`npm run build:showcase\` first — this check measures what the app actually renders.`,
    );
    process.exit(1);
  }

  const routes = JSON.parse(
    await readFile(path.join(rootDir, 'dist/ui-showcase/prerendered-routes.json'), 'utf8'),
  );
  const paths = Object.keys(routes.routes ?? routes);

  const { server, port } = await serve(browserDir);
  const browser = await chromium.launch({ channel: 'chrome' });

  const problems = [];
  let measured = 0;

  for (const route of paths) {
    /*
     * A fresh context per route, and this is not caution — the first version reused one page
     * across all 46 and its findings depended on the order it walked them. `ui-showcase` persists
     * the reader's theme and density in `localStorage`, so a route visited after the themes page
     * rendered under whatever that page had left set: an 8px checkbox box reported on `/checkbox`
     * that a fresh load of the same page does not have.
     *
     * Order-dependent findings are the failure this check exists to avoid one level down. A
     * context costs about a second across the whole run.
     */
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'networkidle' });
    // The icons are inline SVG in the prerendered HTML, so they are measurable as soon as the
    // stylesheet has applied; hydration only re-attaches behaviour.
    const findings = await page.evaluate(PROBE);
    measured += await page.evaluate('document.querySelectorAll("gog-icon").length');

    for (const finding of findings) {
      problems.push(
        `[glyph-overflows-box] ${route}\n` +
          `      icon \`${finding.icon}\` draws ${finding.glyph[0]}x${finding.glyph[1]} inside a ` +
          `${finding.inner[0]}x${finding.inner[1]} box (\`${finding.box}\`)\n` +
          `      a box that holds a glyph is never smaller than the glyph — state the mark's ` +
          `font-size and its box on the same element, both reading --gog-icon-size`,
      );
    }

    await context.close();
  }

  await browser.close();
  server.close();

  if (problems.length > 0) {
    console.error('Glyph-box check FAILED\n');
    // One finding per box, not per instance: the same component on ten pages is one defect.
    const unique = [...new Set(problems)];
    for (const problem of unique) console.error(`  ${problem}\n`);
    console.error(
      `${unique.length} distinct problem(s) across ${paths.length} route(s). ` +
        `See styling.instructions.md — "a box that holds a glyph is never smaller than the glyph".`,
    );
    process.exit(1);
  }

  console.log(
    `Glyph-box check passed — ${measured} icon(s) measured across ${paths.length} prerendered ` +
      `route(s), every one inside a box at least its own size.`,
  );
}

main();
