# @guildofgleks/ui — 21.5.0 hardening plan

Derived from the **all-components audit of 2026-08-14** — the library measured against itself
across four axes (tests, styles, customization, functionality) rather than from a consumer's
first-run experience. `consumer-dx-plan.md` closed the gaps a newcomer trips over; this closes the
ones a _maintainer_ can only see by counting.

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

|                       |                                                                                                    |                                        |
| --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
|                       | 2026-08-14                                                                                         | 2026-08-15                             |
| Components            | 29 folders — 27 components + `gogBadge`/`gogTooltip`, 33 element selectors                         | unchanged                              |
| Tests                 | 897 across 47 files; **every** component folder has a spec                                         | **904 across 48 files**                |
| Line coverage         | **unknown** — `@vitest/coverage-v8` is not installed, `ng test --coverage` refuses to run          | still unknown — iteration 1            |
| Tokens                | 1239 in `theme.css`, 38 stylesheets under `check:tokens`                                           | unchanged                              |
| Token prefix breaches | 179 (`--gog-ms-*` 75, `--gog-btn-*` 66, `--gog-input-*` 38)                                        | unchanged; `--gog-confirm-*` is 7 more |
| Deprecations owed     | 14 tagged `Removed in 21.5.0`, 2 overdue from 21.4.0                                               | unchanged — none removed yet           |
| Slots                 | 15 slot directives; `GOG_CONFIG` has 13 keys                                                       | unchanged                              |
| RTL                   | 63 physical `left`/`right` declarations across 13 components; 12 components use logical properties | unchanged                              |
| Reduced motion        | honoured in 21 components plus the global stylesheets                                              | unchanged                              |

The test count moved because the library kept receiving fixes after the audit; nothing else did,
which is the expected shape for a plan that has not started.

## Status

| #   | Iteration                                           | Kind    | State                                                                                                      |
| --- | --------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Coverage measurement + CI gate                      | tooling | ✅ done 2026-08-19 — baseline below                                                                        |
| 2   | Token prefix consistency (179 tokens)               | api     | ✅ done 2026-08-19 — 154 renamed, `--gog-input-*` kept with a reason                                       |
| 3   | The scheduled removals + a check that enforces them | api     | ✅ done 2026-08-19 — every tagged removal plus the `src/styles/` path; `check:deprecations` reports 0 tags |
| 4   | RTL pass                                            | fix     | ✅ done 2026-08-19 — supported, verified live under `dir="rtl"`                                            |
| 5   | Test depth where the audit found it thin            | tests   | ✅ done 2026-08-20 — 917 → 965 tests, thresholds raised                                                    |
| 6   | `gog-menu`                                          | feature | ✅ done 2026-08-20 — row-actions menu, verified live                                                       |
| 7   | Version/deprecation metadata for the docs site      | tooling | ✅ done 2026-08-20 — `GOG_DEPRECATIONS`, generated and gated                                               |

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

| Check                    | Result                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `npm run lint`           | ✅ both projects clean                                                                                     |
| `npm run format:check`   | ✅ clean                                                                                                   |
| `npm run check:tokens`   | ✅ _after the fix below_ — it was failing on every Windows checkout                                        |
| `npm run test:lib`       | ✅ 904 passed / 48 files                                                                                   |
| `npm run build:lib`      | ✅ 4.6 s; package contains `README.md`, `AGENTS.md`, `TOKENS.md`, `CHANGELOG.md`, `styles/`, `src/styles/` |
| `npm run build:showcase` | ✅ (pre-existing initial-bundle budget warning, showcase only)                                             |
| `npm run build:lab`      | ✅ 21.4.1 from npm still builds — the lab is not ahead of the registry                                     |
| working tree             | ✅ clean before this check; `node_modules/@guildofgleks/ui` is the real 21.4.1, not a local-build swap     |

**The one fix: `scripts/generate-tokens.mjs --check` compared raw bytes.** `.prettierrc` sets
`endOfLine: "auto"`, so `TOKENS.md` (read from disk) keeps its CRLF while `token-names.ts`
(rendered from a string) is always LF. With `core.autocrlf` on and no `.gitattributes`, every
Windows checkout therefore reported `token-names.ts` as out of date, and `npm run generate:tokens`
"fixed" it by rewriting the same content with different line endings — a failure that could not be
acted on and that trains the reader to ignore the check. The comparison now normalises line
endings, and the writer keeps the file's existing ones so the generator no longer dirties the
working tree. This mattered _before_ iteration 1 rather than during it: iteration 1 adds a second
generated-artifact gate to CI, and a gate nobody trusts locally is worse than no gate.

Everything else the plan needs is a plan item, not a prerequisite.

**Superseded on 2026-08-20.** This section used to end by putting the iterations on hold until the
tagged releases were verified and published, because the lab-side work unlocks only on a publish.
All seven iterations are done; what still waits on the publish is `lab-after-publish.md`, which is
where the lab-side half was recorded instead of being done early. The library half needed no
publish and no longer waits for one.

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

| Metric     | Measured           | Threshold set |
| ---------- | ------------------ | ------------- |
| Statements | 93.02% (3470/3730) | 92%           |
| Branches   | 90.34% (2564/2838) | 89%           |
| Functions  | 92.93% (829/892)   | 92%           |
| Lines      | 95.14% (2899/3047) | 94%           |

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

