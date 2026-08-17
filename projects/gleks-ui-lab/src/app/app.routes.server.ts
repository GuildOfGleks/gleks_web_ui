import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Matched against the request path in order, so the two catch-all patterns that render real
 * pages have to come before the `**` that reports a 404.
 *
 * `general/:slug` and `components/:name` are server-rendered rather than prerendered because
 * they render for *any* slug — they are the routes that produce a real page around an unknown
 * name, and `SeoService` marks those `noindex, follow`. That is deliberate and is **not** the
 * soft-404 case below.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // Kept prerendered: it was covered by the `**` entry until that became the 404 route.
    // `/` never actually reaches Angular in production — `server.ts` answers it with a 301 —
    // but the prerendered shell stays correct for any other way the app is served.
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'general/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'components/:name',
    renderMode: RenderMode.Server,
  },
  {
    // The site's 404, and the reason it is a *real* one: `status` is only available on a
    // server-rendered route (`RenderMode.Prerender` omits it from its options type), so a
    // prerendered not-found page would still answer `200` and read as a soft 404 to a crawler.
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
  },
];
