# @guildofgleks/ui — 21.5.0 hardening plan

Derived from the **all-components audit of 2026-08-14** — the library measured against itself
across four axes (tests, styles, customization, functionality) rather than from a consumer's
first-run experience. `consumer-dx-plan.md` closed the gaps a newcomer trips over; this closes the
ones a *maintainer* can only see by counting.

Ordered by cost/benefit, except item 3, whose timing is not negotiable — see below.

## Why 21.5.0 specifically

**The version already has obligations.** Fourteen public symbols carry
`@deprecated … Removed in 21.5.0`, promised back in 21.3.0, plus the `src/styles/` asset path
scheduled in 21.3.2. A minor that skips its own removals turns the deprecation ratchet into
decoration — `api-design.instructions.md` says removal happens "on schedule, not when someone
gets round to it", and 21.5.0 is that schedule.

It has already slipped once: `GogSelectOption` and `GogMultiselectOption` were marked
`Removed in 21.4.0`, and 21.4.0 is tagged with both still exported. That is the argument for
iteration 3 step 4 — a check, not a reminder.

That makes 21.5.0 a natural breaking-ish minor (pre-1.0, allowed), which is also the right home
for the token-prefix rename — the one item here that consumers can notice.

## Baseline measured on 2026-08-14, re-verified 2026-08-15

| | | |
| --- | --- | --- |
| | 2026-08-14 | 2026-08-15 |
| Components | 29 folders — 27 components + `gogBadge`/`gogTooltip`, 33 element selectors | unchanged |
| Tests | 897 across 47 files; **every** component folder has a spec | **904 across 48 files** |
| Line coverage | **unknown** — `@vitest/coverage-v8` is not installed, `ng test --coverage` refuses to run | still unknown — iteration 1 |
| Tokens | 1239 in `theme.css`, 38 stylesheets under `check:tokens` | unchanged |
| Token prefix breaches | 179 (`--gog-ms-*` 75, `--gog-btn-*` 66, `--gog-input-*` 38) | unchanged; `--gog-confirm-*` is 7 more |
| Deprecations owed | 14 tagged `Removed in 21.5.0`, 2 overdue from 21.4.0 | unchanged — none removed yet |
| Slots | 15 slot directives; `GOG_CONFIG` has 13 keys | unchanged |
| RTL | 63 physical `left`/`right` declarations across 13 components; 12 components use logical properties | unchanged |
| Reduced motion | honoured in 21 components plus the global stylesheets | unchanged |

The test count moved because the library kept receiving fixes after the audit; nothing else did,
which is the expected shape for a plan that has not started.

## Status

| # | Iteration | Kind | State |
| --- | --- | --- | --- |
| 1 | Coverage measurement + CI gate | tooling | ✅ done 2026-08-19 — baseline below |
| 2 | Token prefix consistency (179 tokens) | api | ⬜ todo |
| 3 | The scheduled removals + a check that enforces them | api | 🟨 steps 3–4 done 2026-08-19 — the overdue pair and the ratchet check; steps 1–2, 5–6 open |
| 4 | RTL pass | fix | ⬜ todo |
| 5 | Test depth where the audit found it thin | tests | ⬜ todo |
| 6 | `gog-menu` | feature | ⬜ todo |
| 7 | Version/deprecation metadata for the docs site | tooling | 🟨 step 1 done — see below |

Update this table at the end of every iteration, and re-state "done / remaining" in the turn
summary. Per `gleks-ui-library.instructions.md` rule 11 the agent never publishes, never bumps
the version, and never dates `CHANGELOG.md`'s heading.

**Iteration 7 is half-landed already**, ahead of the plan being started: `CHANGELOG.md` is in
`ng-package.json`'s `assets` and `dist/gleks/ui/CHANGELOG.md` is produced by `npm run build:lib`
(verified 2026-08-15), with the entry written under `## [21.5.0] - planned`. That is step 1. Steps
2–3 — the deprecation manifest and its `--check` — are still open, and are the ones iteration 3
step 4 and `lab-versioning.md` layer 4 both wait on.

---

## Pre-iteration readiness check — 2026-08-15

Run before starting iteration 1, to establish that what the plan measures against is actually
green. **It is, with one tooling fix applied.**

