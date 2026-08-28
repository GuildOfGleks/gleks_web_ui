# Showing version-to-version change in `gleks-ui-lab`

How the documentation site communicates what changed between releases. Written up on 2026-08-14
as a recommendation; **all four layers are now implemented** — 1 and 3 the same day, 2 once 21.4.3
put a package on npm that carries `CHANGELOG.md`, and 4 on 2026-08-28, once the same generator
`hardening-21.5.0.md` iteration 3 built for a CI check turned out to be exactly what layer 4
needed too.

| Layer | State |
| --- | --- |
| 1 — version badge | **done** — `components/shared/library-version.ts`, rendered in `app.html` |
| 2 — releases page | **done** — `CHANGELOG.md` ships in `ng-package.json`'s `assets`, an asset glob copies it to `docs/`, and `components/pages/releases-page/` renders it at `general/releases` |
| 3 — `since` markers | **done** — `components/shared/since-badge/`, plus a `.since` rule in `src/styles.scss` for the markdown docs; API rows from 21.3.1 onward carry one |
| 4 — deprecation badges | **done** — see below |

Companion to `lab-after-publish.md`, which tracks *what* the lab must say after each release. This
file is about the *mechanism* for saying it.

## The three questions a reader actually has

Worth separating, because they want different answers and the third is the one usually forgotten:

1. **"Which version is this site describing?"** — asked implicitly, on every page, and unanswerable
   today. Until it has an answer, none of the others can be interpreted.
2. **"Can I use this on the version I'm pinned to?"** — the day-to-day question, asked at a
   specific input or component, not at a release note.
3. **"What will break when I upgrade?"** — asked once per upgrade, and the most expensive to get
   wrong. This is the one a changelog answers badly (you have to read every entry) and structured
   metadata answers well.

"What's new in this release" — the thing a version-switcher is usually built for — is the *least*
useful of the four for a patch release. It matters for a major.

## Recommended: four layers, cheapest first

Each layer stands alone and is useful without the ones after it. None of them versions the site
itself.

### Layer 1 — the site states which version it documents

A badge in the lab header showing the version of the package the site was built against.

**Mechanics.** The lab resolves `@guildofgleks/ui` from `node_modules` (its `tsconfig.app.json`
clears `paths` on purpose), so the honest source is
`node_modules/@guildofgleks/ui/package.json`'s `version`, read at build time. Either import it in
the lab (`resolveJsonModule`) or have `scripts/` write it into a generated const, the way
`generate-tokens.mjs` writes `token-names.ts`.

**Cost.** Three lines. **Value.** Highest per byte in this document: a reader who cannot tell
whether a page is ahead of their install or behind it cannot trust anything else on it.

**As built.** `components/shared/library-version.ts` imports
`@guildofgleks/ui/package.json` — the package's `exports` map lists `./package.json`, and
`tsconfig.app.json` gained `resolveJsonModule` for it — and exports `LIBRARY_VERSION` plus an npm
URL pinned to that version. The header badge in `app.html` renders both. The hardcoded
`v21.3.0` it replaced had been wrong for four releases, which is the argument for reading it
rather than writing it.

### Layer 2 — a `Releases` page rendering the package's own `CHANGELOG.md`

Not a copy of it, and not a hand-written summary — the changelog **of the exact version
installed**, so it is structurally incapable of drifting.

**Mechanics.**

1. Library side: add `CHANGELOG.md` to `ng-package.json`'s `assets`. Today the package ships
   `README.md`, `AGENTS.md` and `TOKENS.md` and the changelog stays in the repo, which is why the
   lab cannot read it.
2. Lab side: an asset glob for `node_modules/@guildofgleks/ui/CHANGELOG.md`, the same pattern
   `angular.json` already uses to copy that package's stylesheets into `docs/styles`.
3. A route rendering it with the existing markdown component — the same one behind
   `public/docs/theming.md` and friends.
4. Slugged anchors on the version headings so a release can be linked directly from a component
   page or a GitHub issue.

**How step 4 actually turned out.** The anchors are not `#21-4-0`: `slugify()` strips `[`, `]`
and `.`, so `## [21.4.3] - 16.08.2026` becomes `#2143---16082026`. Rather than change the shared
renderer for one page, the releases page builds its own index row by running that same `slugify`
over the same heading text — the anchor format stays an implementation detail and cannot drift
from what the renderer emits. **Do not hand-write a version anchor anywhere**; import `slugify`.

