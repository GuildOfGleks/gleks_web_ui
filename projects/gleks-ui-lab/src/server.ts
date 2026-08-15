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

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts:
    process.env['NG_ALLOWED_HOSTS']?.split(',').map((host) => host.trim()) ?? ALLOWED_HOSTS,
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
 */
app.use((req, res, next) => {
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
