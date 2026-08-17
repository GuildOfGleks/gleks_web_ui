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

The trap is that `angular.json` _does_ have a `security.allowedHosts` entry (set to `[]`) — but
that one configures the **dev-server**, not the SSR runtime. The runtime reads the engine options
or the `NG_ALLOWED_HOSTS` environment variable, neither of which was set.

Fixed in `projects/gleks-ui-lab/src/server.ts`: the production domain, its `www` form, and
`localhost`/`127.0.0.1` (the container sits behind a reverse proxy that may forward its own
`Host`, and the local check needs it) — with `NG_ALLOWED_HOSTS` still able to override the whole
list at deploy time.

**Two ways it goes wrong, and they look different:**

| Symptom                                                              | Cause                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 200 with an empty `<app-root></app-root>` and the generic site title | the allow-list is **empty** — an image built before this fix, so every request falls back to the shell |
| 400 Bad Request                                                      | the list is set but the arriving `Host` is not in it                                                   |

The second is the one a reverse proxy causes: nginx sends its _upstream_ host (`localhost:9001`, a
container name, an IP), not the domain in the address bar. `trustProxyHeaders: true` makes the
engine read `X-Forwarded-Host` instead, which Cloudflare and nginx do set — and any host that is
still rejected is now logged once, so `docker logs gleks-ui-lab` names exactly what
`NG_ALLOWED_HOSTS` needs.

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

## The rest of the post-deploy check

Status codes, which the title check above cannot see. Note `-o /dev/null` **without** `-L`:
following a redirect hides the very status being checked.

```sh
B=https://ui.guildofgleks.com
curl -s -o /dev/null -w "%{http_code}\n" $B/                              # 301 → /general/overview
curl -s -o /dev/null -w "%{http_code}\n" $B/nope-12345                    # 404, the not-found page
curl -s -o /dev/null -w "%{http_code}\n" $B/components/does-not-exist-xyz # 200 — must NOT be 404
curl -s -o /dev/null -w "%{http_code}\n" $B/sitemap.xml                   # 200 — a 403 means Cloudflare
curl -s $B/robots.txt                                                     # our file only, no managed block
```

The third line is the one to watch. `components/:name` and `general/:slug` render real chrome
around an unknown slug and are `200` + `noindex, follow` **on purpose** — if a change to the
404 route ever turns those into 404s, every mistyped component URL stops rendering the site's
navigation, and that is a regression the other four checks would not catch.

Last run green on **2026-08-17**, against the deploy carrying the `301`, the real `404` and the
Bing tag: all five as expected, plus `<title>Page not found — Guild of Gleks UI</title>` with
`noindex, follow` on the 404 and the per-page title on `/components/table`.

## What each piece does

