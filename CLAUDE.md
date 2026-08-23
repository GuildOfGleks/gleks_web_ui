# gleks_web_ui — agent entry point

Angular v21 workspace holding the `@guildofgleks/ui` component library and two apps that
consume it.

| Project (CLI name) | Path                    | What it is                                                                    |
| ------------------ | ----------------------- | ----------------------------------------------------------------------------- |
| `@gleks/ui`        | `projects/gleks/ui`     | the library — published to npm as **`@guildofgleks/ui`**                      |
| `ui-showcase`      | `projects/ui-showcase`  | demo/validation app; **the only place to verify library changes live**        |
| `gleks-ui-lab`     | `projects/gleks-ui-lab` | public documentation site; tracks the **published** package, not local builds |

## Read these before working

The authoritative rules live in `.github/instructions/`. They are written in Copilot's
`applyTo` format, but they apply to **any** agent working here — read the ones matching the
files you are about to touch:

| File                               | Read it when                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `running-commands.instructions.md` | **always, before running any npm script** — which commands hang, and how to run them |
| `agent-workflow.instructions.md`   | always — cross-cutting rules, background-process cleanup                             |
| `general.instructions.md`          | any `.ts` — Angular v21 / TypeScript conventions                                     |
| `gleks-ui-library.instructions.md` | anything under `projects/gleks/ui` — authoring guide, definition of done             |
| `api-design.instructions.md`       | adding or changing any public API of the library                                     |
| `styling.instructions.md`          | any `.scss`/`.css` in the library — the three-layer token contract                   |
| `typescript.instructions.md`       | any `.ts`                                                                            |
| `ui-showcase.instructions.md`      | anything under `projects/ui-showcase`                                                |

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
   marker), so the _script_ itself is safe to run. Every other script finishes in under 15 s.
   Read `running-commands.instructions.md` before concluding something is "slow".
3. **A library change touches exactly two projects: the library and `ui-showcase`.** Never
   `gleks-ui-lab` — it tracks the _published_ package, so editing it in the same session puts
   its docs ahead of npm and can break its build. Anything the lab will need goes into
   `docs/lab-after-publish.md` as a checklist entry, and gets **deleted from there once it is
   actually done in the lab**. Verification is `ui-showcase`-only too: the two apps share one
   root `node_modules`, and the local-build swap must be undone afterwards. Full rule in
   `agent-workflow.instructions.md`.

## Current work

**`docs/backlog.md` is the live list** — everything known to be worth doing and not yet done, in
one file. Read it before proposing what to work on. It replaced two separate backlog sections
buried in completed plan documents, one of which had been carrying an item that shipped two
minors earlier without anyone noticing.

**The order it comes off the list is fixed: fixes and polish of what already ships, before
anything new.** A defect is something a consumer is hitting today; an unbuilt component is only
an absence.

Three future plans, three finished ones. A plan is not a backlog item — it is a decision already
taken about how something gets built. Update the status table in whichever you are working from,
as you go.

- `docs/themes-21.7.0.md` — a **future** plan, nothing started, queued behind the ripple: presets
  become full visual identities (radii, borders, shadows, density, typography) instead of palettes,
  and then a catalogue across eras. Its load-bearing measurement is that **510 of 1127 component
  token declarations in `theme.css` are literals**, 26 of them radii — which is why the lab's
  `material`/`primeng` themes had to name component tokens one at a time. Iteration 1 introduces a
  character layer so a theme sets ~25 foundation tokens instead, and new components inherit every
  theme's character for free.
