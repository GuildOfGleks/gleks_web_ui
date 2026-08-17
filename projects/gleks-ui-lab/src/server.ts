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
 * Hosts this server will server-render for.
 *
 * **Without this the site is client-rendered in production, silently.** `AngularNodeAppEngine`
 * validates the request's `Host` header against an allow-list to prevent SSRF, and that list is
 * empty by default — it comes from the engine options or `NG_ALLOWED_HOSTS`, *not* from
 * `angular.json`'s `security.allowedHosts` (that one configures the dev-server). With nothing
 * allowed, every request fails validation and `handle()` falls back to serving the empty
 * `index.csr.html` shell, so a crawler gets a page with no content, no per-page `<title>` and no
 * description — see `components/shared/seo.ts`. Reproduced by running the built server and
 * curling it: with the list set the response carries the real page; without it, the shell.
 *
 * `localhost`/`127.0.0.1` are here because the container is reached through a reverse proxy that
 * may forward its own `Host`, and because `npm run serve:ssr:gleks-ui-lab` is how this gets
 * checked locally. `NG_ALLOWED_HOSTS` (comma-separated) still overrides the whole list at
 * deploy time, which is the escape hatch if the domain ever changes before this file does.
 */
const ALLOWED_HOSTS = ['ui.guildofgleks.com', 'www.ui.guildofgleks.com', 'localhost', '127.0.0.1'];

const allowedHosts =
  process.env['NG_ALLOWED_HOSTS']?.split(',').map((host) => host.trim()) ?? ALLOWED_HOSTS;

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts,
  /**
   * **The allow-list is checked against the `Host` header the container actually receives, not
   * the one in the address bar.** Behind nginx that is whatever `proxy_set_header Host` was set
   * to — nginx's own default is the upstream (`localhost:9001`, a container name, an IP), none of
   * which is the public domain. When it does not match, `handle()` quietly serves the empty
   * `index.csr.html` shell instead of the rendered page, which is invisible in a browser and
   * fatal for crawlers.
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
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 *
 * A rejected host makes `handle()` fall back to the client-side shell rather than fail, so the
 * only sign of a misconfigured deployment is a page that looks fine to a human and empty to a
 * crawler. The header is logged once per distinct host to make that visible in `docker logs`:
 * whatever it prints is what `NG_ALLOWED_HOSTS` has to contain.
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
          'requests from it are served the client-side shell, not server-rendered HTML. ' +
          'Add it to NG_ALLOWED_HOSTS.',
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
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