| Prefix          | Tokens | Component         |
| --------------- | ------ | ----------------- |
| `--gog-ms-*`    | 75     | `gog-multiselect` |
| `--gog-btn-*`   | 66     | `gog-button`      |
| `--gog-input-*` | 38     | `gog-inputfield`  |

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

### Outcome — 2026-08-19

Done, with **two deviations from the plan above, both from reading the code rather than the
count.**

**Deviation 1 — `--gog-input-*` is not an abbreviation, and stays.** The plan counted its 38
tokens as a breach of "spell the component out". They are not `gog-inputfield`'s tokens:
`textarea.component.scss` reads 57 of them, and both components render the same `.gog-input__field`
markup, sharing one token set on purpose so a text field and a textarea restyle together. Renaming
to `--gog-inputfield-*` would have made `gog-textarea` read another component's tokens — worse than
the abbreviation. It is registered in `check-tokens.mjs` as a shared block, with that reason, and
the README says there will be no `--gog-inputfield-*`.

**Deviation 2 — the alias direction in the plan is wrong, and the browser proved it.** The plan
said to declare `--gog-btn-bg: var(--gog-button-bg)` beside the original. Implemented that way
first; a probe on the showcase's themes page showed a theme setting the **new** name having no
effect. The reason is the derived layer: `:root, [data-theme]` re-declares every token it holds
inside _every_ themed subtree, so an alias whose value reads the old name resets itself in each
scope and discards an ancestor's override of the new name. What ships instead puts the deprecated
spelling in the replacement's fallback:

```css
--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem);
```