| Check | Result |
| --- | --- |
| `npm run lint` | ✅ both projects clean |
| `npm run format:check` | ✅ clean |
| `npm run check:tokens` | ✅ *after the fix below* — it was failing on every Windows checkout |
| `npm run test:lib` | ✅ 904 passed / 48 files |
| `npm run build:lib` | ✅ 4.6 s; package contains `README.md`, `AGENTS.md`, `TOKENS.md`, `CHANGELOG.md`, `styles/`, `src/styles/` |
| `npm run build:showcase` | ✅ (pre-existing initial-bundle budget warning, showcase only) |
| `npm run build:lab` | ✅ 21.4.1 from npm still builds — the lab is not ahead of the registry |
| working tree | ✅ clean before this check; `node_modules/@guildofgleks/ui` is the real 21.4.1, not a local-build swap |

**The one fix: `scripts/generate-tokens.mjs --check` compared raw bytes.** `.prettierrc` sets
`endOfLine: "auto"`, so `TOKENS.md` (read from disk) keeps its CRLF while `token-names.ts`
(rendered from a string) is always LF. With `core.autocrlf` on and no `.gitattributes`, every
Windows checkout therefore reported `token-names.ts` as out of date, and `npm run generate:tokens`
"fixed" it by rewriting the same content with different line endings — a failure that could not be
acted on and that trains the reader to ignore the check. The comparison now normalises line
endings, and the writer keeps the file's existing ones so the generator no longer dirties the
working tree. This mattered *before* iteration 1 rather than during it: iteration 1 adds a second
generated-artifact gate to CI, and a gate nobody trusts locally is worse than no gate.

Everything else the plan needs is a plan item, not a prerequisite. **The remaining blocker is not
technical:** iterations stay on hold until the user finishes verifying the tagged releases against
the private consuming project and publishes, because iteration 7's lab-side half and the whole of
`lab-after-publish.md` only unlock on a publish.

---

## Iteration 1 — Coverage measurement, then a CI gate

**Why first:** every other item in this plan is a judgement about test quality, and right now
nobody can check one. 897 tests is a count, not a coverage figure: it says nothing about which
branches are unvisited. Getting the number first also means iteration 5 aims at real gaps instead
of at my eyeballing.

1. Add `@vitest/coverage-v8` as a **devDependency** — workspace-only, nothing reaches the
   published package.
2. Add `npm run test:lib:coverage` and check the output is sane (the Angular unit-test builder
   passes `--coverage` through to Vitest).
3. **Read the report before setting any threshold.** Set the floor slightly under whatever the
   current numbers are, per metric, so CI locks in today's level and ratchets from there. A
   threshold picked from a blog post either fails on day one or never fires.
4. Add the coverage run to `.github/workflows/ci.yml` after `test:lib`, and record the starting
   numbers in this file so the next reader knows what the floor means.
5. Exclude what should not count: `*.spec.ts`, `public-api.ts`, generated `token-names.ts`.

**Done when:** `npm run test:lib:coverage` prints per-file numbers, CI fails on a deliberate drop,
and the baseline is written down here.

### Outcome — 2026-08-19

Done. `@vitest/coverage-v8` is a devDependency, `npm run test:lib:coverage` runs the suite through
the `coverage` configuration added to `@gleks/ui`'s `test` target in `angular.json`, and CI runs it
as its own step after `Test @gleks/ui` — separate on purpose, so a red build reads as "coverage
dropped" rather than "tests broke".

**The baseline, measured on 905 tests across 48 files:**

| Metric | Measured | Threshold set |
| --- | --- | --- |
| Statements | 93.02% (3470/3730) | 92% |
| Branches | 90.34% (2564/2838) | 89% |
| Functions | 92.93% (829/892) | 92% |
| Lines | 95.14% (2899/3047) | 94% |

The floors sit ~1 point under today's numbers: close enough to catch a real regression, loose
enough that a single refactor moving a few uncovered lines doesn't fail a build nobody broke. They
are a ratchet — **raise them after iteration 5**, don't leave them at 21.5.0's level forever.