The page also drops the changelog's own leading `# Changelog` heading, because it supplies its
own `<h1>`, and marks any `planned` heading in the index — two of them can be open at once (an
imminent patch and the next minor), which is normal rather than a bug to fix.

**Cost.** One line in the library, a route and a glob in the lab. Zero ongoing maintenance.
**Caveat.** It shows only what the changelog says, which means the quality of this page is exactly
the quality of the changelog — currently high, and worth protecting.

### Layer 3 — `since` markers in the API tables

A small `since="21.4.0"` chip next to a new input, output, component or config key. This answers
question 2 *where the question is asked*, which a release-notes page cannot.

**Mechanics.** Manual, and that is acceptable: the marker is added at the moment the API is being
documented anyway, and only for **new** API — nothing needs backfilling beyond the current
version if you do not want to.

**Bonus.** Once the data exists, "What's new in 21.4.0" is a filter over it rather than a page
someone writes and then forgets to update.

**Cost.** One attribute per new API entry. **Value.** The highest of the four for everyday use.

**As built.** Two renderers needed the same chip, so the CSS lives once, globally, in
`src/styles.scss` (`.since`, with a `--latest` modifier and the word "NEW" as a `::before`):

- component doc pages use `<app-since version="21.4.0" />`
  (`components/shared/since-badge/`), driven off an optional `since?: string` on each page's own
  API-row interface;
- the markdown docs under `public/docs/` write `<span class="since" title="Added in 21.3.2">21.3.2</span>`
  by hand — they are parsed to raw HTML and never compiled by Angular, so no component-scoped
  stylesheet could reach them.

`--latest` is compared at **major.minor**, not exactly: a patch adds no API, so 21.4.0's
additions are still "what's new" to someone on 21.4.1. Comparing full versions would
un-highlight a whole feature set the moment a bug fix shipped.

### Layer 4 — deprecations, generated

More valuable than "what's new": what will break. **Built 2026-08-28** as a single generated page
section, not a per-row badge — see "Why a section, not a per-row badge" below for why the second
half of the original sketch didn't survive contact with the actual data.

**Mechanics.** The metadata already existed, shipped in 21.5.0 for `hardening-21.5.0.md` iteration
3's CI check — one generator, two consumers, exactly as this section originally hoped:

```
@deprecated since 21.3.0 (2026-08-07) — use `gog-column` instead. Removed in 21.5.0.
```

`scripts/generate-deprecations.mjs` walks `projects/gleks/ui/src` and `theme.css`'s fallback
chains, and ships `GOG_DEPRECATIONS: readonly GogDeprecation[]` with the package (`kind`, `name`,
`replacement`, `since`, `sinceDate`, `removedIn` — the real shape ended up a little different from
this doc's original sketch, which imagined a single `symbol` field covering both TypeScript
exports and CSS tokens; the shipped version splits them by `kind` instead). Verified in CI with
`check:deprecations`, exactly like `generate-tokens.mjs`.

The lab reads it straight from the installed package —
`projects/gleks-ui-lab/src/app/components/pages/theming-page/deprecated-token-groups.ts` groups
the token half and `theming-page.ts`/`.html` render it as a collapsible section per prefix, above
the main token reference. No lab-side data entry, so it cannot drift from what actually ships.