| Piece                                 | Where                                     | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-page title + description          | `components/shared/seo-data.ts`           | One entry per routed page — 38 of them. The table is the only place a page's search-result text lives.                                                                                                                                                                                                                                                                                                                                                           |
| Applying them                         | `components/shared/seo.ts` (`SeoService`) | Sets title, description, canonical, Open Graph and Twitter tags on every `NavigationEnd` — **including the one that happens during server rendering**, which is what puts them in the HTML a crawler receives. Started from `App`'s constructor.                                                                                                                                                                                                                 |
| `noindex` for catch-alls              | same service                              | `app.routes.ts` ends in `components/:name` and `general/:slug`, which render for _any_ slug and answer **200** — that is correct, they render real chrome around an unknown name. Anything not in `PAGE_SEO` is marked `noindex, follow`, so a mistyped or guessed URL cannot enter the index as a thin duplicate.                                                                                                                                               |
| Canonical URLs                        | same service                              | Always `https://ui.guildofgleks.com/<path>`, never carrying a query or `#fragment`; `/` and `/general/overview` both canonicalise to the latter, since `/` redirects there.                                                                                                                                                                                                                                                                                      |
| `301` on `/`                          | `src/server.ts`                           | Express answers `/` with a **permanent** redirect to `general/overview`, ahead of `angularApp.handle`. The router's own `redirectTo` renders as a `302` under SSR, which tells a crawler to keep the original URL and never consolidates the links people write onto the page that holds the content. The status is an HTTP property, so it cannot be expressed in the router.                                                                                   |
| Real `404`                            | `pages/not-found-page/` + server routes   | `app.routes.ts`'s `**` renders `NotFoundPage`, and `app.routes.server.ts` gives the matching `**` server route `status: 404`. It used to `redirectTo: 'general/overview'`, so every typo and stale link answered `200` on an indexable page — a soft 404. `status` is only available on `RenderMode.Server`, which is why that route is not prerendered; the `''` route is listed separately so it still is.                                                     |
| Site-level defaults + structured data | `src/index.html`                          | Fallback title/description matching `FALLBACK_SEO`, plus JSON-LD (`WebSite` + `SoftwareApplication`) describing the package: category, licence, repository, npm URL, free.                                                                                                                                                                                                                                                                                       |
| `FAQPage` structured data             | `pages/faq-page/faq-page.ts`              | Generated from `faq-data.ts` — the same source the page renders — and written into `<head>` on that page only, during server rendering included. It is what lets a result show the questions themselves. Answers stay in the DOM when a question is collapsed (`gogCollapsibleContent` hides with CSS and `inert`, it does not remove), so the markup a crawler receives carries all 25 answers in full; keep it that way if the FAQ is ever restructured again. |
| `robots.txt`                          | `public/robots.txt`                       | Allows everything, points at the sitemap. Deliberately does **not** `Disallow` the catch-all routes — a blocked URL is never crawled, so the crawler would never see the `noindex` on it.                                                                                                                                                                                                                                                                        |
| `sitemap.xml`                         | generated                                 | `scripts/generate-sitemap.mjs` derives it from `nav-data.ts`, so adding a page to the sidebar adds it to the sitemap. `scripts/build-lab.mjs` regenerates it before every build, including the Dockerfile's — a deployed sitemap cannot be stale. `npm run generate:sitemap` / `npm run check:sitemap` run it by hand.                                                                                                                                           |
| IndexNow ping                         | `scripts/ping-indexnow.mjs`               | Announces the sitemap's URLs to Bing (and Yandex/Seznam) after every successful deploy, instead of waiting to be crawled. Ownership is proved by `public/<key>.txt`, which is public by construction — see the section below.                                                                                                                                                                                                                                    |
| Home-page `H1`                        | `overview-page.html`                      | Says what the library _is_ (`Angular UI Component Library`), not what the page is called. The sidebar entry is still "Overview".                                                                                                                                                                                                                                                                                                                                 |

## Cloudflare: the managed block is off, and `robots.txt` never told the whole story

Until 2026-08-17 Cloudflare prepended its managed content block to `/robots.txt`, so the served
file was Cloudflare's rules first and `public/robots.txt` second. **Both of the settings behind
that were turned off on 2026-08-17** — _AI Crawl Control → Manage robots.txt → off_, and
_Security → Bot Traffic → Allow_ — and `/robots.txt` now serves this repository's file alone.

An earlier version of this section concluded that the managed block was cosmetic and that
nothing was actually blocked. **That was wrong in two ways, and both are worth remembering:**

- **The site was answering `403` to automated requests.** `/` and `/sitemap.xml` both refused
  while `/robots.txt` was served normally — Bot Fight Mode / AI-crawler blocking at the edge,
  which is a separate control from the managed `robots.txt` and is **invisible from the robots
  file**. Reading `robots.txt` will never reveal it. Check the **status code**, not just the
  file.
- **`Google-Extended: Disallow: /` did have a real effect.** It is correctly not Googlebot and
  does not touch Search indexing or ranking — but grounding an AI answer is exactly what it
  governs, and "Gemini says it cannot read the site" was the original complaint that started
  this investigation.

So: after **any** Cloudflare change, re-check the file _and_ the status code. The managed block
is edited on someone else's release schedule, not this repository's, and it can come back.