What counts: all 63 non-spec `.ts` files under `projects/gleks/ui/src`, which is every source file
except the two excluded by name (`public-api.ts`, generated `token-names.ts`). Verified by diffing
the `SF:` entries in `coverage/@gleks/ui/lcov.info` against the file list — nothing from the
showcase, the lab or `node_modules` leaks in, so the percentages are the library's own. Reporters
are `text` (the per-file table) and `lcovonly` (for any future upload); `coverage/` is already
gitignored.

The gate was verified by raising every threshold to 99% and confirming the run exits 1 with four
`ERROR: Coverage for … does not meet global threshold` lines, then restoring it.

---

## Iteration 2 — Token prefix consistency

**Why:** `api-design.instructions.md` states the rule outright — "block token prefix spelled out,
not abbreviated (`--gog-multiselect-*`, not `--gog-ms-*`)" — and **179 tokens break it**:

| Prefix | Tokens | Component |
| --- | --- | --- |
| `--gog-ms-*` | 75 | `gog-multiselect` |
| `--gog-btn-*` | 66 | `gog-button` |
| `--gog-input-*` | 38 | `gog-inputfield` |

This is the most-used customization surface in the library, and it fails the guess a consumer
makes first. Someone writing `--gog-button-bg` or `--gog-multiselect-bg` gets no effect and no
error — a CSS custom property that nothing reads is silent by design.

1. **Add the spelled-out names as the declared ones** and keep the short ones as aliases that read
   from them (`--gog-btn-bg: var(--gog-button-bg)`), so existing overrides keep working. Additive
   in both directions.
2. Mark the short forms deprecated in `CHANGELOG.md` with a removal version — **21.7.0**, two
   minors, since unlike a TypeScript symbol a stale CSS override fails silently and deserves the
   longer window.
3. **Teach `check-tokens.mjs` the naming rule** so it cannot regress: fail on a new `--gog-<x>-*`
   whose `<x>` is not a component/block name. Without this the rule stays a comment that the next
   token ignores.
4. Regenerate `TOKENS.md` / `token-names.ts`; both are generated, so this is a script run.
5. `--gog-confirm-*` (`gog-confirmation-dialog`) is the fourth case — decide whether it is an
   abbreviation or a legitimately separate block, and write the answer down either way.

**Done when:** both spellings work, `check:tokens` rejects a newly-added abbreviation, and
`TOKENS.md` lists the long names as primary.

---

## Iteration 3 — The removals 21.5.0 already promised

**Why now and not later:** these are dated promises with a version attached. Slipping them
silently is how a deprecation list becomes permanent API.

Fourteen `@deprecated … Removed in 21.5.0` tags, plus two that are **already overdue** — see
step 3. By file:

| Where | What goes |
| --- | --- |
| `inputfield.component.ts` (6) | `iconStartTemplate`, `iconEndTemplate`, `iconStartFn`, `iconEndFn`, `iconStartLabel`, `iconEndLabel` → projected `gogInputAddonStart`/`End` |
| `table/column.ts` (3) | `<column>` selector, `Column` const, `Column` type → `gog-column` / `GogColumn` |
| `table/template.directive.ts` (1) | the string-keyed `[template]` slot → `gogColumnBody` / `gogColumnHeader` |
| `checkbox.component.ts` (1) | `checkIconTemplate` → `gogCheckboxIcon` |
| `multiselect.component.ts` (1) | `clearIconTemplate` → `gogMultiselectClearIcon` |
| `tag.component.ts` (1) | `iconTemplate` → `gogTagIcon` |
| `dropdown-base.ts` (1) | `chevronTemplate` → `gogDropdownChevron` |

Plus, from 21.3.2: **the `src/styles/` asset copy** in `ng-package.json` — `styles/` has been the
documented path since then.

1. Run `grep -rn "@deprecated since" projects/gleks/ui/src` first and delete by the list it
   prints, not from this table — the source is the truth.
2. Remove the deprecated members, their template branches, and the specs that pin them. Several
   `@if (addonEnd())` chains in `inputfield.component.html` simplify substantially once the
   legacy icon inputs are gone; that simplification is the point, not a side effect.
3. **`GogSelectOption` / `GogMultiselectOption` were due in 21.4.0 and are still there.** Both
   still carry `@deprecated since 21.2.2 (2026-07-30) … Removed in 21.4.0`, and 21.4.0 is already
   tagged. The ratchet has slipped once — take them here, and note in the changelog that they
   overran by a minor rather than pretending 21.5.0 was always the date.
