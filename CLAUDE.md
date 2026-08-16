# gleks_web_ui — agent entry point

Angular v21 workspace holding the `@guildofgleks/ui` component library and two apps that
consume it.

| Project (CLI name) | Path | What it is |
| --- | --- | --- |
| `@gleks/ui` | `projects/gleks/ui` | the library — published to npm as **`@guildofgleks/ui`** |
| `ui-showcase` | `projects/ui-showcase` | demo/validation app; **the only place to verify library changes live** |
| `gleks-ui-lab` | `projects/gleks-ui-lab` | public documentation site; tracks the **published** package, not local builds |

## Read these before working

The authoritative rules live in `.github/instructions/`. They are written in Copilot's
`applyTo` format, but they apply to **any** agent working here — read the ones matching the
files you are about to touch:

| File | Read it when |
| --- | --- |
| `running-commands.instructions.md` | **always, before running any npm script** — which commands hang, and how to run them |
| `agent-workflow.instructions.md` | always — cross-cutting rules, background-process cleanup |
| `general.instructions.md` | any `.ts` — Angular v21 / TypeScript conventions |
| `gleks-ui-library.instructions.md` | anything under `projects/gleks/ui` — authoring guide, definition of done |
| `api-design.instructions.md` | adding or changing any public API of the library |
| `styling.instructions.md` | any `.scss`/`.css` in the library — the three-layer token contract |
| `typescript.instructions.md` | any `.ts` |
| `ui-showcase.instructions.md` | anything under `projects/ui-showcase` |

Three documents ship **inside the npm package** and count as part of the library, not as notes
about it: `README.md`, `AGENTS.md` and `TOKENS.md` (generated). `CHANGELOG.md` stays in the repo.
`AGENTS.md` is the per-component API reference an agent reads while building an app on the
package — it is the one that goes stale first and without any build failing, so **any change to
an input, output, slot, type, service method or default edits it in the same change.** See
`gleks-ui-library.instructions.md`, definition of done, step 9.

## The three rules that bite hardest

1. **Never publish.** Do not bump the version, do not edit `CHANGELOG.md`'s `planned` heading,
   do not run `npm publish` or `npm run release` — not even when asked in a way that seems to
   authorise it. The user cuts every release. See `gleks-ui-library.instructions.md` rule 11.
2. **The raw `ng build gleks-ui-lab` never exits** even though it succeeds — `npm run build:lab`
   works around this via `scripts/build-lab.mjs` (kills the process once it sees the completion
   marker), so the *script* itself is safe to run. Every other script finishes in under 15 s.
   Read `running-commands.instructions.md` before concluding something is "slow".
3. **A library change touches exactly two projects: the library and `ui-showcase`.** Never
   `gleks-ui-lab` — it tracks the *published* package, so editing it in the same session puts
   its docs ahead of npm and can break its build. Anything the lab will need goes into
   `docs/lab-after-publish.md` as a checklist entry, and gets **deleted from there once it is
   actually done in the lab**. Verification is `ui-showcase`-only too: the two apps share one
   root `node_modules`, and the local-build swap must be undone afterwards. Full rule in
   `agent-workflow.instructions.md`.

## Current work

One live plan, two finished ones. Update the status table in whichever you are working from, as
you go.

- `docs/hardening-21.5.0.md` — the **current** plan: the library measured against itself
  (coverage tooling, token-prefix consistency, the removals 21.5.0 already owes, RTL, thin specs,
  `gog-menu`, version metadata for the docs site). Iterations 1–6 are open and iteration 7's first
  step (shipping `CHANGELOG.md` in the package) is already done — **on hold** while the user
  verifies the already-tagged releases against a private consuming project. Its
  *Pre-iteration readiness check* section records the state the plan starts from: lint, format,
  tokens, tests and all three builds green as of 2026-08-15.
- `docs/consumer-dx-plan.md` — completed: the package as a consumer meets it (onboarding,
  accessibility defaults, native attributes, packaging, icon registry, table outputs/lazy/
  selection, link-flavoured button). Kept for its per-iteration outcomes and its backlog.
- `docs/refactor-21.3.0.md` — the completed 21.3.0 pre-public cleanup (architecture, token
  contract, API consistency). Kept as the record of why those decisions were made.

`docs/branching-and-support.md` records the branch-per-Angular-major model that takes effect
when Angular 22 lands: `master` (new major) vs `v21` (fixes only), which changes go where, the
npm dist-tag mechanics, and what must ship *before* the split. Decided, not yet in effect.

`docs/lab-versioning.md` covers how the lab communicates version-to-version change, in four
layers. **Layers 1 (version badge), 2 (the `general/releases` page, which renders the
`CHANGELOG.md` shipped inside the installed package) and 3 (`since` chips on new API) are
implemented**; layer 4 (generated deprecation badges) is deliberately deferred to
`hardening-21.5.0.md` iteration 3, which needs the same generator. The file also records the
major-version branch/subdomain approach, which is still only a recommendation.

`docs/lab-seo.md` covers the docs site's search-engine setup: per-page titles/descriptions
(`seo-data.ts` + `SeoService`), canonicals, `noindex` on the router's catch-all routes, the
generated `sitemap.xml`, and the SSR host allow-list in `server.ts` — **without which the site
serves an empty client-side shell to crawlers**, which is how it was deployed until 2026-08-15.
It also lists what only the site owner can do (Search Console, links).

`docs/lab-after-publish.md` is the deferred backlog for `gleks-ui-lab`. Because the lab tracks
the **published** package, library work never updates it in the same session — anything the lab
will need to say (or currently says wrongly) is recorded there instead, grouped by the release
that unblocks it. Add to it whenever a library change would otherwise tempt you to edit the lab.
