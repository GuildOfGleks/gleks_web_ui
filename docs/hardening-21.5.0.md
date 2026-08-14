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

## Baseline measured on 2026-08-14

| | |
| --- | --- |
| Components | 29 folders — 27 components + `gogBadge`/`gogTooltip`, 33 element selectors |
| Tests | 897 across 47 files; **every** component folder has a spec |
| Line coverage | **unknown** — `@vitest/coverage-v8` is not installed, `ng test --coverage` refuses to run |
| Tokens | 1239 in `theme.css`, 38 stylesheets under `check:tokens` |
| Slots | 15 slot directives; `GOG_CONFIG` has 13 keys |
| RTL | 63 physical `left`/`right` declarations across 13 components; 12 components use logical properties |
| Reduced motion | honoured in 21 components plus the global stylesheets |

## Status

| # | Iteration | Kind | State |
| --- | --- | --- | --- |
| 1 | Coverage measurement + CI gate | tooling | ⬜ todo |
| 2 | Token prefix consistency (179 tokens) | api | ⬜ todo |
| 3 | The scheduled removals + a check that enforces them | api | ⬜ todo |
| 4 | RTL pass | fix | ⬜ todo |
| 5 | Test depth where the audit found it thin | tests | ⬜ todo |
| 6 | `gog-menu` | feature | ⬜ todo |
| 7 | Version/deprecation metadata for the docs site | tooling | ⬜ todo |

Update this table at the end of every iteration, and re-state "done / remaining" in the turn
summary. Per `gleks-ui-library.instructions.md` rule 11 the agent never publishes, never bumps
the version, and never dates `CHANGELOG.md`'s heading.

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
- **Secondary entry points** (`@guildofgleks/ui/select`, …). Raised by the paginator's dependency
  on `gog-select`: ng-packagr flattens everything into one FESM, so `@defer` inside the library
  produces no code-split (measured — see `consumer-dx-plan.md` iteration 6's follow-ups). Entry
  points are the only real fix, and they change every consumer's import paths, so they need their
  own deprecation cycle and their own decision.
