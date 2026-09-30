import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Hosts this server will render for — **every domain the image is deployed under**.
 *
 * **A host missing from this list gets `400 Bad Request`, not a page.** `AngularNodeAppEngine`
 * validates the request's `Host` header against an allow-list to prevent SSRF. Measured on
 * 2026-09-30 against the built server: an unlisted host is answered with a 400 and logs
 * `Header "host" with value "…" is not allowed`. (Earlier Angular releases fell back to the empty
 * `index.csr.html` shell instead, which is what this comment used to warn about.)
 *
 * One image goes to both servers — the deploy workflow builds it for test and promotes the same
 * image to production — so both public domains are here: `ui.chebureck.org` (test, glx-01) and
 * `ui.guildofgleks.com` (production, glx-02). They must match `vars.LAB_DOMAIN` in the `test` and
 * `production` environments, which is the `Host` the deploy smoke test sends.
 *
 * `angular.json`'s `security.allowedHosts` for this project is merged into the list too (also
 * measured), but it is left empty on purpose so there is one list to read. `localhost` and
 * `127.0.0.1` are for the Dockerfile's `HEALTHCHECK`, which requests `127.0.0.1`, and for
 * `npm run serve:ssr:gleks-ui-lab`. `NG_ALLOWED_HOSTS` (comma-separated) replaces the whole list at
 * run time — so a value set there must repeat `localhost,127.0.0.1`, or the health check fails.
 */
const ALLOWED_HOSTS = [
  'ui.guildofgleks.com',
  'www.ui.guildofgleks.com',
  'ui.chebureck.org',
  'localhost',
  '127.0.0.1',
];

const allowedHosts =
  process.env['NG_ALLOWED_HOSTS']?.split(',').map((host) => host.trim()) ?? ALLOWED_HOSTS;

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts,
  /**
   * **The allow-list is checked against the `Host` header the container actually receives, not
   * the one in the address bar.** Behind nginx that is whatever `proxy_set_header Host` was set
   * to — nginx's own default is the upstream (`localhost:9001`, a container name, an IP), none of
   * which is the public domain. When it does not match, the request is rejected with a 400.
   *
   * With this on, the engine reads `X-Forwarded-Host` / `X-Forwarded-Proto` — which Cloudflare
   * and nginx do set to the public values — and the allow-list above matches again. Safe here
   * because the container is only reached through that proxy, and a forged header still has to
   * name a host the list already permits.
   */
  trustProxyHeaders: true,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * `/` answers with a permanent redirect to the home page's own URL.
 *
 * The router's `{ path: '', redirectTo: 'general/overview' }` is what a browser follows, but
 * Angular's SSR renders a router redirect as a **302** — "temporary, keep asking for the
 * original URL" — so the links people write (and `/` is the URL people write) never consolidate
 * onto the page that holds the content. A `301` transfers them. Handled here, ahead of
 * `angularApp.handle`, because the status is a property of the HTTP response, not of anything
 * the router can express.
 *
 * `HOME_PATH` in `components/shared/seo-data.ts` and `scripts/generate-sitemap.mjs` name the
 * same page; if it ever moves, all three change together.
 */
app.get('/', (_req, res) => {
  res.redirect(301, '/general/overview');
});

/**
 * Angular's content-hashed build output — `main-TBE7GO4X.js`, `styles-XKQ3M7RA.css`. The hash is
 * derived from the contents, so a changed file gets a new URL and the old one can never be
 * wrong: exactly the case a one-year `immutable` cache is designed for.
 */
const HASHED_ASSET = /-[A-Z0-9]{8}\.(?:js|css)$/;

/**
 * Serve static files from /browser.
 *
 * **Cache lifetime is decided per file, not globally.** This used to be a flat `maxAge: '1y'`,
 * which is right for the 54 hashed bundles and wrong for everything else in the directory —
 * because everything else keeps a *stable* URL while its contents change:
 *
 * - `docs/CHANGELOG.md`, fetched by the releases page, replaced on every library release;
 * - `docs/*.md` — `compare-full`, `global-config`, `theming` — the markdown behind those pages,
 *   replaced whenever the text is edited;
 * - `docs/styles/*.css`, copied out of the installed package and read by the theming page;
 * - `sitemap.xml`, `robots.txt`, the IndexNow key file.
 *
 * A year of `max-age` on those means a returning reader is served the *old* copy without the
 * browser asking us anything — which is how a freshly deployed 21.4.4 release section stayed
 * invisible to anyone who had opened the page before. `no-cache` does not mean "do not store";
 * it means "revalidate before reuse", and `express.static` already sends `ETag` and
 * `Last-Modified`, so the common case is a 304 with no body rather than a refetch.
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      res.setHeader(
        'Cache-Control',
        HASHED_ASSET.test(filePath) ? 'public, max-age=31536000, immutable' : 'no-cache',
      );
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 *
 * A rejected host is answered with a 400 (see `ALLOWED_HOSTS`). The header is logged once per
 * distinct host so the cause is one line in `docker logs`: whatever it prints is the host to add.
 */
const loggedHosts = new Set<string>();

app.use((req, res, next) => {
  const host = (req.headers['x-forwarded-host'] ?? req.headers.host ?? '') as string;
  if (host && !loggedHosts.has(host)) {
    loggedHosts.add(host);
    const hostname = host.split(':')[0];
    if (!allowedHosts.includes(hostname) && !allowedHosts.includes('*')) {
      console.warn(
        `[ssr] Host "${host}" is not in allowedHosts (${allowedHosts.join(', ')}) — ` +
          'requests from it are rejected with 400 Bad Request. ' +
          'Add it to ALLOWED_HOSTS in server.ts, or to NG_ALLOWED_HOSTS.',
      );
    }
  }

  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  const server = app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });

  /**
   * Shut down when the container is asked to stop.
   *
   * `docker stop` sends `SIGTERM` and then waits out a grace period — 10 seconds by default —
   * before `SIGKILL`. **Node does not exit on `SIGTERM` unless something asks it to**, so
   * without this the process sat there for the whole grace period on every deploy, and every
   * second of it was nginx answering `502` with no upstream. That is the most plausible source
   * of the 5xx Search Console recorded for `/components/inputfield`.
   *
   * `server.close()` stops accepting connections and lets in-flight requests finish, so a
   * reader mid-navigation is not cut off. The timer is the backstop: an idle keep-alive
   * connection can hold `close()` open indefinitely, and a shutdown that outlives the grace
   * period is just the original problem with extra steps. `unref()` so the timer itself never
   * keeps the process alive.
   */
  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`[ssr] ${signal} received — closing server.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
