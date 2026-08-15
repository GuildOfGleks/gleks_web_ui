# `gleks-ui-lab` — search-engine setup

What is in place so `https://ui.guildofgleks.com` can be crawled, indexed and shown correctly,
what each piece is for, and what is left that only the site owner can do. Written 2026-08-15.

## The one that mattered most: the site was serving an empty shell

`AngularNodeAppEngine` validates the request's `Host` header against an allow-list before it
server-renders, as SSRF protection. **That list was empty**, and an empty list allows nothing —
so every request failed validation and the engine fell back to returning `index.csr.html`, the
bare client-side shell. A crawler asking for `/components/table` received a page with no
content, no per-page title and no description; whether it ever saw the real page depended on it
choosing to execute the JavaScript.

The trap is that `angular.json` *does* have a `security.allowedHosts` entry (set to `[]`) — but
that one configures the **dev-server**, not the SSR runtime. The runtime reads the engine options
or the `NG_ALLOWED_HOSTS` environment variable, neither of which was set.

Fixed in `projects/gleks-ui-lab/src/server.ts`: the production domain, its `www` form, and
`localhost`/`127.0.0.1` (the container sits behind a reverse proxy that may forward its own
`Host`, and the local check needs it) — with `NG_ALLOWED_HOSTS` still able to override the whole
list at deploy time.

**Verify after every deploy**, because a silent CSR fallback looks fine in a browser:

```sh
curl -s https://ui.guildofgleks.com/components/table | grep -o '<title>[^<]*</title>'
# expected: <title>Angular Table Component — Guild of Gleks UI</title>
# a fallback to the generic site title means host validation is rejecting the request again
```

The same check locally, against the built server:

```sh
npm run build:lab && npm run serve:ssr:gleks-ui-lab
curl -s -H "Host: ui.guildofgleks.com" http://localhost:4000/components/table | grep -o '<title>[^<]*</title>'
```

## What each piece does

| Piece | Where | What it does |
| --- | --- | --- |
| Per-page title + description | `components/shared/seo-data.ts` | One entry per routed page — 38 of them. The table is the only place a page's search-result text lives. |
| Applying them | `components/shared/seo.ts` (`SeoService`) | Sets title, description, canonical, Open Graph and Twitter tags on every `NavigationEnd` — **including the one that happens during server rendering**, which is what puts them in the HTML a crawler receives. Started from `App`'s constructor. |
| `noindex` for catch-alls | same service | `app.routes.ts` ends in `components/:name` and `general/:slug`, which render for *any* slug. Anything not in `PAGE_SEO` is marked `noindex, follow`, so a mistyped or guessed URL cannot enter the index as a thin duplicate. |
| Canonical URLs | same service | Always `https://ui.guildofgleks.com/<path>`, never carrying a query or `#fragment`; `/` and `/general/overview` both canonicalise to the latter, since `/` redirects there. |
| Site-level defaults + structured data | `src/index.html` | Fallback title/description matching `FALLBACK_SEO`, plus JSON-LD (`WebSite` + `SoftwareApplication`) describing the package: category, licence, repository, npm URL, free. |
| `FAQPage` structured data | `pages/faq-page/faq-page.ts` | Generated from `faq-data.ts` — the same source the page renders — and written into `<head>` on that page only, during server rendering included. It is what lets a result show the questions themselves. Answers stay in the DOM when a question is collapsed (`gogCollapsibleContent` hides with CSS and `inert`, it does not remove), so the markup a crawler receives carries all 25 answers in full; keep it that way if the FAQ is ever restructured again. |
| `robots.txt` | `public/robots.txt` | Allows everything, points at the sitemap. Deliberately does **not** `Disallow` the catch-all routes — a blocked URL is never crawled, so the crawler would never see the `noindex` on it. |
| `sitemap.xml` | generated | `scripts/generate-sitemap.mjs` derives it from `nav-data.ts`, so adding a page to the sidebar adds it to the sitemap. `scripts/build-lab.mjs` regenerates it before every build, including the Dockerfile's — a deployed sitemap cannot be stale. `npm run generate:sitemap` / `npm run check:sitemap` run it by hand. |
| Home-page `H1` | `overview-page.html` | Says what the library *is* (`Angular UI Component Library`), not what the page is called. The sidebar entry is still "Overview". |

## What is deliberately not done

- **No `lastmod` in the sitemap.** An honest value needs per-page git history; a generated
  "today" on all 38 URLs at once is a lie crawlers learn to discount.
- **No prerendering of the component pages.** They are server-rendered per request, which is
  equivalent for a crawler. Prerendering would need `getPrerenderParams` plus a build-time fetch
  for the markdown-backed pages — worth doing for TTFB, not for indexing.
- **No `summary_large_image` social card.** `gleks_ui_logo.png` is 337×386, so the cards are
  `summary`. Dropping a 1200×630 `og-image.png` into `public/` and pointing `SOCIAL_IMAGE`
  (`seo-data.ts`) at it is the whole change if that becomes worth doing.

## What only you can do

Technical setup makes a site *indexable*. It does not make it rank — for a head term like
"angular ui library" the results are Material, PrimeNG, NG-ZORRO and Nebular, all of which have
years of links pointing at them. What actually moves that needle, in rough order of effect:

1. **Google Search Console** — verify the domain (a DNS TXT record), submit
   `https://ui.guildofgleks.com/sitemap.xml`, then use *URL inspection → Request indexing* on
   the home page once. This is also where you find out whether Google is seeing the rendered
   page or the shell: *Inspect URL → View crawled page*.
2. **Bing Webmaster Tools** — same, and it can import the Search Console setup.
3. **Links from where Angular developers already are.** A package README linking to the docs
   site (it does), the npm page (it does), plus: a `Show HN`/Reddit `r/angular` post, a
   dev.to/Medium write-up, an entry in `awesome-angular`-style lists, and answers on Stack
   Overflow where the library genuinely fits. Three or four real links outrank any amount of
   meta-tag tuning.
4. **Pages that answer a search, not just document an API.** The comparison page is the best
   asset on this site for that reason — "angular ui library alternatives to material" is a query
   this site can realistically win, while "angular ui library" is a years-long project.
5. **Patience.** A new domain takes weeks to be crawled thoroughly and months to rank for
   anything competitive, regardless of what the HTML says.