4. **Make the ratchet mechanical.** A script (`scripts/check-deprecations.mjs`, wired into
   `npm run check:tokens`'s slot in CI) that parses every `@deprecated … Removed in <version>` tag
   and fails when a removal version is at or below `package.json`'s current version. The tag format
   is already strict enough to parse — 14 instances do so cleanly — and it is the only thing that
   turns "removal happens on schedule" from an intention into a build failure. Without it this
   iteration will be needed again.
5. List every removal under `### Removed` with a one-line migration note.
6. `ui-showcase` uses some of these (the icon-action examples) — migrate those to the projected
   form in the same change.

**Done when:** `grep -rn "Removed in 21"` returns nothing at or below the current version, the new
check fails on a deliberately overdue tag, the suite passes, and the showcase demonstrates only
non-deprecated shapes.

### Partial outcome — 2026-08-19: steps 3 and 4

**Steps 1, 2, 5 and 6 are still open** — the fourteen `Removed in 21.5.0` symbols are untouched.
What landed is the pair that was already overdue, and the check that makes the next slip impossible.

- **Step 3 — the overdue pair is gone.** `GogSelectOption` and `GogMultiselectOption` (aliases of
  `GogDropdownOption` since 21.2.2, tagged for removal in 21.4.0, still exported through 21.4.4)
  are deleted from `select.component.ts` and `multiselect.component.ts`. `ui-showcase` used them in
  six pages and now names `GogDropdownOption` directly; `AGENTS.md`'s deprecation table loses the
  row; `CHANGELOG.md`'s `### Removed` records the removal *and* the overrun, rather than re-dating
  it quietly.
- **Step 4 — `scripts/check-deprecations.mjs`**, wired as `npm run check:deprecations` and as its
  own CI step next to `check:tokens`. Two rules: every `@deprecated` tag parses into all four
  required parts (since-version, `(YYYY-MM-DD)`, replacement, `Removed in <version>.`), and no tag
  may name a removal version at or below `projects/gleks/ui/package.json`'s current version. It
  reads the tag across line wraps and handles the one tag that lives in a `//` comment inside
  `column.ts`'s decorator, so all 16 tags parsed on the first run — the two overdue ones were the
  only failures.

  Verified negatively as well as positively: a tag edited to `Removed in 21.4.4`, one with the
  removal sentence deleted, and one with the date removed each fail with the expected category.
  Current output: `14 tag(s) in 113 source file(s), library at 21.4.4. Due: 21.5.0 (14)`.

**This check fires the moment the version is bumped.** At 21.4.4 the fourteen remaining tags are
fine; the first commit that sets `package.json` to 21.5.0 makes CI red until steps 1–2 and 5–6 are
done. That is the intended shape — the removals now block the release instead of being remembered
during it — but it is worth knowing before the bump rather than after.

What it cannot see: a removal promised in prose (the `./src/styles/*` export, promised in the
README for 21.5.0) has no tag to grep. Step 2's list is still the source for those.

---

## Iteration 4 — RTL

**Why:** this is the only item in the plan that is a *break*, not a shortfall. 63 physical
`left`/`right`/`margin-left`-style declarations across 13 components, concentrated exactly where
it shows worst:

| Component | Physical properties |
| --- | --- |
| `slider` | 11 |
| `multiselect` | 7 |
| `scroll` | 7 |
| `toast` | 7 |
| `select` | 6 |
| `tooltip` | 5 |
| `inputfield` | 4 |
| chip / textarea / checkbox / radio-group / table / `lib/styles` | 1–2 each |

The overlay components are the problem: `dropdown-position.ts` and `tooltip-position.ts` compute
placement in JavaScript with no notion of writing direction, so in an RTL layout a dropdown or
tooltip opens on the wrong side and a toast anchors to the wrong corner. The package advertises
"accessible by default", which readers hear as covering this.

1. Decide and state the scope: **is RTL supported or not?** Either answer is fine, but the README
   must say which. Half-support is the worst outcome.
2. If supported: swap physical for logical properties component by component, largest count
   first. Most are mechanical (`left:` → `inset-inline-start:`).
3. Teach `resolveDropdownPlacement` / `resolveTooltipPlacement` about direction — read
   `getComputedStyle(el).direction` once per open, and mirror the horizontal preference. The
   existing specs for both are pure functions, so this is testable without a browser.
4. `gog-toast`'s four corner positions and `gog-paginator`'s new page-size margin need the same
   treatment.
5. Verify in `ui-showcase` under `dir="rtl"` on `<html>` — add a toggle to the theme switcher row,
   since a one-off manual check will not survive the next change.

**Done when:** every component renders correctly with `dir="rtl"`, the two placement resolvers
have RTL specs, and the README states the support level.

---

## Iteration 5 — Test depth where the audit found it thin

**Why after iteration 1:** with real coverage numbers this becomes a list of uncovered branches
instead of a list of my suspicions. The audit's candidates, by `aria`+keyboard assertions in the
spec against public surface:

| Component | Tests | Surface | Note |
| --- | --- | --- | --- |
| `tag` | 9 | 6 inputs + 1 slot | 1 aria assertion; variants/shape/icon slot barely pinned |
| `divider` | 8 | 3 inputs | thin, but genuinely simple |
| `chip` | 14 | 11 inputs + 2 outputs | removable/clickable states, 1 aria assertion |
| `toast` | 14 | timers, hover-pause, dedupe, stacking | the most behaviour per test in the library |
| `dialog` | 15 | focus trap covered | **0** aria assertions — `role`, `aria-modal`, `aria-labelledby` unpinned |
| `toggle` | 17 | a switch | 3 aria, 0 keyboard |
| `scroll` | 23 | 9 inputs + 3 outputs | 0 keyboard, 3 aria |

Two things the audit checked and **cleared** — do not "fix" them:

- `radio-group` has 0 keyboard tests and that is correct: it renders native
  `<input type="radio">` sharing a `name`, so arrow-key navigation is the browser's. Its
  `role="radiogroup"` and aria wiring are implemented; only the *test* is missing.
- `select`/`multiselect` do implement `ControlValueAccessor` — in `GogDropdownBase`, which is why
  a per-folder scan misses it.

**Done when:** coverage clears the threshold set in iteration 1 with the gate on, and `dialog`'s
ARIA contract in particular is pinned by a test.

---

## Iteration 6 — `gog-menu`

**Why this one out of the missing components:** the library created the hole itself. 21.4.0 added
`more-horizontal`/`more-vertical` icons and a table built for row actions, and there is nothing to
open with them. Every other absent component (below) can be assembled by a consumer from what
exists; an accessible menu cannot — it needs focus management, roving focus, type-ahead and
overlay positioning, all four of which already exist in this library as reusable pieces
(`roving-focus.ts`, `GogDropdownOverlay`, `dropdown-position.ts`).

Design notes before code:
- Trigger as a **directive on the consumer's own button** (`gogMenuTrigger`), matching the
  `[gogButton]` decision — a menu button is frequently an icon button the consumer already styled.
- `role="menu"` / `menuitem`, Escape to close and restore focus, arrow keys via `roving-focus.ts`.
- Items as projected content, not an options array: a menu item is markup (icon + label +
  shortcut hint), which `api-design.instructions.md` puts on the slot axis, not the input axis.
- Reuse `GogDropdownOverlay` so `appendToBody` and the z-index stacking behave like the dropdowns.

**Done when:** a table row's `more-vertical` button opens a keyboard-navigable menu in the
showcase, and Escape returns focus to the trigger.

---

## Iteration 7 — Version metadata for the docs site

**Why:** `gleks-ui-lab` tracks the published package, and a reader's first question is "is this
available on the version I have?" — with "what will break when I upgrade?" close behind. Both
answers already exist in the source, in machine-readable form; nothing needs authoring, only
extracting. See "Showing version-to-version change in the lab" below for the shape.

1. **Ship `CHANGELOG.md` in the package.** One entry in `ng-package.json`'s `assets`. Today it
   stays in the repo, so the lab cannot read the changelog of the version it documents; with it
   shipped, the lab renders the *installed* version's changelog and cannot drift.
2. **Generate deprecation metadata.** The `@deprecated since <version> (<date>) — <replacement>.
   Removed in <version>.` format is already strict and greppable — 14 instances parse cleanly.
   Emit a JSON (or a typed const, like `token-names.ts`) listing symbol, since, replacement and
   removal version, and ship it. This is what lets the lab put a "deprecated, removed in 21.7.0"
   badge on an API row without anyone maintaining a second list.
3. Extend `scripts/` for both, following `generate-tokens.mjs`: generated artifacts, checked in
   CI so they cannot go stale.

**Done when:** the built package contains `CHANGELOG.md` and the deprecation manifest, and
`npm run check:tokens`-style verification covers the new generated file.

---

## Showing version-to-version change in the lab

Moved to its own document: **[`lab-versioning.md`](./lab-versioning.md)** — the four-layer
recommendation (version badge, a `Releases` page rendering the package's own changelog, `since`
markers on API rows, generated deprecation badges), what not to do for patch releases, and how the
major-version branch/subdomain plan fits the existing deploy workflow.

Only the **library-side enablers** belong to this plan, and they are iteration 7 above: shipping
`CHANGELOG.md` in the package, and generating the deprecation manifest. Everything the lab does
with them is deferred until the release that carries them, per
`agent-workflow.instructions.md`.

---

## Release-process check, unrelated to the plan

Tags `21.3.1`, `21.3.2` and `21.4.0` exist ahead of their releases on purpose: each version is
verified against a private consuming project before it is published, so the tag lands first and
the version bump happens at publish time. Raised and answered on 2026-08-14 — **not a defect**,
and the staggered chain is a one-off for this batch. Recorded here only so the next reader does
not re-file it.

---

## Backlog — deliberately not in 21.5.0

- **Missing components**, in rough order of how often a real site wants them: `alert`/`banner` (a
  persistent in-flow message — `gog-toast` is transient and cannot serve this), `avatar`,
  `breadcrumbs`, `stepper`, `file upload`, `rating`, `empty state`, `card`. Each is additive and
  independent; none blocks anything else. `gog-menu` is pulled forward into iteration 6 only
  because the library already ships the icons for it.
- **Virtualization.** Nothing in the library virtualizes: a 10 000-option `gog-select` and a
  10 000-row eager `gog-table` will both crawl. `gog-autocomplete`'s `gogLoadMore` covers the
  fetch half of the problem; `lazy` covers it for the table. The DOM half needs a windowing
  primitive, which is a genuine piece of engineering and its own plan.
- **`gog-table`'s ceiling:** no column resize or reorder, no sticky columns, no expandable rows,
  no grouping. Possibly the right boundary for a lightweight library — but state it in the README
  rather than letting someone discover it mid-project.
- **Incidental public exports.** `public-api.ts` re-exports two helper modules wholesale
  (`export * from './lib/components/datepicker/date-utils'` and `'./lib/shared/option-accessor'`),
  which puts ~20 free functions in the package's `.d.ts` — `buildMonthGrid`, `clampDate`,
  `withTime`, `getByPath`, `readOption`, `isSameOptionValue`, `defaultCompare`, … Some are
  deliberate (`AGENTS.md` advertises `formatDate`/`parseDate` and "a family of date-math helpers");
  the rest are along for the ride because the module also exports a type the public API needs
  (`GogDateRange`, `GogOptionAccessor`). Counted 2026-08-15. Nothing is broken by it, but every one
  is API someone can depend on and nobody decided to support, so the fix is a named export list —
  which is a breaking change and therefore needs its own deprecation window, not a slot in 21.5.0.
- **Secondary entry points** (`@guildofgleks/ui/select`, …). Raised by the paginator's dependency
  on `gog-select`: ng-packagr flattens everything into one FESM, so `@defer` inside the library
  produces no code-split (measured — see `consumer-dx-plan.md` iteration 6's follow-ups). Entry
  points are the only real fix, and they change every consumer's import paths, so they need their
  own deprecation cycle and their own decision.
- **The `position: fixed` containing-block caveat, documented once.** Every fixed overlay the
  library renders — `gog-spinner [overlay]`, `gog-dialog`'s backdrop, `gog-toast-container` — is
  positioned against the viewport *only if no ancestor establishes a containing block*. A
  `contain`, `transform`, `filter` or `backdrop-filter` anywhere above it silently retargets the
  overlay to that ancestor's box. This is not hypothetical for this library specifically:
  `gog-scroll` sets `contain: layout style`, so a dialog opened from inside one covers the
  scroller rather than the window. The lab hit it twice (the dialog and toast outlets had to be
  hoisted to the app root; the spinner's "full-screen" demo covers the article, and now says so).
  Consumers will hit it wherever they nest an overlay inside their own transformed or contained
  wrapper. Worth one shared paragraph in `README.md`/`AGENTS.md` plus a line on each overlay
  input's TSDoc — a documentation change, which is why it is here rather than in an iteration.
- **`gogCollapsibleTrigger` is silently keyboard-inaccessible on a non-focusable element.** The
  directive's whole host block is `class`, three ARIA attributes and `(click)` — no `tabindex`, no
  `role`, no key handling. Put it on a `<div>` (which its own TSDoc invites: "works on any
  clickable element") and the trigger has no tab stop and does not respond to Enter or Space,
  while still announcing `aria-expanded`/`aria-controls` — so it reads as an interactive control
  to a screen reader and is unreachable by the keyboard that reader is using. The lab's
  "Custom trigger element" example did exactly this until 2026-08-15. Two possible fixes: make
  the directive add `tabindex="0"`, `role="button"` and Enter/Space handling when the host is not
  natively focusable, or narrow the TSDoc to "must be a natively focusable element" and say so in
  `AGENTS.md`. The first is the kinder default and is not a breaking change; either way it is a
  library change, which is why it is recorded here.
- **`gog-table`'s `stickyHeader` does not stick — the component overrides itself.** `stickyHeader`
  sets `position: sticky; top: 0` on the header cells, which is correct, but a sticky element
  resolves against its *nearest* scrolling ancestor, and `gog-table` wraps its own markup in
  `<gog-scroll class="gog-table-scroll">`. On a table that fits, that viewport computes to
  `overflow: visible` and is harmless; but as soon as it activates — which is precisely what putting
  a wide table in a narrow region does — it becomes the nearest scrollport and wins over whatever
  region the consumer put the table in — and because it is sized by the table's own content, it
  never scrolls vertically, so the header simply rides up out of view. Measured on the lab against
  21.4.2 on 2026-08-15: with the table in a 260px scrolling wrapper,
  `th.closest('.gog-scroll__viewport')` is the table's internal one, and the header leaves the
  viewport at `scrollTop: 200`; neutralising that inner viewport (`overflow: visible`) makes the
  header stick correctly to the outer region. No consumer-side arrangement fixes it — capping the
  `gog-table` host, or the inner `gog-scroll` host, leaves the inner viewport at full content
  height either way. The likely fix is to make the internal scroller horizontal-only
  (`overflow-y: visible`) so it stops being a vertical scrollport, with a regression test that
  asserts the sticky header's scrollport is *not* the table's own. The lab's "Sticky header" demo
  currently documents the defect in its description; delete that paragraph in the release that
  fixes it (recorded in `lab-after-publish.md`).
- **`[fullWidth]="false"` clips the widest column's header.** The table is `table-layout: fixed`
  and the host switches to `width: fit-content`, so the columns split that width evenly instead of
  being measured against their content — a 195px two-column table gives each column 96px while
  "Component" needs 100px, and `overflow: hidden` cuts the glyph. Measured on 2026-08-15; setting
  `table-layout: auto` on the same table redistributes to 115px/78px and nothing clips. Fix is
  probably exactly that: `table-layout: auto` whenever `fullWidth` is false, since fixed layout
  only buys anything when the table's width is externally determined. The lab's "Full width"
  example now states column widths explicitly and explains why, which works but should not be
  necessary.
- **The library's fields need the consumer's `box-sizing` reset to size correctly.**
  `.gog-input__field` (shared by `gog-inputfield` and `gog-textarea`) is `width: 100%` plus
  horizontal padding plus a border, and the package sets `box-sizing: border-box` on exactly one
  selector — `.gog-badge`, in `styles/utilities.css`. Under the default `content-box` the field
  therefore overflows its own container by padding + border: measured 20px at `xsm` rising to 48px
  at `slg` on 2026-08-15. Two consequences, both real: the field spills out of whatever column the
  consumer put it in, and `gog-textarea`'s resize grip — which is drawn on the *container*, 3px in
  from its right edge — ends up ~50px inside the field's actual corner and reads as broken. The
  `resizeInsetRight/Bottom` tracking is defeated too, since `container.clientWidth - el.offsetWidth`
  goes negative and clamps to 0.

  This stayed invisible for the whole life of the package because `ui-showcase` — the only place
  library changes are verified — has carried `* { box-sizing: border-box }` since the start, while
  `gleks-ui-lab` did not. The lab now has the same reset (its `styles.scss` says why), so the docs
  site is correct again; but relying on the consumer's reset is not a property a component library
  should have. The fix is `box-sizing: border-box` on the elements the library sizes itself —
  fields first, then anything else combining `width: 100%` with padding. Worth an audit rather than
  a one-line patch, and worth a line in `AGENTS.md` either way.

  **This also means `ui-showcase` cannot catch a whole class of layout bug.** Verifying a library
  change only there hides anything that a border-box reset papers over. Consider dropping the reset
  from the showcase once the library no longer needs it.

---

## Requested for 21.5.0 (2026-08-16)

Filed from use, not from the audit. Recorded here verbatim in intent; none is started.
**Nine items, and they are not one release's worth** — items 3, 4 and 6 are each their own piece
of engineering. Sequence them; do not open them together.

### Bugs — cheap, and they make the library look broken

1. **`gog-autocomplete`: text cannot be erased.** Deleting characters re-inserts the previous
   value instead of clearing, so the field fights the user. Suspect the value written back on
   each keystroke racing the control's own draft state — the same shape as the "unparseable
   drafts don't clear the value" rule the datepicker has. Reproduce first, then decide whether the
   fix is in the accessor or in the input handler.
9. **`gogCollapsibleTrigger` shows a clickable cursor while disabled.** The directive's host block
   is `class`, three ARIA attributes and `(click)` — confirmed 2026-08-16 — so it sets
   `aria-disabled` and nothing else; whatever `cursor: pointer` the consumer put on the trigger
   stays. It should carry `cursor: default` (and the trigger's own hover styling should be
   suppressible) when disabled. Related to the keyboard-accessibility entry above: both come from
   that directive doing too little to the element it is placed on.
8. **`gog-accordion`'s loading state is unsatisfying.** Recorded as dissatisfaction rather than a
   defect — decide what it *should* look like before changing it. Worth comparing against
   `gog-table`'s loading treatment, which replaces content with a spinner rather than dimming it.

### Features — each needs its own decision

2. **A filter box in `gog-multiselect`, matching `gog-select`.** Note the two share
   `GogDropdownBase` and neither declares a `filter` input on its own component class today, so
   check where select's filtering actually lives before assuming it can be lifted across.
   `AGENTS.md` lists `filter`/`filterPosition` under the `dropdown` config group for both, so the
   gap may be smaller than it looks.
3. **Virtual scrolling in `gog-select` and `gog-multiselect`.**
4. **Virtual scrolling in `gog-table`.**

   3 and 4 are the same primitive twice. `hardening-21.5.0.md`'s own backlog already says the DOM
   half of large-list performance "needs a windowing primitive, which is a genuine piece of
   engineering and its own plan" — that is this. Build it once, in `lib/shared`, and adopt it in
   the dropdowns first (a fixed row height) before the table (variable rows, sticky header,
   selection column). Do not start it as a table feature.
5. **A time zone setting for datepicker and calendar in `GOG_CONFIG`.** Today
   `GOG_CONFIG.datepicker` carries `locale` and `firstDayOfWeek`. Note the library is deliberately
   native-`Date`-only with no adapter, and `Date` has no time zone — so this is a design decision
   about what a zone even means here (formatting only? parsing too? `Intl.DateTimeFormat`'s
   `timeZone` option?), not a config key to add. Write the decision down before the code.
6. **More icons.** Cheap per icon, but it is the registry's size and the tree-shaking story that
   matter — check what `provideGogIcons` costs a consumer who wants three of them before growing
   the built-in set.
7. **More `gog-progressbar` variants (animations).** Smallest of the features; a good warm-up.
