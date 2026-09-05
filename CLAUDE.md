# gleks_web_ui — agent entry point

Angular v21 workspace holding the `@guildofgleks/ui` component library and two apps that
consume it.

| Project (CLI name) | Path                    | What it is                                                                    |
| ------------------ | ----------------------- | ----------------------------------------------------------------------------- |
| `@gleks/ui`        | `projects/gleks/ui`     | the library — published to npm as **`@guildofgleks/ui`**                      |
| `ui-showcase`      | `projects/ui-showcase`  | demo/validation app; **the only place to verify library changes live**        |
| `gleks-ui-lab`     | `projects/gleks-ui-lab` | public documentation site; tracks the **published** package, not local builds |

## Language: Russian in chat, English in the repo

**Talk to the user in Russian. Write everything that lands in the repository in English.**

This is not a style preference on either side — the two audiences are different people. The chat
has one reader, who works in Russian. The repository is a published npm package read by consumers
who never see this conversation, so **every byte committed stays English**: code, identifiers,
comments, commit messages, `CHANGELOG.md`, the `docs/` plans, the `.github/instructions/` files,
and the three documents that ship inside the package (`README.md`, `AGENTS.md`, `TOKENS.md`).
User-visible strings in `ui-showcase` are English too — it is the documentation the lab quotes.

So: explain in Russian what you are about to do, then write it in English. A Russian comment in a
`.ts` file or a Russian line in `CHANGELOG.md` is a bug, however the request was phrased.

**No Cyrillic anywhere in the repository — the tree was cleared of it on 2026-08-29** (28 files:
`theme.css`'s palette comments, test fixtures across nine components, JSDoc examples, the lab's
layout comments, `.gitignore`, the lab `Dockerfile`). To check:

```powershell
git ls-files | Where-Object { $_ -notmatch 'package-lock|\.(png|ico|jpg|svg)$' } |
  ForEach-Object { Select-String -Path $_ -Pattern '[Ѐ-ӿ]' }
```

Two things were _not_ solved by translating to English, and both should stay as they are:

- **`labels:` examples in `README.md`/`AGENTS.md` are German.** They illustrate "an app that isn't
  in English sets these once" — rendering that example in English would demonstrate nothing. Any
  non-English language works; it just must not be Cyrillic.
- **`date-utils.spec.ts` asserts on `monthNames('de-DE')`.** It is testing that month names follow
  the locale, so it needs a locale whose month names differ from English.

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
`gleks-ui-library.instructions.md`, definition of done, step 10.

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

**Latest release: 21.8.0 (2026-09-03), on npm and tagged.** `projects/gleks/ui/CHANGELOG.md` is the authority and
ships inside the package; its top entry is always the version being worked on.

### The release sequence

