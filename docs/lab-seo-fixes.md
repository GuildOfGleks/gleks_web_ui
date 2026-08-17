# `gleks-ui-lab` — open SEO fixes

Found on **2026-08-17**, while working out why Gemini said it could not read the site. Everything
here is a `gleks-ui-lab` change and belongs in its own commit, separate from library work —
`CLAUDE.md` rule 3.

`lab-seo.md` stays the description of how the site's SEO is built. This file is only the list of
what is still wrong, and it should shrink to nothing: **delete an entry once it is actually
fixed and deployed.**

| # | What | Where | Status |
| --- | --- | --- | --- |
| 1 | The home page redirects with a `302` | `app.routes.ts:5` | open |
| 2 | Unknown URLs redirect instead of 404ing | `app.routes.ts:242` | open |
| 3 | Bing ownership tag | `src/index.html:19` | in the working tree, **needs a deploy** |

---

## 1. `/` answers with a temporary redirect

```
curl -s -o /dev/null -w "%{http_code}\n" https://ui.guildofgleks.com/   # → 302
```

`app.routes.ts:5` sends `''` to `general/overview`, and Angular's SSR renders that as a `302`.
A `302` tells a search engine "this is temporary, keep the original URL" — so the ranking signals
from every link people write (and `/` is the URL people write) are not consolidated onto the page
that actually holds the content.

Two ways out, and the second is better:

- Make the redirect permanent (`301`) at the SSR/edge layer.
- Serve the overview at `/` directly and stop redirecting. That removes the round trip entirely,
  makes the strongest URL on the domain the one with the content on it, and lets the canonical
  simply be `https://ui.guildofgleks.com/`.

Whichever is chosen, `SeoService`'s canonical rule needs to follow it — `lab-seo.md`'s table
currently records that "`/` and `/general/overview` both canonicalise to the latter, since `/`
redirects there", which stops being true under the second option.

## 2. The site has no 404 — every unknown URL is a soft 404

```
curl -sL -o /dev/null -w "%{http_code} %{url_effective}\n" \
  https://ui.guildofgleks.com/this-page-does-not-exist-12345
# → 200 https://ui.guildofgleks.com/general/overview
```

`app.routes.ts:242` is `{ path: '**', redirectTo: 'general/overview' }`. Anything that does not
match a route is bounced to the overview page, which answers `200` and is indexable. Google calls
this a soft 404 and explicitly discourages it: a missing page that reports success turns every
typo, every stale inbound link and every probing bot into another indexable entry point carrying
duplicate content, and it spends crawl budget that a site this new does not have to spare.

The fix is a real not-found page: its own route, `noindex`, and — the part that actually
matters — an HTTP **404** from the server render, not a `200`. Angular SSR can set the status
during rendering; a client-side-only 404 page still returns `200` to the crawler and changes
nothing.

**The `:name` / `:slug` catch-alls are not this bug and must not be "fixed" alongside it.**
`components/:name` and `general/:slug` deliberately answer `200` with `noindex, follow`, which is
the correct handling for a route that renders real chrome around an unknown slug — verified still
working on 2026-08-17:

```
curl -s https://ui.guildofgleks.com/components/does-not-exist-xyz | grep 'name="robots"'
# → <meta name="robots" content="noindex, follow">
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

## What changed in Cloudflare on 2026-08-17, and what `lab-seo.md` gets wrong

`lab-seo.md`'s section *"Cloudflare rewrites `robots.txt` in flight"* describes the managed block
accurately but reaches the wrong conclusion — it says the effect is cosmetic and that nothing is
blocked. Two things were wrong about that:

- **The site was returning `403` to bots**, not merely signalling a preference. `/` and
  `/sitemap.xml` both refused an automated fetch while `/robots.txt` was served normally. That is
  Bot Fight Mode / AI crawler blocking at the edge, a separate control from the managed
  `robots.txt` — reading the `robots.txt` alone will never reveal it. **Check the status code, not
  just the file.**
- `Google-Extended: Disallow: /` genuinely did stop Gemini from using the content. The doc is
  right that it is not Googlebot and does not touch Search ranking, but grounding an AI answer is
  exactly what it governs, and that was the original complaint.

Both were turned off on 2026-08-17: *AI Crawl Control → Manage robots.txt → off*, and
*Security → Bot Traffic → Allow*. Verified afterwards: `robots.txt` now serves only the repo's own
file, `/` answers `200` with fully server-rendered content, and title, description, canonical,
Open Graph and `robots: index, follow` are all present in the delivered HTML.

**When `lab-seo.md` is next edited, that section needs rewriting** — as written it will talk a
future reader out of investigating a real outage. The paragraph that replaces it should say: the
managed block is off, re-check `robots.txt` *and* the HTTP status after any Cloudflare change, and
a 403 to crawlers is invisible from the robots file.

## Re-checking all of it

```bash
curl -s https://ui.guildofgleks.com/robots.txt                        # our file only, no Cloudflare block
curl -s -o /dev/null -w "%{http_code}\n" https://ui.guildofgleks.com/ # 301 once fix 1 lands, 200 if served directly
curl -sL -o /dev/null -w "%{http_code}\n" \
  https://ui.guildofgleks.com/nope-12345                              # 404 once fix 2 lands
curl -s https://ui.guildofgleks.com/general/overview | grep -E 'msvalidate|name="robots"'
```

Search Console is the authority on whether Googlebot in particular was affected by the 403:
*URL inspection → Test live URL*, and the *Pages* report for crawl failures logged during the
window the block was on.