```sh
curl -s https://ui.guildofgleks.com/robots.txt                             # our file only
curl -s -o /dev/null -w "%{http_code}\n" https://ui.guildofgleks.com/sitemap.xml   # 200, not 403
```

Verified on 2026-08-17 after the change: `robots.txt` serves only the repo's file, `/` is fully
server-rendered, and title, description, canonical, Open Graph and `robots: index, follow` are
all present in the delivered HTML.

## IndexNow — telling Bing instead of waiting for it

A new domain with no inbound links is discovered slowly, and there is no lever for that from
the outside: Bing's URL inspector reported `general/overview` as _"known to Bing but has some
issues which are preventing indexation"_ on the day the sitemap was submitted — its generic
wording for a URL it has discovered and not yet crawled, not a fault report. Everything
checkable was healthy at the time: `200` to bingbot in 0.4s, real `<h1>` and body text in the
delivered HTML, correct title/description/canonical, `robots: index, follow`, no Cloudflare
challenge.

IndexNow inverts the direction — the site declares which URLs changed and the engine comes to
fetch them. `deploy-lab.yml` runs `scripts/ping-indexnow.mjs` **after** the health check passes,
so only a deploy that actually came up is announced.

**The key is public on purpose.** `public/7d22960d75bad291fda7e1e64064d410.txt` contains that
string and nothing else, and the engine fetches it at `https://ui.guildofgleks.com/<key>.txt` to
confirm whoever submitted controls the host. Anyone can read it there, so committing it exposes
nothing that is not already served — which is why it is not a GitHub secret. If it ever needs
rotating, change `KEY` in the script and rename the file; the two must agree or the submission
comes back `403`.

Reading the response codes: `200` accepted, `202` accepted with key validation still pending
(normal on a first submission), `403` key mismatch or key file unreachable, `422` a URL outside
the declared host, `429` submitting too often. The step is `continue-on-error`, so a failed ping
shows red without failing a deploy that has already succeeded.

`npm run ping:indexnow -- --dry-run` prints the payload and sends nothing.

**This is only for Bing's family — Google does not consume IndexNow** and still discovers pages
by crawling the sitemap and following links.

## What is deliberately not done

- **No `lastmod` in the sitemap.** An honest value needs per-page git history; a generated
  "today" on all 39 URLs at once is a lie crawlers learn to discount.
- **No prerendering of the component pages.** They are server-rendered per request, which is
  equivalent for a crawler. Prerendering would need `getPrerenderParams` plus a build-time fetch
  for the markdown-backed pages — worth doing for TTFB, not for indexing.
- **No `summary_large_image` social card.** `gleks_ui_logo.png` is 337×386, so the cards are
  `summary`. Dropping a 1200×630 `og-image.png` into `public/` and pointing `SOCIAL_IMAGE`
  (`seo-data.ts`) at it is the whole change if that becomes worth doing.

## What only you can do

Technical setup makes a site _indexable_. It does not make it rank — for a head term like
"angular ui library" the results are Material, PrimeNG, NG-ZORRO and Nebular, all of which have
years of links pointing at them. What actually moves that needle, in rough order of effect:

1. **Google Search Console** — verify the domain (a DNS TXT record), submit
   `https://ui.guildofgleks.com/sitemap.xml`, then use _URL inspection → Request indexing_ on
   the home page once. This is also where you find out whether Google is seeing the rendered
   page or the shell: _Inspect URL → View crawled page_.
2. **Bing Webmaster Tools** — same, and it can import the Search Console setup. The
   `msvalidate.01` tag is already in `src/index.html` and live, so the meta-tag method will
   pass; Bing accepts any one of file / meta tag / CNAME, which makes the DNS record redundant.
   If a verification `CNAME` is kept anyway, it must be **DNS-only (grey cloud)** on
   Cloudflare — proxied, Cloudflare answers with its own addresses and the verifier never
   reaches `verify.bing.com`.
   **Verify only against a deployed build.** The tag ships in the image, not the repo, so
   submitting before a deploy fails the check and the property has to be re-submitted.
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
