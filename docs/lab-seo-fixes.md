# `gleks-ui-lab` — open SEO fixes

Found on **2026-08-17**, while working out why Gemini said it could not read the site. Everything
here is a `gleks-ui-lab` change and belongs in its own commit, separate from library work —
`CLAUDE.md` rule 3.

`lab-seo.md` stays the description of how the site's SEO is built. This file is only the list of
what is still wrong, and it should shrink to nothing: **delete an entry once it is actually
fixed and deployed.**

All three entries are now **written and verified locally against the built SSR server, and all
three are waiting on the same deploy.** Nothing below is still an open decision — run the
checklist at the end once the deploy lands, and delete the entries that pass.

| #   | What                                      | Where                                   | Status                                        |
| --- | ----------------------------------------- | --------------------------------------- | --------------------------------------------- |
| 1   | The home page redirected with a `302`     | `src/server.ts`                         | fixed in the working tree, **needs a deploy** |
| 2   | Unknown URLs redirected instead of 404ing | `app.routes.ts`, `app.routes.server.ts` | fixed in the working tree, **needs a deploy** |
| 3   | Bing ownership tag                        | `src/index.html:19`                     | in the working tree, **needs a deploy**       |

---

## 1. `/` answered with a temporary redirect — fixed

```
curl -s -o /dev/null -w "%{http_code}\n" https://ui.guildofgleks.com/   # → 302, before the fix
```

`app.routes.ts`'s `{ path: '', redirectTo: 'general/overview' }` renders as a `302` under
Angular SSR. A `302` tells a search engine "this is temporary, keep the original URL" — so the
ranking signals from every link people write (and `/` is the URL people write) were not
consolidated onto the page that actually holds the content.

Of the two options originally recorded here — make it a `301`, or serve the overview at `/`
directly — **the first was chosen** (2026-08-17), because it is the smaller change and because
`/general/overview` is the URL already in the index, in the sitemap and in `nav-data.ts`.
Serving the content at `/` would have reversed the redirect rather than removed it, and churned
all of that at the same time.

The redirect lives in `src/server.ts`, ahead of `angularApp.handle`, because a status code is a
property of the HTTP response and not something the router can express. The router's `redirectTo`
stays: it is what an in-browser navigation to `/` follows.

`SeoService`'s canonical rule is unchanged and still correct — `/` and `/general/overview` both
canonicalise to the latter, which is exactly what a `301` to it means.

Locally verified against `dist/gleks-ui-lab/server/server.mjs`:

```
/                            → 301 → /general/overview
/general/overview            → 200
```

## 2. The site had no 404 — every unknown URL was a soft 404 — fixed

```
curl -sL -o /dev/null -w "%{http_code} %{url_effective}\n" \
  https://ui.guildofgleks.com/this-page-does-not-exist-12345
# → 200 https://ui.guildofgleks.com/general/overview   (before the fix)
```

`app.routes.ts`'s `**` was `{ redirectTo: 'general/overview' }`. Anything that did not match a
route was bounced to the overview page, which answered `200` and is indexable. Google calls this
a soft 404 and explicitly discourages it: a missing page that reports success turns every typo,
every stale inbound link and every probing bot into another indexable entry point carrying
duplicate content, and it spends crawl budget that a site this new does not have to spare.

What was built:

- `pages/not-found-page/` — a real page, styled with the shared `doc-page` hero mixin, offering
  three links back into the site.
- `app.routes.ts`'s `**` renders it instead of redirecting, and carries `data: { notFound: true }`.
- `app.routes.server.ts`'s `**` carries `status: 404`. **This is the part that matters** — a
  not-found page that answers `200` changes nothing for a crawler.
- `NOT_FOUND_SEO` in `seo-data.ts`, read by `SeoService` via that route flag, so the tab does not
  say "Angular UI Component Library" over a not-found page. `noindex` was already automatic:
  the path is absent from `PAGE_SEO`.