The spelled-out name is the declaration; the old name is declared nowhere, so it behaves like the
instance layer — set it anywhere and it applies everywhere below, in any scope. It also means
`TOKENS.md` lists **only** the current names (the plan's third done-criterion) instead of both,
and 21.7.0's removal is "delete the `var(--gog-btn-…, )` wrapper", nothing else. theme.css's header
carries this reasoning so the next person does not "simplify" it back.

|                                      |                                                                                                                                                                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renamed                              | `--gog-btn-*` → `--gog-button-*` (64 declarations + 10 instance-layer names), `--gog-confirm-*` → `--gog-confirmation-dialog-*` (7), `--gog-ms-*` → `--gog-multiselect-*` (75, collapsed from twin declarations into the fallback shape) |
| Deprecated spellings still resolving | 154, counted by `check:tokens` on every run                                                                                                                                                                                              |
| Removal                              | 21.7.0, which is also where `--gog-ms-*` moved to — one migration instead of two                                                                                                                                                         |
| theme.css tokens                     | 1239 → 1168; the drop is the 75 multiselect twins becoming one declaration each                                                                                                                                                          |

**The new rule: `check-tokens.mjs` rule E, `known-prefix`.** Every token's namespace must be a
component folder name (read from `lib/components/`, so a new component needs no edit), a
foundation family, or a shared block with a written reason. It found a case the audit had not:
`--gog-radio-*`. That one is **not** a breach — `gog-radio-group` declares `--gog-radio-group-*`
for the container and `--gog-radio-*` for one control inside it, and aliasing the second onto the
first collides with real tokens (`--gog-radio-group-label-size` already exists and means something
else). Recorded in the script; the attempted rename was reverted.

**Verified in a browser, not by reasoning** — this is the one item here a spec cannot cover, since
jsdom does not resolve custom properties through the cascade:

| Case                                                                                      | Result                                                               |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| theme block sets the deprecated spelling (`--gog-btn-md-padding`, showcase's `cyberpunk`) | applies — 19.2px                                                     |
| theme block sets the current spelling (`warcraft`, `red-alert-3`)                         | applies — 20.8px / 18.4px                                            |
| inline instance override, deprecated name (`--gog-btn-bg`, `--gog-btn-padding`)           | applies                                                              |
| inline instance override, current name (`--gog-button-bg`, `--gog-button-padding`)        | applies                                                              |
| both set on one element                                                                   | current name wins                                                    |
| `--gog-confirm-min-width` / `--gog-ms-gap` set at `:root`                                 | feed `--gog-confirmation-dialog-min-width` / `--gog-multiselect-gap` |

`ui-showcase`'s `cyberpunk` theme deliberately keeps the deprecated spelling, with a comment
saying so: it is the live regression check for the whole migration window, and the other two
themes use the current names.

---

## Iteration 3 — The removals 21.5.0 already promised

**Why now and not later:** these are dated promises with a version attached. Slipping them
silently is how a deprecation list becomes permanent API.

Fourteen `@deprecated … Removed in 21.5.0` tags, plus two that are **already overdue** — see
step 3. By file:

| Where                             | What goes                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputfield.component.ts` (6)     | `iconStartTemplate`, `iconEndTemplate`, `iconStartFn`, `iconEndFn`, `iconStartLabel`, `iconEndLabel` → projected `gogInputAddonStart`/`End` |
| `table/column.ts` (3)             | `<column>` selector, `Column` const, `Column` type → `gog-column` / `GogColumn`                                                             |
| `table/template.directive.ts` (1) | the string-keyed `[template]` slot → `gogColumnBody` / `gogColumnHeader`                                                                    |
| `checkbox.component.ts` (1)       | `checkIconTemplate` → `gogCheckboxIcon`                                                                                                     |
| `multiselect.component.ts` (1)    | `clearIconTemplate` → `gogMultiselectClearIcon`                                                                                             |
| `tag.component.ts` (1)            | `iconTemplate` → `gogTagIcon`                                                                                                               |
| `dropdown-base.ts` (1)            | `chevronTemplate` → `gogDropdownChevron`                                                                                                    |

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

### Outcome — 2026-08-19

**Done, all six steps.** `npm run check:deprecations` now reports `0 tag(s) in 112 source
file(s)` — the library carries no deprecated API at all for the first time since 21.2.2.

- **Step 3 — the overdue pair is gone.** `GogSelectOption` and `GogMultiselectOption` (aliases of
  `GogDropdownOption` since 21.2.2, tagged for removal in 21.4.0, still exported through 21.4.4)
  are deleted from `select.component.ts` and `multiselect.component.ts`. `ui-showcase` used them in
  six pages and now names `GogDropdownOption` directly; `AGENTS.md`'s deprecation table loses the
  row; `CHANGELOG.md`'s `### Removed` records the removal _and_ the overrun, rather than re-dating
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

**Steps 1, 2, 5 and 6 — the fourteen tagged removals, plus the prose-only one.** Taken from
what `grep -rn "@deprecated since"` printed, not from the table above:

| Removed                                                                     | Notes                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gog-inputfield`'s six legacy icon inputs                                   | the simplification the plan predicted: `hasIconStartAction`, `hasIconEndAction` and `onIconStartClick` are gone with them, `effectiveIconEndLabel` collapses to the password toggle's own label, and both template branches lose a level of nesting — `iconStart`/`iconEnd` are now unambiguously decorative, and the only action button the field renders for itself is the password toggle |
| `checkIconTemplate`, `clearIconTemplate`, `iconTemplate`, `chevronTemplate` | each was `slot()?.templateRef ?? input()`; now just the slot                                                                                                                                                                                                                                                                                                                                 |
| `<column>` selector, `Column` const and type                                | `gog-column` / `GogColumn` only                                                                                                                                                                                                                                                                                                                                                              |
| the string-keyed `[template]` column slot                                   | `template.directive.ts` deleted, with `TemplateDirective`, `GogTableBodyContext` and `GogTableHeaderContext`; `table.component.ts` loses `templates`, `bodyTemplateMap` and `headerTemplateMap`, and the two template getters become one-liners                                                                                                                                              |
| the `src/styles/` asset copy (21.3.2's promise)                             | out of `ng-package.json`'s assets, the `./src/styles/*` export out of `package.json`, and the README paragraph that promised it until 21.5.0                                                                                                                                                                                                                                                 |

Specs: the two `iconStartFn`/`iconEndFn` cases became two that pin the decorative-only contract,
`content-slots.spec.ts` drops its "beats the deprecated input" assertions (there is no input left
to beat), and `table.component.spec.ts`'s first host moves to `gog-column` with column-scoped
templates. 904 tests, all passing.

`ui-showcase`: the dashboard's five-column table moves to `gogColumnBody` / `gogColumnHeader`, and
the multiselect page's prose stops describing `[clearIconTemplate]` as a live alternative.
**Verified live** at `localhost:4200` — the dashboard table renders every custom cell (role text,
status tags, team chips, Remove buttons) and its blank `id` header; the select page's
`gogDropdownChevron` and the multiselect page's `gogMultiselectClearIcon` still render; the
inputfield page's leading icons render as decorative spans and the password toggle still reveals.
No console errors.

**A flake fixed on the way, not in the plan.** `overlay-theme.spec.ts`'s "returns null when nothing
is themed at all" failed once during this iteration and passed on re-run: its stub root was
appended to `document.body`, so `closest('[data-theme]')` escaped it and found whatever
`theme.service.spec.ts` had left on the real `documentElement` — order-dependent across files
sharing a worker. Both ends fixed: the stub tree stays detached, and the theme-service spec cleans
up after itself. Worth doing now because iteration 1 just added a _second_ full suite run to CI,
which doubles the exposure to it.

**What the check cannot see:** a removal promised in prose has no tag to grep. The `src/styles/`
one was caught here because the changelog listed it; the next one will only be caught the same
way, so keep writing prose promises into `CHANGELOG.md`'s owed list.

---

## Iteration 4 — RTL

**Why:** this is the only item in the plan that is a _break_, not a shortfall. 63 physical
`left`/`right`/`margin-left`-style declarations across 13 components, concentrated exactly where
it shows worst:

| Component                                                       | Physical properties |
| --------------------------------------------------------------- | ------------------- |
| `slider`                                                        | 11                  |
| `multiselect`                                                   | 7                   |
| `scroll`                                                        | 7                   |
| `toast`                                                         | 7                   |
| `select`                                                        | 6                   |
| `tooltip`                                                       | 5                   |
| `inputfield`                                                    | 4                   |
| chip / textarea / checkbox / radio-group / table / `lib/styles` | 1–2 each            |

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

### Outcome — 2026-08-19

**Decision: RTL is supported**, and the README and `AGENTS.md` say so.

- **Stylesheets.** 16 files moved to logical properties. Three kinds of site stayed physical, and
  each now carries a comment saying why: centring (`left: 50%` with a −50% translate is _not_
  the same as `inset-inline-start: 50%` in RTL), coordinates JavaScript writes from a measured
  rect (the tooltip bubble, the portaled panel), and the physically-named public API.
- **Three primitives in `utilities.css`** for the properties CSS gives no logical form:
  `--gog-inline-start-side` / `--gog-inline-end-side` (keywords for `transform-origin`) and
  `--gog-direction-sign` (`1`/`-1`, for the X half of a `translate`). They flip on `[dir='rtl']`
  and are what let the slider thumb, the slider fill, the toast progress bar and the
  indeterminate progressbar mirror without a `:host-context` rule each.
- **`resolveDropdownPlacement` needed no change** — the panel is written at the trigger's own
  `left`/`width`, so it overlays the trigger's box identically in both directions. The plan
  assumed work here; measuring the code showed there was none.
- **`resolveTooltipSide` takes a `direction`.** Only the horizontal half of the `'auto'`
  preference mirrors; an explicit `'left'`/`'right'` is honoured as written, because those are
  physical words a consumer chose. Five specs pin it, and the directive reads
  `getComputedStyle(target).direction` per open, so a trigger inside an RTL region mirrors with
  the region rather than with the page.
- **`scopedOverlayDirection()`** (new, with 8 specs) is `scopedOverlayTheme`'s sibling: a portaled
  panel or bubble carries a _scoped_ `dir` onto its host, and inherits when the direction sits on
  `<html>`. Without it, an overlay opened inside an RTL region of an LTR page renders LTR.
- **The calendar's arrows** flip through `:host-context([dir='rtl'])`; the month grid needed
  nothing, since the weekday order follows `dir` on its own.
- **The showcase carries an RTL toggle** next to the theme switcher — a permanent check rather
  than a session of DevTools edits.

**Verified live** at `localhost:4200` under `dir="rtl"`: inputfield (leading icon and clear
button swap, labels right-aligned), slider (fill grows from the right, thumb mirrored, min/max
swapped), select (chevron left, panel aligned to the trigger's inline start, ticks right),
datepicker (grid mirrored, SUN on the right, prev/next arrows turned around), toast (accent edge
on the right, close on the left), table (columns and headers mirrored, paginator arrows mirrored
by Unicode's own bidi mirroring), and the whole app shell.

**One thing worth knowing for the next live check:** `ui-showcase` resolves the library through
`dist/gleks/ui`, and Vite pre-bundles it — so a component-stylesheet change needs
`npm run build:lib` **and a dev-server restart**, not just a reload. Two rounds of "the fix did
not apply" here were that, not the CSS.

---

## Iteration 5 — Test depth where the audit found it thin

**Why after iteration 1:** with real coverage numbers this becomes a list of uncovered branches
instead of a list of my suspicions. The audit's candidates, by `aria`+keyboard assertions in the
spec against public surface:

| Component | Tests | Surface                               | Note                                                                     |
| --------- | ----- | ------------------------------------- | ------------------------------------------------------------------------ |
| `tag`     | 9     | 6 inputs + 1 slot                     | 1 aria assertion; variants/shape/icon slot barely pinned                 |
| `divider` | 8     | 3 inputs                              | thin, but genuinely simple                                               |
| `chip`    | 14    | 11 inputs + 2 outputs                 | removable/clickable states, 1 aria assertion                             |
| `toast`   | 14    | timers, hover-pause, dedupe, stacking | the most behaviour per test in the library                               |
| `dialog`  | 15    | focus trap covered                    | **0** aria assertions — `role`, `aria-modal`, `aria-labelledby` unpinned |
| `toggle`  | 17    | a switch                              | 3 aria, 0 keyboard                                                       |
| `scroll`  | 23    | 9 inputs + 3 outputs                  | 0 keyboard, 3 aria                                                       |

Two things the audit checked and **cleared** — do not "fix" them:

- `radio-group` has 0 keyboard tests and that is correct: it renders native
  `<input type="radio">` sharing a `name`, so arrow-key navigation is the browser's. Its
  `role="radiogroup"` and aria wiring are implemented; only the _test_ is missing.
- `select`/`multiselect` do implement `ControlValueAccessor` — in `GogDropdownBase`, which is why
  a per-folder scan misses it.

**Done when:** coverage clears the threshold set in iteration 1 with the gate on, and `dialog`'s
ARIA contract in particular is pinned by a test.

### Outcome — 2026-08-20

**917 → 965 tests**, and the gate moved with them: **93 / 90 / 92 / 95** (from 92 / 89 / 92 / 94),
about a point under the measured 93.92 / 91.17 / 93.23 / 96.12.

|            | Before | After      |
| ---------- | ------ | ---------- |
| Statements | 93.05% | **93.92%** |
| Branches   | 90.21% | **91.17%** |
| Functions  | 92.88% | **93.23%** |
| Lines      | 95.20% | **96.12%** |

Aimed at the uncovered lines rather than at the audit's counts, which changed what was worth
writing:

- **`gog-dialog`'s ARIA contract**, the plan's named done-criterion: `role`, `aria-modal`,
  `aria-labelledby` pointing at the real title id, a per-dialog id when two are stacked, the
  `alertdialog` override, no dangling `aria-labelledby` on a titleless dialog, and the close
  button's name. Also the two paths the focus trap has that nothing reached: a dialog with
  **nothing focusable inside it** (Tab must stay on the panel) and the `DIALOG_DATA` /
  `DIALOG_REF` a projected component injects.
- **`gog-multiselect` was the worst-covered file in the library (74%)** and the reason was
  structural: the trigger's "which labels fit, and +N for the rest" fit is measured with
  `canvas.measureText`, which jsdom does not implement, so every test fell through the
  "everything fits" early return. Split into `fit-labels.ts` — its own file, because
  `public-api.ts` re-exports the component module wholesale and a helper exported there would
  have become public API nobody decided to support — and tested with a one-unit-per-character
  measurer. **74% → 82% statements, 72% → 89% branches.**
- **`gog-scroll` had 23 tests and no pointer ones**, for a component whose whole reason to exist
  is a custom scrollbar: track paging up and down, a track press that actually landed on the
  thumb (must not page), a thumb drag that scrolls and then stops tracking after release. jsdom
  reports zero for every layout read, so the geometry is stubbed — including the track's own
  `clientHeight`, which the drag maths divides by. **81% → 87%.**
- **`gog-toast`'s close animation**: `dismissed` fires on the transition the close actually uses,
  and not on a bubbled `transitionend` from a child or on an unrelated property.
- **`gog-tag` and `gog-chip`** got the surface a consumer sets: every variant/size/shape class,
  the decorative icon, and for the chip the interactive/disabled/removable triangle —
  `role="button"` with a tab stop only when clickable, Enter and Space, silence while disabled,
  the remove button's name, no remove button on a disabled chip, and remove not firing the chip's
  own click underneath it.

**One audit finding rejected, with the same reasoning the audit itself used for `radio-group`.**
`gog-toggle` was listed as "17 tests, 3 aria, **0 keyboard**". It renders a real
`<input type="checkbox" role="switch">`, so Space is the browser's — a synthetic `keydown` test
would assert that jsdom dispatches events, not that the component works. What went in instead is
the **native contract that earns the exemption**: it is an `<input type="checkbox">`, it is
wrapped by its label, `role="switch"`, `checked`/`disabled` land on the input itself, the
`aria-label` yields to a visible label, and the on/off track text is `aria-hidden`. Those break
the day someone swaps the input for a styled `<div>`, which is exactly when the missing keyboard
support would become real.

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

### Outcome — 2026-08-20

Done, to the letter of that criterion: the dashboard's table has a `more-vertical` button per row
that opens with **Edit member** focused, ArrowDown steps over the disabled **Transfer ownership**
onto **Remove from team**, and Escape closes and puts focus back on the button — measured in the
browser, not inferred.

Built from the pieces the plan pointed at, and one it did not:

- **`[gogMenuTrigger]` on the consumer's own button**, `gogMenuItem` on their own items — the
  `[gogButton]` decision applied twice. A menu item is markup (icon, label, shortcut hint), so a
  component wrapper would have meant an input per piece.
- **`GogDropdownOverlay`** for `appendToBody`, so stacking and scoped-theme/`dir` copying behave
  exactly as the dropdowns' panels do.
- **`roving-focus.ts`**, but through its _lower-level_ exports. `handleRovingFocusKeydown` reads
  `event.currentTarget`, which needs the handler bound per item; a menu's items belong to the
  consumer, so the panel binds one handler and resolves the index from `document.activeElement`
  with `isRovingFocusKey` + `nextRovingFocusIndex`. Those two are exported for exactly this.
- **`resolveMenuPlacement`** (new, 8 specs) rather than `resolveDropdownPlacement`. A dropdown
  panel is the width of its control and lines up edge to edge; a menu is sized by its longest
  label and shares only its inline-start edge. It also mirrors in RTL and clamps into the
  viewport — without which a menu in the last table column opened half off-screen, which is what
  the first live check showed.

**Five defects the work surfaced. The first three were invisible in a screenshot; the last two
were only visible in one, which is why they survived a green test suite:**

1. **A menu must prefer to drop _down_.** `resolveDropdownDirection` picks the side with more
   room, which is right for a listbox and wrong for a menu: with a trigger mid-viewport the first
   version opened _upwards_. It is now asked only when the menu genuinely does not fit below.
2. **Focus never entered a portaled panel.** `afterNextRender` runs while the overlay's view is
   still detached, and `focus()` on a detached element is a silent no-op — the menu opened
   looking right and keyboard users got nothing. Focus is now applied immediately after
   `overlay.attach()`, where the panel is in the document. The spec that caught it exists because
   the first round of tests covered focus-on-open for the _inline_ panel only.
3. **The attach effect re-triggered itself.** `attach()` re-creates the panel's view, which
   changes the content-query result the effect had read as a dependency — an infinite loop that
   crashed the Vitest worker instead of failing an assertion. Fixed with an `untracked` boundary
   around the whole side-effecting body.

4. **The item styles never reached the items.** `.gog-menu__item` was written in the component's
   own `menu.component.scss`, so it was scoped with the component's encapsulation attribute —
   while `gogMenuItem` marks a button declared in the _consumer's_ template, which carries theirs.
   Every menu opened full of plain browser buttons. Moved to a global `styles/menu.css`, imported
   by `styles/index.css`, which is the arrangement `.gog-btn` and `gogBadge` already use and the
   header of `button.css` already explains. **Any future component whose directive styles a
   consumer's element has this trap**, and no test catches it: the classes are applied, the
   markup is right, only the CSS never matches.
5. **An inline panel had nothing to position against.** The host is `display: contents` so that
   declaring a menu adds no box to the consumer's layout — which also means `position: absolute`
   on the panel resolved against the nearest positioned ancestor, dropping the menu in a corner
   of the page. Both modes now place the panel from the trigger's measured rect, so `appendToBody`
   changes only _where the node lives_ — stacking and clipping — which is all it was ever about.

The panel is measured twice on open — an estimate first, then the rendered element in the same
task — because its real width is what makes the viewport clamp meaningful, and a menu's width is
its content's, not its trigger's.

**`ui-showcase` has a page of its own** (`/menu`): a keyboard playground, the row-actions table,
an inline-vs-`appendToBody` pair inside a `gog-scroll` that shows exactly what the input is for,
and the `direction` pair. The dashboard keeps its row menu as the in-context example.

---

## Iteration 7 — Version metadata for the docs site

**Why:** `gleks-ui-lab` tracks the published package, and a reader's first question is "is this
available on the version I have?" — with "what will break when I upgrade?" close behind. Both
answers already exist in the source, in machine-readable form; nothing needs authoring, only
extracting. See "Showing version-to-version change in the lab" below for the shape.

1. **Ship `CHANGELOG.md` in the package.** One entry in `ng-package.json`'s `assets`. Today it
   stays in the repo, so the lab cannot read the changelog of the version it documents; with it
   shipped, the lab renders the _installed_ version's changelog and cannot drift.
2. **Generate deprecation metadata.** The `@deprecated since <version> (<date>) — <replacement>.
Removed in <version>.` format is already strict and greppable — 14 instances parse cleanly.
   Emit a JSON (or a typed const, like `token-names.ts`) listing symbol, since, replacement and
   removal version, and ship it. This is what lets the lab put a "deprecated, removed in 21.7.0"
   badge on an API row without anyone maintaining a second list.
3. Extend `scripts/` for both, following `generate-tokens.mjs`: generated artifacts, checked in
   CI so they cannot go stale.

**Done when:** the built package contains `CHANGELOG.md` and the deprecation manifest, and
`npm run check:tokens`-style verification covers the new generated file.

### Outcome — 2026-08-20

Done. `scripts/generate-deprecations.mjs` writes `lib/shared/deprecations.ts`, exported as
`GOG_DEPRECATIONS`; `npm run check:deprecations` now runs the ratchet **and** `--check` on the
manifest, so CI needs no new step and a stale manifest fails the build (verified by editing one
entry).

**The question this iteration had to answer first: what goes in it?** The plan assumed
`@deprecated` tags — and iteration 3 removed all sixteen, so a manifest of tags would have been an
empty file. What 21.5.0 actually deprecates is **154 CSS token spellings**, and those cannot carry
a tag a tool can attach to a name: a token is a string in a stylesheet, not a declaration a
compiler sees. So the manifest covers both kinds:

- **symbols** — parsed from their tags, exactly as `check-deprecations.mjs` does. Zero today, and
  the file says so in its own doc comment rather than looking broken;
- **tokens** — the three abbreviated prefixes, _expanded against the stylesheets_. The metadata
  (since, date, removal) lives once in `scripts/deprecations.mjs`; the names come from scanning
  the CSS for what still resolves, so the list cannot drift from the code the way a hand-kept one
  would.

`scripts/deprecations.mjs` is the shared module that made this honest: `check-tokens.mjs`'s rule E,
`check-deprecations.mjs` and the generator now read one namespace map and one tag parser instead of
three copies. The refactor immediately caught a self-inflicted bug — the generated manifest's own
prose contains the word `@deprecated`, so the ratchet parsed the artifact it feeds and failed. The
generated file is now excluded by name, with the reason written next to it.

**What the lab can build on it:** `lab-versioning.md`'s layer 4 — a "deprecated, removed in 21.7.0"
badge on an API or token row — now has its data source, and it ships inside the package, so the
badge reflects the version the reader installed rather than the repo's HEAD.

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

- ~~**`gog-inputfield` reserves its icon space on the wrong side in RTL.**~~ **Fixed in 21.5.1**
  (2026-08-21), and it was not one component but four — `gog-select`, `gog-autocomplete` and
  `gog-datepicker` had the identical shorthand. All four now use `padding-block` +
  `padding-inline`, `--gog-input-pl`/`-pr` are renamed `-ps`/`-pe` (neither was public), and
  `npm run check:logical-properties` fails the build on any `padding`/`margin`/`border-width`/
  `border-radius` shorthand that sets the two horizontal sides differently — the guard this
  class of bug needed, since it is invisible to both a `left:`/`right:` grep and a unit test
  with no style engine. Verified in a browser across all four, LTR and RTL. The original entry:

  Found 2026-08-21, in a
  browser, on the published 21.5.0 — the same session as the item below, and the more visible of
  the two: the placeholder or value runs underneath the icon.

  The icon is placed correctly (`.gog-input__icon--start { inset-inline-start: … }`), but the
  space the input reserves for it is still physical: `.gog-input__field` writes
  `padding: … var(--gog-input-pr, …) … var(--gog-input-pl, …)` and
  `.gog-input-wrapper--icon-start` sets `--gog-input-pl`. A **logical** slot name driving a
  **physical** reserve is the whole bug. Measured in RTL: the icon sits at the right edge of the
  field while computed padding is `10px 14px 10px 36px` — 36px kept at the far left, 14px where
  the icon actually is.

  Affects `iconStart`, `iconEnd`, and every control sharing the trailing slot — `clearable` and
  the password reveal toggle — so it is most of the component's icon surface. The fix is the
  same rule in logical form (`padding-inline-start` / `-end`, with the two custom properties
  renamed to match); no API changes. Iteration 4 converted 16 stylesheets to logical properties
  and this pair was missed because they are custom-property *names*, not declarations a search
  for `left:`/`right:` would find — worth grepping for `--gog-*-p[lr]\b` and similar before
  calling the RTL conversion complete.

  The lab's `general/rtl` page shows it in its live demo and says so; `lab-after-publish.md`
  carries the entry that deletes the note once it ships.

- ~~**`--gog-menu-max-height` does not cap the panel.**~~ **Fixed in 21.5.1** (2026-08-21). The
  measured room is handed to CSS as `--gog-menu-available-height` and `menu.css` takes the
  smaller of it and the token, so the panel is the least of its content, the token and the room
  available. The fix needed a second change nobody would have predicted from the symptom: an
  up-menu is now anchored by its `bottom` instead of by a `top` derived from its expected
  height, because a panel the token cuts short would otherwise float away from its trigger by
  exactly the height it did not take. Both halves are pinned by specs, and the up-with-a-cap
  case was measured in a browser (48px panel, still 4px from its trigger). The original entry:

  Found 2026-08-21, in a browser, while
  writing the lab's menu page against the published 21.5.0 — so it shipped. `.gog-menu` carries
  `max-height: var(--gog-menu-max-height)` (default `320px`) from the stylesheet, and
  `resolveMenuPlacement` then writes the *measured available space* onto the panel as an inline
  `max-height`. Inline wins over any stylesheet rule, so the token applies only when it is larger
  than the space — which is never the case the consumer is trying to hit. Measured: a 24-item menu
  with 534px of room above it renders 534px tall, and setting `--gog-menu-max-height: 150px` on
  `documentElement` changes nothing (computed `max-height` stays `534px`).

  The panel does still scroll — it is capped by the viewport, and `gog-scroll` takes over past
  that — so nothing overflows the screen. What a consumer cannot do is choose the height at which
  scrolling starts, which is the entire purpose of the token, and both `README.md` and `AGENTS.md`
  describe it as working ("A long menu scrolls itself past `--gog-menu-max-height`").

  The fix is one line in the placement result — `Math.min(available, token)`, or writing the
  inline value as `min(<available>px, var(--gog-menu-max-height))` so the cascade resolves it —
  plus a spec pinning that a token smaller than the available space wins. It needs a browser check
  rather than a unit test alone, since the bug is a cascade interaction that jsdom will not
  reproduce faithfully. Same shape as the `stickyHeader` defect below: correct-looking code whose
  effect is cancelled by something else in the box model.

  The lab documents it as a **Known defect in &lt;installed version&gt;** on the menu page and in
  the token reference; `lab-after-publish.md` carries the entry that deletes both once it ships.

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
- ~~**The `position: fixed` containing-block caveat, documented once.**~~ **Done 2026-08-20**, in
  21.5.1 (21.5.0 had already shipped): README gained an "Overlays and the viewport" section,
  `AGENTS.md` a paragraph, and `gog-dialog`, `gog-toast-container` and `gog-spinner [overlay]`
  a line of TSDoc each. The cause is also stated where it is created — `gog-scroll`'s `contain: layout style` now
  says what it does to a fixed descendant. `gog-menu` hit this exact trap while it was being
  built, which is what moved the item out of the backlog. The original entry:

  Every fixed overlay the
  library renders — `gog-spinner [overlay]`, `gog-dialog`'s backdrop, `gog-toast-container` — is
  positioned against the viewport _only if no ancestor establishes a containing block_. A
  `contain`, `transform`, `filter` or `backdrop-filter` anywhere above it silently retargets the
  overlay to that ancestor's box. This is not hypothetical for this library specifically:
  `gog-scroll` sets `contain: layout style`, so a dialog opened from inside one covers the
  scroller rather than the window. The lab hit it twice (the dialog and toast outlets had to be
  hoisted to the app root; the spinner's "full-screen" demo covers the article, and now says so).
  Consumers will hit it wherever they nest an overlay inside their own transformed or contained
  wrapper. Worth one shared paragraph in `README.md`/`AGENTS.md` plus a line on each overlay
  input's TSDoc — a documentation change, which is why it is here rather than in an iteration.

- ~~**`gogCollapsibleTrigger` is silently keyboard-inaccessible on a non-focusable element.**~~
  **Fixed in 21.5.0** (2026-08-20), taking the first of the two options below: the directive
  supplies `role="button"`, `tabindex="0"` and Enter/Space when the host is not natively operable,
  and stands down entirely on a `<button>`/`<a href>` or where the consumer set `role`/`tabindex`.
  Standing down had its own trap, caught by a spec: a host binding evaluating to `null` _removes_
  the attribute, so the first version deleted the very `role` a consumer had written. The original
  entry, for the reasoning:

  The
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

- ~~**`gog-table`'s `stickyHeader` does not stick — the component overrides itself.**~~ **Fixed in
  21.6.0** (2026-08-22) by `maxHeight`, an input that caps the table's own viewport so there is a
  vertical scrollport for the header to pin to. Verified in the showcase with both axes scrolling
  at once. The route there is worth keeping, because the fix this entry originally proposed is
  impossible and the obvious second attempt regresses the case that already worked:

  1. `overflow-y: visible` on the internal scroller — what this entry proposed, and what
     `gog-scroll` already does for `axis="horizontal"`. CSS coerces it to `auto` beside a
     scrolling `overflow-x`. Measured: header 147px out of view.
  2. `overflow-y: clip` — coerces to `hidden`, also a scroll container. Same 147px.
  3. Enabling the vertical axis for *every* table, so a `--gog-table-max-height` token could do
     the work. This makes an uncapped table a scroll container too, which pulls the consumer's
     own scrolling region out of its descendants' sticky chain — the case that worked before
     started failing by the same 147px. This is also why `maxHeight` is an input and not a
     token: it decides behaviour (which axes scroll), not just a length.
  4. Cap the viewport, only when asked. Works, both axes.

  The original entry:

  `stickyHeader`
  sets `position: sticky; top: 0` on the header cells, which is correct, but a sticky element
  resolves against its _nearest_ scrolling ancestor, and `gog-table` wraps its own markup in
  `<gog-scroll class="gog-table-scroll">`. On a table that fits, that viewport computes to
  `overflow: visible` and is harmless; but as soon as it activates — which is precisely what putting
  a wide table in a narrow region does — it becomes the nearest scrollport and wins over whatever
  region the consumer put the table in — and because it is sized by the table's own content, it
  never scrolls vertically, so the header simply rides up out of view. Measured on the lab against
  21.4.2 on 2026-08-15: with the table in a 260px scrolling wrapper,
  `th.closest('.gog-scroll__viewport')` is the table's internal one, and the header leaves the
  viewport at `scrollTop: 200`. The lab's "Sticky header" demo documents the defect in its
  description; delete that paragraph in the release that fixes it (recorded in
  `lab-after-publish.md`).

  **The fix this entry used to propose — `overflow-y: visible` on the internal scroller — cannot
  work, and `gog-scroll` already tries it.** `viewportOverflowY` returns `visible` whenever
  `axis="horizontal"`, and its comment names this exact defect as the reason. Re-measured
  2026-08-22 against 21.5.2, in a browser: the inline style really is `overflow: auto visible`,
  and the *computed* style is `auto / auto`. CSS coerces it — a `visible` paired with a
  non-`visible`, non-`clip` value on the other axis computes to `auto`. `clip` does not save it
  either: paired with a scrolling axis it computes to `hidden`, which is also a scroll container.
  Measured both; the header rode away by 147px in each case.

  So there is no overflow value that makes one axis scroll while the other stays out of the
  sticky chain. The table cannot both scroll horizontally *and* let a sticky header resolve
  against something outside it.

  **What does work, measured the same session:** give the table's own viewport a `max-height`, so
  it becomes the vertical scrollport the header is supposed to stick to — the header then pins to
  the table's own top edge with both axes scrolling. That is the pattern every real data grid
  uses, and it is a new input (`scrollHeight` / `maxHeight`) plus a redefinition of what
  `stickyHeader` promises: the table owns its vertical scroll, rather than sticking to whatever
  region the consumer wrapped it in. **New public API, so it needs a decision, not a patch** —
  which is why it is still here rather than fixed alongside `fullWidth` in 21.6.0.

  The alternative, if that input is unwanted: narrow the documented contract to "works while the
  table does not scroll horizontally", which is true today and is what the demo shows.
- ~~**`[fullWidth]="false"` clips the widest column's header.**~~ **Fixed in 21.6.0**
  (2026-08-22), exactly as predicted: `.gog-table--auto-layout` sets `table-layout: auto` whenever
  `fullWidth` is false. The showcase's own demo now redistributes to the 115px/78px this entry
  forecast, with nothing clipped, and the nine `fullWidth` tables on that page stay `fixed` and
  unchanged. The original entry:

  The table is `table-layout: fixed`
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
  consumer put it in, and `gog-textarea`'s resize grip — which is drawn on the _container_, 3px in
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
2. **`gogCollapsibleTrigger` shows a clickable cursor while disabled.** The directive's host block
   is `class`, three ARIA attributes and `(click)` — confirmed 2026-08-16 — so it sets
   `aria-disabled` and nothing else; whatever `cursor: pointer` the consumer put on the trigger
   stays. It should carry `cursor: default` (and the trigger's own hover styling should be
   suppressible) when disabled. Related to the keyboard-accessibility entry above: both come from
   that directive doing too little to the element it is placed on.
3. **`gog-accordion`'s loading state is unsatisfying.** Recorded as dissatisfaction rather than a
   defect — decide what it _should_ look like before changing it. Worth comparing against
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