**Why a section, not a per-row badge.** The theming page's existing `TokenRow` entries are
hand-authored and often collapse several real token names into one shorthand row (`--gog-button-bg
/ -color / -border / -padding / -font-size`) — matching a manifest entry's exact `name` against
that shorthand would need a parser for a notation invented for human readability, not machine
matching, and a parser that gets a shorthand wrong produces a false *negative*: a deprecated token
silently missing its badge, which is worse than not having badges at all. A dedicated generated
section — the "optionally a single page" half of this doc's original sketch — sidesteps the
problem entirely: it reads `GOG_DEPRECATIONS` directly, needs no matching, and can't be
half-wrong. It also directly replaced a hand-written paragraph in the multiselect token section
that had drifted (`--gog-multiselect-* (was --gog-multiselect-*)`, un-fixed since the token
removal's target release moved from 21.5.0 to 21.7.0) — exactly the failure mode layer 4 exists to
prevent.

**Grouping trap, found in a browser, not by the type checker.** The obvious group key — every
token deprecated in the same announcement shares its `since`/`sinceDate`/`removedIn` triple — is
wrong: `--gog-btn-*` and `--gog-confirm-*` were both deprecated on the same day for the same
removal version, so that key merges two unrelated prefixes into one group with a meaningless
common prefix (`--gog-*`). The working key is structural instead: a deprecated token is always
`--gog-<shortPrefix>-<rest>`, so `name.split('-')[3]` is the short prefix, independent of whether
two renames happen to share a date.

**Interim note.** Until the next publish, the rendered page also carries three phantom rows —
bare `--gog-btn-`, `--gog-ms-`, `--gog-confirm-` entries with no real suffix, matched out of
`theme.css`'s own header comment by the pre-2026-08-28 scanner rather than a real declaration
(fixed the same day in `scripts/deprecations.mjs` and `scripts/check-tokens.mjs`, regenerating
151 real entries instead of 154). The lab renders whatever the installed package ships, by design
— see `CLAUDE.md` rule 3 — so this self-corrects on the next release with no lab change needed.

**Cost.** One generator (already paid for by iteration 3), one lab page section. **Value.** This
is the layer that makes an upgrade predictable, and because it is generated it cannot rot — which
is the whole difference between "we will keep the docs updated" and the docs being updated.

## Major versions — branch and subdomain

The existing plan, recorded here so it is written down: a major (Angular 21 → 22) gets its own
branch and its own deployment at a subdomain, leaving the previous major's site standing.

This is the only case where a full documentation snapshot earns its cost, because a major is
exactly when the *current* docs stop being true for people who have not upgraded.

**It fits the existing deploy setup.** `.github/workflows/deploy-lab.yml` is
`workflow_dispatch`-triggered with `tag` and `port` inputs and builds a Docker image, so a second
deployment is another invocation with a different tag and port rather than new machinery. What
will need adding:

- a link between the two sites ("documenting v21 — v22 is here"), on both, or the old one becomes
  a trap for search traffic;
- a decision on which subdomain is canonical for SEO — usually the latest, with the older marked
  `noindex` or `rel=canonical`-pointed forward.

## What not to do for patch releases

- **A version dropdown that swaps the whole documentation set.** The cost is continuous — every
  patch means another snapshot to build, host and keep from bit-rotting — and the payoff is near
  zero, because a patch rarely changes documented API. When it does, layers 2–4 already say so.
- **Full site snapshots per patch.** Same reasoning, worse storage.
- **A hand-written "what's new" page per release.** It duplicates the changelog, and the duplicate
  is the copy that goes stale. If a release deserves prose beyond the changelog, that is a blog
  post or a release note on GitHub, not a page in the API docs.

## Sequencing

Layers 1 and 3 are lab-only and can happen at any time. Layers 2 and 4 need a library change
first, so they are gated on a release:

| Layer | Library side | Lab side |
| --- | --- | --- |
| 1 — version badge | — | read `version` from the installed `package.json` |
| 2 — releases page | ship `CHANGELOG.md` in `assets` | asset glob + route + markdown render |
| 3 — `since` markers | — | manual chips in the API tables |
| 4 — deprecation badges | generator + ship the manifest | read manifest, render badges |

Both library-side items are iteration 7 of `hardening-21.5.0.md`. Once they ship, the lab-side
halves become entries in `lab-after-publish.md` under that release, per
`agent-workflow.instructions.md`.

## Open questions

- ~~**Does layer 3 get backfilled?**~~ **Decided: no.** Marked from **21.3.1** onward — the four
  releases the lab was documenting at the time — and nothing earlier. An absent `since` reads as
  "has been there a while", which is true and sufficient.
- **Where does the deprecation manifest live in the package** — a generated `.ts` in the public
  API (importable, typed, tree-shakeable) or a plain `.json` asset (readable without pulling code
  in)? The `.ts` matches `token-names.ts`; the `.json` is friendlier to the lab's markdown-ish
  rendering. Either works; pick one and note it.
- **Should the lab warn when it is behind npm?** It could compare its own built-against version to
  the latest on the registry at build time and show "a newer version is available". Useful, but it
  couples the docs build to a network call — probably not worth it.