Two traps paid for while doing it, both worth not re-discovering:

- **`status` does not exist on `RenderMode.Prerender`** — the type omits it. The 404 route has to
  be `RenderMode.Server`. Since `**` used to be the entry that prerendered everything, `''` is now
  listed separately as `Prerender` so the home route is still prerendered — the build still
  reports one prerendered static route, unchanged from before.
- **`SeoService` cannot detect the 404 from the path.** It runs on `NavigationEnd`, after the
  component is constructed, so a title set in the component is overwritten. The route `data` flag
  is read from the deepest activated snapshot instead — a path-prefix guess would have been a
  second copy of the routing rules in a file with no reason to hold them.

**The `:name` / `:slug` catch-alls are not this bug and were not touched.** `components/:name`
and `general/:slug` deliberately answer `200` with `noindex, follow`, which is the correct
handling for a route that renders real chrome around an unknown slug — re-verified locally after
the change:

```
/this-page-does-not-exist-12345   → 404, <title>Page not found — Guild of Gleks UI</title>,
                                     <meta name="robots" content="noindex, follow">
/components/does-not-exist-xyz    → 200, noindex, follow
/general/nope-slug                → 200, noindex, follow
```

## 3. Bing ownership tag is written but not live

`<meta name="msvalidate.01" …>` sits next to the Google one in `src/index.html`, added
2026-08-17. It only exists in the deployed build, so **verify in Bing Webmaster Tools only after
`npm run build:lab` and a deploy**, or the check fails and the property has to be re-submitted.

A DNS `CNAME` was also created for the same purpose. On 2026-08-17 neither hostname derived from
the verification token resolved:

```
78643888DB7747125C6786F78CCE2654.ui.guildofgleks.com  → NXDOMAIN
78643888DB7747125C6786F78CCE2654.guildofgleks.com     → NXDOMAIN
```

The exact host was guessed from the token, so this is not proof the record is wrong — check it
against what Bing shows. Bing accepts **any one** of file / meta tag / CNAME, so once the tag is
deployed the DNS record is redundant and can be left or dropped. If it is kept: a verification
`CNAME` on Cloudflare must be **DNS-only (grey cloud)**. Proxied, Cloudflare answers with its own
addresses and the verifier never sees `verify.bing.com`.

---

## Cloudflare, 2026-08-17

Both edge settings that were interfering were turned off: _AI Crawl Control → Manage robots.txt →
off_, and _Security → Bot Traffic → Allow_. The site had been returning **`403` to bots** — a
control entirely separate from the managed `robots.txt`, and invisible from reading that file.

`lab-seo.md`'s section on this **has been rewritten** (2026-08-17) and now records the managed
block as off, says to re-check the status code as well as the file after any Cloudflare change,
and no longer claims the block was cosmetic. Nothing left to do here.

## Re-checking all of it, after the deploy

```bash
curl -s https://ui.guildofgleks.com/robots.txt                        # our file only, no Cloudflare block
curl -s -o /dev/null -w "%{http_code}\n" https://ui.guildofgleks.com/ # 301  → fix 1 landed
curl -s -o /dev/null -w "%{http_code}\n" \
  https://ui.guildofgleks.com/nope-12345                              # 404  → fix 2 landed
curl -s https://ui.guildofgleks.com/components/does-not-exist-xyz \
  | grep 'name="robots"'                                              # noindex, follow — must still be 200
curl -s https://ui.guildofgleks.com/general/overview | grep msvalidate # → fix 3 landed, then verify in Bing
```

Note `-o /dev/null` without `-L` on the first two: following the redirect hides the very status
code being checked.

Search Console is the authority on whether Googlebot in particular was affected by the 403:
_URL inspection → Test live URL_, and the _Pages_ report for crawl failures logged during the
window the block was on. Once fix 2 is live, its _Pages_ report should also stop growing a
"Duplicate without user-selected canonical" bucket from mistyped URLs.