| Version    | State                     | What it must carry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21.6.0     | **released**              | seven fixes and `gog-table`'s `maxHeight`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 21.6.1     | **released (2026-08-26)** | `aria-busy` on `gog-table` and `gog-autocomplete` plus `check:loading-aria`, **`gog-card` + `gog-panel`** (`docs/panel-card.md`, **all four iterations** — iteration 4 converted all 40 showcase pages and retired the app's own `.card`, 2026-08-26), **and the ripple, complete** (`docs/ripple.md`, all four iterations: `gogRipple`, nine components wired, `GOG_CONFIG.ripple.enabled`, off by default). AGENTS.md, README.md, TOKENS.md and the CHANGELOG all carry it; `npm view @guildofgleks/ui version` confirms it on the registry.                                                                                                                                               |
| 21.7.0     | **released (2026-08-29)** | The three deprecated token prefixes removed (`--gog-btn-*`/`--gog-ms-*`/`--gog-confirm-*`), `GOG_DEPRECATIONS` now `[]`, and `check:deprecations` enforces the deadline for any future one. `docs/themes.md`'s whole library side: the character layer, `--gog-density` and the 14-step spacing scale, `check:contrast` (now a CI step, all 11 themes passing), and the preset catalogue completed to nine across five families — `slate`/`one-dark`/`one-light` gained a character, `ledger`/`material`/`primeng`/`terminal`/`bevel`/`parchment` added, plus opt-in webfont companions. `DialogService.open()`'s optional `TData` generic. The repository was also cleared of all Cyrillic. |
| 21.7.1     | **released (2026-08-29)** | All nine defects from the 21.6.1 hands-on pass (`docs/feedback-triage.md`) — `color-mix()` fallbacks behind `@supports` plus a `browserslist` stating the support floor (Chrome 111 / Firefox 113 / Safari 16.2 / Samsung Internet 22), `gog-select`'s chevron rotation, three surfaces given visual separation on dark themes (`gog-table` header, `gog-accordion` header/body, `elevated` card/panel vs. `outlined`), the toast countdown under reduced motion, and `gog-textarea`'s scrollbar matching `gog-scroll`.                                                                                                                                                                    |
| 21.7.2     | **released (2026-08-30)** | The multiselect `+N` overflow chip's baseline alignment (`docs/feedback-triage.md` Q3), fixed in the library and `ui-showcase`, with an "Overflow summary" showcase example so the bug has a live case. Q1 (`gog-menu` over the lab's footer) was investigated and closed in the same pass — not reproduced at desktop width against the published 21.7.1.                                                                                                                                                                                                                                                                                                                                 |
| 21.8.0     | **released (2026-09-03)** | `gog-button` forwards ARIA state and relationships — `ariaPressed`, `ariaExpanded`, `ariaControls`, `ariaHasPopup`, plus the exported `GogAriaHasPopup`. The component hides the real `<button>`, so a raw `[attr.aria-*]` lands on the roleless host and silently reaches nothing; `ariaLabel` had been the only input covering that. Also `GogGlobalConfig`'s own JSDoc, which under-reported the readers of four `GOG_CONFIG` keys — documentation only, every component already honoured the setting. |
| 21.9.0     | **released (2026-09-04)** | **A minor, not a patch — it carries four new public inputs.** `gog-button`/`[gogButton]` `severity` (orthogonal to `variant`), `gog-chip` `[(selected)]` (the filter chip), `gog-scroll` `horizontalWheel`, and `GOG_CONFIG.spinner.component`. Under that: the library's feedback story, made to degrade to something rather than to nothing — `:active` is a colour and not only a `transform`, so a press survives `prefers-reduced-motion`, and eight other pressable surfaces gained one. And three passes of colour and geometry work, each found by a check rather than by eye: `gogBadge`'s status labels failed WCAG AA in four themes (11 pairs, `material`'s amber at 1.97:1), fourteen lengths ignored `--gog-density` in the nine themes that set it, and the error line sat 2px lower under two of the eight controls that render one. `check:contrast` went from 143 pairs to **1155** across two new halves (`scripts/token-color.mjs`, then the severity and badge tables), `check-tokens` gained rule I and grew rule H from two families to six. |
| 21.9.1     | **released (2026-09-04)** | No library change. 21.9.0 was published from a working tree whose version bump had not been committed, so 21.9.1 re-publishes the same code with the history recorded — the two tarballs differ only by the changelog entry. Worth knowing for the trap rather than the fix: the root `package.json` moved to `^21.9.1` while `package-lock.json` still pinned 21.8.0, and `gleks-ui-lab` resolves the package out of `node_modules` on purpose, so it kept building against the old one until `npm install` ran. `npm ci` cannot rescue that — it exits on the mismatch rather than reconciling it. |
| 21.10.0    | **open, not released**    | `GOG_CONFIG.spinner.component` now reaches `gog-spinner-overlay`: the overlay forwards its own `variant` to the spinner it wraps, and that input defaulted to `'runic'`, which the spinner correctly read as an instance overruling the config — so the one component a consumer uses to cover a whole loading region was the only place a configured house spinner never appeared. `variant` is now `GogSpinnerVariant | undefined`, defaulting to unset. Plus `gog-table` named among the spinners the key reaches (documentation only; it always honoured it). `spinner-config.spec.ts` gains four cases — it had mounted only `gog-spinner` and `gog-button`, which is how 1112 green tests covered a key that missed a third of its targets. **Then `check:contrast` learned to see a variant** (`docs/backlog.md`'s last open defect): a variant class sets `--gog-<block>-variant-*` and paints nothing, so the sweep had been measuring the default variant of every component and reporting a healthy count — 1155 pairs became 2187, and five real AA failures came out of it, all fixed here: `gog-tag`'s label mixed toward literal black (11 of 55 combinations under AA), the table header's raw accent in two light themes, and `slate`'s secondary button at 2.77:1. **Renamed from 21.9.2 to a minor on 2026-09-05**, when `gog-progressbar` gained the two hairlines that mark where its fill ends — new tokens, so a minor rather than a patch. That one is the model for how a colour finding should go: 51 of 55 fill/track pairs were under 3:1, no track colour can fix it (measured across the whole axis, 21 points per theme), the evidence was a greyscale render rather than a ratio, and the note that had dismissed it for a day was wrong on two counts. The changelog heading reads `planned`; **the user cuts the release**, so `check:release` is red on purpose until then. |
| 22.x       | when Angular 22 lands     | the branch split — see `docs/branching-and-support.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**21.9.1 is on npm and is what `gleks-ui-lab` now resolves.** Its 28 changelog entries are all
21.9.0's; see the two rows above. **`docs/lab-after-publish.md`'s "After 21.9.0" section is
empty and deleted** (2026-09-05, all 13 items) — the release is documented and every check is
green. What is left in that file is one section for 21.9.2, which is
written but not released: documenting `GOG_CONFIG.spinner` found two library defects, **both now
fixed in the working tree** rather than filed. The lab still states the overlay exception in
three places, and that section lists them — they come out once 21.9.2 is on npm, not before. 21.8.0's three lab entries were closed the day it was published, which also let the lab's
header drop the workaround it had been carrying: both toggles now state themselves with
`aria-pressed`/`aria-expanded` instead of hiding the state in their accessible name.

**`docs/feedback-triage.md`'s LAB table is fully closed** (2026-09-02); what is left in that file
is its **21.8.0 section — now two items, not five**: the button's pressed state, its `severity` and
`gog-scroll`'s horizontal wheel all shipped in 21.9.0, leaving input masking (which needs a
written plan first) and the whole-row click. The heading is misnamed either way — 21.8.0 shipped with none of them, so read it as
the next-minor list rather than as a version's payload, the same way a plan's filename with a
version in it becomes a lie.

**Read `docs/backlog.md`'s Defects and Gaps sections before anything new** — the project's own
rule is fixes and polish first. **Defects is empty as of 2026-09-03**, having emptied twice that
day: the two entries it opened with shipped in 21.8.0, and the three filed while building 21.9.0
(nine surfaces with no press feedback, a disabled dropdown option answering the pointer, a ghost
button's hover label under AA) were all closed in it. Gaps is not empty, and its first entry is the sibling of what 21.8.0 just
fixed: `gog-chip` has no `selected`, and the file explains why forwarding `aria-pressed` there
would be the wrong fix rather than the same one.

**`themes.md` is done except one scope decision.** Iterations 1, 2, 3, 5 and 6 are ✅, and so is
4b; iteration 4 is partial only because five theme slots across three families are unbuilt, which
is a choice rather than a blocker. The four "partial" verdicts that file carried until 2026-09-02
were all the same thing — a lab-side half that could not land before 21.7.0 was published — and
all four are closed. Its per-iteration "as it finished" sections still open by describing that
blockage; the closing note under iteration 5 says which commit closed which half.

### Cutting a release — why an agent does none of it

`npm run check:release` fails whenever `projects/gleks/ui/package.json`'s version doesn't match
the changelog's top `[x.y.z]` entry, or that heading still reads `planned` instead of a date.
Bumping the version and dating the heading _are_ cutting the release, which is rule 1's territory:
**the user cuts every release.** Do not "fix" the check by doing either — a clean `check:release`
on a version still being worked on means someone jumped the gun, not that the check is wrong.

Once a release is published: `npm install` at the repo root, then work through
`docs/lab-after-publish.md`'s section for that version. That file is a live checklist; delete
each entry as it lands. **It holds no 21.9.0 items as of 2026-09-05 — one section remains, deferred to whichever release fixes the spinner overlay**; it was empty on 2026-09-03 — every section is checked off and
deleted, which is the state it is supposed to return to after each release is documented. The
bundle-bench re-measurement that was the last item is done (all three libraries re-measured, not
just this one); its history lives in `projects/gleks-ui-lab/public/docs/compare-full.md` rather
than as a checklist entry.

**A future plan's filename carries no version** — `panel-card.md` and `ripple.md`
were both named for a release that shipped without them, which is what that always becomes. A
_completed_ plan keeps its version, because there it is a fact. Each future plan states its target
in its own first paragraph, where it can be changed.

**`docs/next-session.md` is the handoff from the last session, when there is one.** It says where
to start and why, never what the durable lists already say, and it is deleted once its contents
are done or moved.

## What to work on

**`docs/backlog.md` is the live list** — everything known to be worth doing and not yet done, in
one file. Read it before proposing anything. It replaced two separate backlog sections buried in
completed plan documents, one of which had been carrying an item that shipped two minors earlier
without anyone noticing.

**The order it comes off the list is fixed: fixes and polish of what already ships, before
anything new.** A defect is something a consumer is hitting today; an unbuilt component is only
an absence. **As of 2026-09-02 the defects section holds one entry and the Gaps section opens
with another**, both found by doing lab work rather than by looking for them, and both wanting a
library session: `shared/config.ts`'s `GogGlobalConfig` JSDoc names too few components on four of
its keys (JSDoc-only, no behaviour change), and `gog-button` exposes `ariaLabel` and no other ARIA
input, so a toggle or disclosure button silently ships without a state assistive tech can read.

The section was empty before that, and how it got empty is the part worth keeping: three defects
found while planning 21.7.0 (a `var(--gog-…)` with no fallback naming a property nothing declares,
which silently drops the whole declaration) were fixed and closed the same day, as iteration 0 of
`docs/token-prefix-removal.md`, ahead of the removal itself — the removal's mechanical rule would
otherwise have copied one of them forward verbatim. That iteration also added a permanent check
for the family (`check-tokens.mjs` rule F), so the next instance fails a build instead of waiting
a month, and see `docs/backlog.md` for the fourth, related defect it was found alongside.

A plan is not a backlog item — it is a decision already taken about how something gets built.
Update the status table in whichever you are working from, as you go.

- `docs/component-geometry.md` — **the ruleset for computed geometry, and the sweep that applies
  it**, targeting the first minor after 21.10.0. It extends `styling.instructions.md`'s five laws
  with seven more and rules on each: optical area, optical centroid and the two-light elevation
  scale are adopted, measure and fluid `clamp()` are adopted narrowed, and Hick and Fitts are
  rejected as library rules and kept as documentation — because a library cannot check what the
  consumer owns. **Nothing starts until 21.10.0 is released**, the check is written before the
  components are touched, and the sweep is one branch with one commit per component (33 of them).
  Its Part 2 is the part to read first: nine decisions (D0–D8) that no script can settle and that
  would otherwise be settled thirty-three times over.

- `docs/feedback-triage.md` — **30 items from a hands-on pass over the published 21.6.1**, sorted
  by which release can carry each and why, with four of the reported symptoms traced to a
  different cause than the report assumed. Read it before picking up any of that feedback. **Its
  21.7.1 and LAB tables are closed** (2026-08-29 and 2026-09-02); the live part is its **21.8.0
  section** — `gog-button` severity, `gog-button` pressed state, input masking, horizontal wheel
  handling in `gog-scroll`, whole-row click on `gog-table`. Each is new public API and the file
  says why each needs a decision before code; the mask needs a written plan first. Its closing
  section, "the theme running under all of it", argues that four of those are one observation —
  the library's feedback story is opt-in and degrades to nothing rather than to something — and
  is the better starting point than the table. `docs/release-21.7.0.md` is gone: 21.7.0 shipped
  on 2026-08-29 and a close-out checklist that outlives its release is the trap
  `lab-after-publish.md` warns about.

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
  instead of palettes, then a catalogue across eras. **The library-side work across all five
  iterations is done, 2026-08-29** — iteration 1 built the character layer (4 new foundation
  tokens, 40 component tokens converted, `check-tokens.mjs` rule G to catch future drift by
  value, not just category); iteration 2 built `npm run check:contrast` and corrected one of the
  plan's own pairs along the way (`--gog-border-color` is decorative in this library, not the
  WCAG-1.4.11 boundary token — `--gog-accent-dim` is); iteration 3 shipped `material.css`/
  `primeng.css` as real presets, fixing a six-component casing inconsistency the lab's
  hand-authored originals had missed; iteration 4 shipped `ledger` (one theme of six, scoped
  down deliberately — renamed from the plan's own working name `classic` once that turned out to
  collide with `ui-showcase`'s existing "Classic" label for `data-theme="light"`); iteration 5
  amended `styling.instructions.md`'s theming rule to name the character layer. **Iterations 2
  through 5 each carried a `gleks-ui-lab` half — compare-page entries, the theme generator, the
  Theming page, `theme-starter.css` — that could not land before 21.7.0 was published. All of it
  landed between 2026-08-31 and 2026-09-02, and the plan's status table now reads ✅ for 1, 2, 3,
  5, 6 and 4b.** Only iteration 4 is still partial, and not for that reason: five theme slots
  across three families are unbuilt, which is a scope decision. Real WCAG findings (three themes'
  muted text, three themes' button label text) were filed in `docs/backlog.md` rather than
  silently fixed, per the plan's own instruction that finding and fixing colour are separate
  decisions — all nine are now fixed and `check:contrast` is a CI step. **Read the plan's status
  table over its per-iteration prose**: the _"as it finished"_ sections were written while the lab
  work was still blocked and still open by describing that blockage, with a dated closing note
  under iteration 5 saying which commit closed which half. They remain the place to go for the
  full audit tables, numbers and verification record — not duplicated here.
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