- `docs/panel-card-21.6.0.md` — a **future** plan, nothing started: `gog-card` and `gog-panel`.
  Read its opening section before writing a line of it — the plan exists to answer whether these
  should be components at all, since a surface that only paints a background is a class (the
  showcase's own hand-rolled `.card` is five declarations across 37 templates). What justifies
  them is what a class cannot do: naming the region for a screen reader from a projected header,
  making an interactive card a real button/link rather than the `div (click)` trap 21.5.0 just
  fixed elsewhere, and folding in loading/disabled. Its first iteration is a decision — one
  component with a `size` input, or two — and it flags the `--gog-panel-*` collision with the
  existing foundation tokens.
- `docs/ripple-21.6.0.md` — a **future** plan, nothing started: a from-scratch pointer ripple
  (there is no CDK here and will not be), scoped to 21.6.0 rather than 21.5.0 because 21.5.0 is
  deliberately the breaking release and a feature there re-creates the pile the changelog was
  split to undo. Read its _What makes this harder than the animation_ section before estimating
  it — the animation is the cheap part; `gogBadge` overflows its host on purpose, which is what
  stops a ripple simply clipping the host's box.
- `docs/hardening-21.5.0.md` — **completed 2026-08-20**, all seven iterations: coverage measurement
  with a CI gate, the token-prefix rename (`--gog-btn-*`/`--gog-ms-*`/`--gog-confirm-*` spelled
  out, old spellings alive until 21.7.0), every removal 21.5.0 owed plus a ratchet that fails the
  build on an overdue tag, RTL support, test depth (917 → 1000 tests), `gog-menu`, and
  `GOG_DEPRECATIONS`. **History, not a to-do list** — read it to find out why something is the way
  it is. Kept for its per-iteration outcomes and for the write-ups of everything its backlog
  produced, several of which record a hypothesis that measurement disproved.
- `docs/consumer-dx-plan.md` — completed: the package as a consumer meets it (onboarding,
  accessibility defaults, native attributes, packaging, icon registry, table outputs/lazy/
  selection, link-flavoured button). Kept for its per-iteration outcomes and its backlog.
- `docs/refactor-21.3.0.md` — the completed 21.3.0 pre-public cleanup (architecture, token
  contract, API consistency). Kept as the record of why those decisions were made.

`docs/branching-and-support.md` records the branch-per-Angular-major model that takes effect
when Angular 22 lands: `master` (new major) vs `v21` (fixes only), which changes go where, the
npm dist-tag mechanics, and what must ship _before_ the split. Decided, not yet in effect.

`docs/lab-versioning.md` covers how the lab communicates version-to-version change, in four
layers. **Layers 1 (version badge), 2 (the `general/releases` page, which renders the
`CHANGELOG.md` shipped inside the installed package) and 3 (`since` chips on new API) are
implemented**; layer 4 (generated deprecation badges) is deliberately deferred to
`hardening-21.5.0.md` iteration 3, which needs the same generator. The file also records the
major-version branch/subdomain approach, which is still only a recommendation.

`docs/lab-examples-handoff.md` is the **running state** of that refactor — which pages are
converted, the folder shape settled by the pilot, the traps already paid for, and what the next
page needs. Read it first if you are continuing the work; it is short and it is the file that
goes stale, so update it as you go.

`docs/lab-stackblitz-plan.md` is the post-mortem of the reverted StackBlitz refactor
(`b6dc543`, undone by `fca14ba`) and the plan that replaces it. **Read it before touching the
lab's examples in bulk.** Its two load-bearing conclusions: extraction and StackBlitz are separate
projects and must not share a commit, and no commit converts more than one component page. It also
records the reason extraction is still worth doing — the source panels are hand-typed copies of
the rendered demo, and one of them had already drifted.

`docs/lab-seo.md` covers the docs site's search-engine setup: per-page titles/descriptions
(`seo-data.ts` + `SeoService`), canonicals, `noindex` on the router's catch-all routes, the
generated `sitemap.xml`, and the SSR host allow-list in `server.ts` — **without which the site
serves an empty client-side shell to crawlers**, which is how it was deployed until 2026-08-15.
It also lists what only the site owner can do (Search Console, links).

`docs/lab-after-publish.md` is the deferred backlog for `gleks-ui-lab`. Because the lab tracks
the **published** package, library work never updates it in the same session — anything the lab
will need to say (or currently says wrongly) is recorded there instead, grouped by the release
that unblocks it. Add to it whenever a library change would otherwise tempt you to edit the lab.
