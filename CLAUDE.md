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

## Where the project is

**Latest release: 21.6.1 (2026-08-26).** `projects/gleks/ui/CHANGELOG.md` is the authority and
ships inside the package; its top entry is always the version being worked on.

### The release sequence

| Version    | State                                        | What it must carry                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21.6.0     | **released**                                 | seven fixes and `gog-table`'s `maxHeight`                                                                                                                                                                                                                                                                                                                                                           |
| 21.6.1     | **released (2026-08-26)**                    | `aria-busy` on `gog-table` and `gog-autocomplete` plus `check:loading-aria`, **`gog-card` + `gog-panel`** (`docs/panel-card.md`, **all four iterations** — iteration 4 converted all 40 showcase pages and retired the app's own `.card`, 2026-08-26), **and the ripple, complete** (`docs/ripple.md`, all four iterations: `gogRipple`, nine components wired, `GOG_CONFIG.ripple.enabled`, off by default). AGENTS.md, README.md, TOKENS.md and the CHANGELOG all carry it; `npm view @guildofgleks/ui version` confirms it on the registry. |
| **21.7.0** | **the mandatory payload is done (2026-08-28); only the version bump remains** | **the three deprecated token prefixes are gone** — `--gog-btn-*` → `--gog-button-*`, `--gog-ms-*` → `--gog-multiselect-*`, `--gog-confirm-*` → `--gog-confirmation-dialog-*` — from `theme.css`, `button.css`, `ui-showcase`, the generated artifacts (`GOG_DEPRECATIONS` now `[]`) and both published docs (`README.md`, `AGENTS.md`, which gained a **Removed in 21.7.0** table matching **Removed in 21.5.0**'s shape); `CHANGELOG.md` carries `### Removed` and `### Fixed` entries under `## [21.7.0] - planned`. `check:tokens` reports zero left; `check:deprecations` now actually enforces the deadline for any *future* deprecation the same way — it reads `DEPRECATED_NAMESPACES` and fails once a namespace's `removedIn` is at or below the library's version and the stylesheets still contain it, sanity-checked by simulating the overdue case against scratch copies, never a commit. Verified live in `ui-showcase` under all three custom themes; `check:tokens`/`check:deprecations`/`lint`/`format:check`/`test:lib`/`build:lib`/`build:showcase` all pass, `check:release` still correctly fails on the version/heading. All six of `docs/token-prefix-removal.md`'s iterations are ✅. **What's left is rule 1's territory, not an agent's:** the user bumps `package.json` and dates the `planned` heading when ready to publish. |
| 22.x       | when Angular 22 lands                        | the branch split — see `docs/branching-and-support.md`                                                                                                                                                                                                                                                                                                                                              |

**`themes.md` iteration 1 started 2026-08-29**, on the sequencing its own plan and
`token-prefix-removal.md`'s closing section both argued for: not sharing a release with the
removal, but starting immediately after it, once verified — so a moved pixel has one suspect, not
two. Both jobs are accepted by the same test ("no computed default changed"); doing them
back-to-back rather than interleaved is what keeps that test meaningful. See `themes.md`'s own
status table for where the other four iterations stand — nothing else there is started.

### Cutting a release — why an agent does none of it

`npm run check:release` fails whenever `projects/gleks/ui/package.json`'s version doesn't match
the changelog's top `[x.y.z]` entry, or that heading still reads `planned` instead of a date.
Bumping the version and dating the heading _are_ cutting the release, which is rule 1's territory:
**the user cuts every release.** Do not "fix" the check by doing either — a clean `check:release`
on a version still being worked on means someone jumped the gun, not that the check is wrong.

Once a release is published: `npm install` at the repo root, then work through
`docs/lab-after-publish.md`'s section for that version. That file is a live checklist; delete
each entry as it lands. **21.6.1's lab section is fully checked off** (all three pages —
`components/card`, `components/panel`, `components/ripple` — plus `since` chips and the theming
rows); what remains there is the bundle-bench re-measurement, tracked in
`projects/gleks-ui-lab/public/docs/compare-full.md`'s own history rather than as an open
checklist item.

**A future plan's filename carries no version** — `panel-card.md` and `ripple.md`
were both named for a release that shipped without them, which is what that always becomes. A
_completed_ plan keeps its version, because there it is a fact. Each future plan states its target
in its own first paragraph, where it can be changed.

## What to work on

**`docs/backlog.md` is the live list** — everything known to be worth doing and not yet done, in
one file. Read it before proposing anything. It replaced two separate backlog sections buried in
completed plan documents, one of which had been carrying an item that shipped two minors earlier
without anyone noticing.

**The order it comes off the list is fixed: fixes and polish of what already ships, before
anything new.** A defect is something a consumer is hitting today; an unbuilt component is only
an absence. As of 2026-08-28 the backlog's defects section is empty again — three found while
planning 21.7.0 (a `var(--gog-…)` with no fallback naming a property nothing declares, which
silently drops the whole declaration) were fixed and closed the same day, as iteration 0 of
`docs/token-prefix-removal.md`, ahead of the removal itself — the removal's mechanical rule would
otherwise have copied one of them forward verbatim. That iteration also added a permanent check
for the family (`check-tokens.mjs` rule F), so the next instance fails a build instead of waiting
a month, and see `docs/backlog.md` for the fourth, related defect it was found alongside.

A plan is not a backlog item — it is a decision already taken about how something gets built.
Update the status table in whichever you are working from, as you go.

- `docs/token-prefix-removal.md` — **the plan for 21.7.0's mandatory payload**, in six iterations
  with a status table. It began as a pure per-file checklist on the view that a mechanical removal
  leaves no decision to make; the survey that produced the list disproved that, so it is now a plan.
  It still carries the checklist — every file with a `--gog-btn-*`/`--gog-ms-*`/`--gog-confirm-*`
  reference, what kind of change each needs, and the 12 live overrides in `ui-showcase` that must
  migrate in the same release or go dead silently — plus the three things that are decisions:
  **iteration 0**, three dead-token-reference defects the removal would otherwise carry forward
  (`docs/backlog.md`); **iteration 2**, the ratchet that does not cover CSS; **iteration 3**, two
  generators that have never emitted an empty list. It also records why `docs/themes.md` should
  _not_ ride along despite naming the same version.
- `docs/themes.md` — presets become full visual identities (radii, borders, casing, tracking)
  instead of palettes, then a catalogue across eras. **Iteration 1 done 2026-08-29**: four new
  foundation tokens (`--gog-text-transform`, `--gog-letter-spacing`, `--gog-border-width`,
  `--gog-border-style`) plus wider adoption of three that already existed (`--gog-radius`,
  `--gog-control-border-width`/`-style`), and 40 of `theme.css`'s then-548 literal component
  tokens converted to derive from them — re-measured against the current file, not the plan's
  original 2026-08-17 count, which had drifted after three releases. The rest stayed literal on
  purpose, by category: pills/circles and deliberately-flat radii are shape choices a rounding
  axis shouldn't touch; density (174 declarations) is explicitly deferred to its own iteration,
  per the plan's still-open question about its interaction with `GogSize`; font-weight has no
  dominant value to extract. `check-tokens.mjs` gained rule G — a literal that repeats a
  character token's *value*, not just its property category, in a covered category — which
  caught one the manual audit missed (`--gog-table-border-width`) before the audit was even
  done. Iterations 2–5 are not started; see `themes.md`'s own _Iteration 1, as it finished_
  section for the full audit table and verification record.
- `docs/panel-card.md` — **built 2026-08-23 into 21.6.1, finished 2026-08-26**: `gog-card` and
  `gog-panel`, all four iterations done. Read its _Iteration 1, as resolved_ section rather than the
  sketch above it: two of the answers came out differently from the plan. There is no `interactive`
  input — a card becomes interactive by containing a `gogCardLink`, a directive on the consumer's
  own `<a>`, for the same reason `[gogButton]` is one — and the `--gog-panel-*` collision resolved
  by the component _adopting_ the foundation surface tier rather than either side renaming.
  **Iteration 4 (the showcase's own `.card` goes away) is done**: all 40 pages converted and the
  class retired. Its _as it finished_ section carries the verdict the iteration existed for —
  the swap stayed mechanical across every page, no wrapper `<div>` and no `::ng-deep` ever needed —
  plus the two things the plan did not anticipate, both worth reading before any similar bulk job.
- `docs/showcase-card-to-panel.md` — **the record of that iteration 4, now complete**. Kept for two
  findings that outlive it. **The first count was wrong in an instructive way:** it used
  `grep -c 'class="card"'`, an exact substring match, so every block pairing `card` with a
  page-local class was invisible — two whole pages were missing from the checklist. Count class
  _tokens_, split on whitespace. **And the last block was not a panel:** `benchmark-index-page`'s
  tiles were `<a class="card …" routerLink>`, and a panel is never a link, so they became a
  `gog-card` with a `gogCardLink` — the one block in 250 that resisted `gog-panel` turned out to be
  exactly what `gog-card` was built for. The nine-step recipe and symptom→cause→fix table are still
  there if a comparable conversion ever comes up. **One page per commit**, for the reason
  `lab-stackblitz-plan.md` records.
- `docs/ripple.md` — **built 2026-08-23 into 21.6.1, all four iterations**: `[gogRipple]` for
  markup a consumer owns, plus the ripple wired into nine of the library's own components and one
  app-wide switch, `GOG_CONFIG.ripple.enabled`, **off by default**. Three of its findings matter to
  anyone touching this code: the self-clipping layer _is_ how the directive renders anything (which
  is what keeps `gogBadge`, deliberately overflowing its host, from being clipped); the engine
  lives in `GogRippleController` rather than in the directive, because
  `[gogButton]`/`gogMenuItem`/`gogCollapsibleTrigger` cannot reach it through `hostDirectives`; and
  a disabled ripple attaches no listeners and adds no class, which is the whole argument for a
  config key over a `--gog-ripple-opacity: 0` token. Two surfaces are deliberately left out with
  reasons recorded — `gog-table` rows and `gogCardLink`. **Verification trap, not a bug:** a
  background Chrome tab pauses CSS animations, so a scripted press produces a node that never
  animates.
- `docs/hardening-21.5.0.md` — **completed 2026-08-20**, all seven iterations: coverage measurement
  with a CI gate, the token-prefix rename (`--gog-btn-*`/`--gog-ms-*`/`--gog-confirm-*` spelled
  out, old spellings alive until 21.7.0), every removal 21.5.0 owed plus a ratchet that fails the
  build on an overdue tag, RTL support, test depth (917 → 1000 tests), `gog-menu`, and
  `GOG_DEPRECATIONS`. **History, not a to-do list** — read it to find out why something is the way
  it is. Kept for its per-iteration outcomes and for the write-ups of everything its backlog
  produced, several of which record a hypothesis that measurement disproved.
- `docs/consumer-dx-plan.md` — completed: the package as a consumer meets it (onboarding,
  accessibility defaults, native attributes, packaging, icon registry, table outputs/lazy/
  selection, link-flavoured button). Kept for its per-iteration outcomes; its backlog moved to
  `docs/backlog.md`.
- `docs/refactor-21.3.0.md` — the completed 21.3.0 pre-public cleanup (architecture, token
  contract, API consistency). Kept as the record of why those decisions were made.
- `docs/iteration-8-plan.md` and `docs/iteration-9-plan.md` — both **completed for 21.3.0** and
  every row of their status tables is ✅. Iteration 8 is field chrome (icon insets, clear-button
  placement, float-label reserve), measured in a browser at `size="md"`; iteration 9 is the eight
  components added at once, with the shape chosen for each and the alternative that was rejected.
  Listed here because they were listed nowhere: a reader who found them had no way to tell they
  were finished.

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
goes stale, so update it as you go. `docs/lab-appearance-baseline.md` is its mechanical check —
one line per page recording preview geometry and text, captured before the refactor started, so a
converted page can be diffed against its own before-picture instead of eyeballed.

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
