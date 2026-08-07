# @guildofgleks/ui — 21.3.0 refactor plan

Working plan for the pre-public cleanup. Derived from the architecture review of the library
(2026-08-07), and ordered **top-down in the order the review raised the issues**, not by
priority — sections 1 → 4 of the review map onto iterations 1 → 6 below.

Scope note: the review's section 4 also listed *missing features* (filter/virtual scroll in
dropdowns, server-side table, row selection). Those are new capability, not fixes to existing
design, and they are parked in the [Backlog](#backlog--deliberately-not-in-2130) at the bottom
— with one exception (`optionLabel`/`optionValue`), which is in scope because it is a breaking
change to an existing public shape and gets much more expensive after 1.0.

**Version:** the review suggested landing part of this in 21.2.5, but the full set is far past
a patch. Target is **21.3.0**; `CHANGELOG.md`'s in-progress heading moves there at the start of
iteration 1. Per `gleks-ui-library.instructions.md` rule 9, the agent never publishes.

## Status

| # | Iteration | State |
| --- | --- | --- |
| 0 | Guardrails: instruction files | ✅ done |
| 1 | Token contract enforcement + float-label regression | ✅ done |
| 2 | Deduplicate float label (TS + SCSS) + config resolver | ⬜ not started |
| 3 | Config semantics & coverage + size-class boilerplate | ⬜ not started |
| 4 | Slot unification + selector/naming fixes | ⬜ not started |
| 5 | Dropdown data model (`optionLabel`/`optionValue`, generics) | ⬜ not started |
| 6 | Token system industrialization + coverage | ⬜ not started |

Update this table at the end of every iteration, and re-state "done / remaining" in the turn
summary.

---

## Iteration 0 — Guardrails ✅

Done first so the later iterations are written against corrected rules rather than
re-introducing the same problems.

- ✅ `styling.instructions.md` — replaced the "declare defaults on the block selector" section,
  which contradicted `theme.css`'s actual three-layer model and directly caused the
  float-label literal-fallback regression. Now documents: layer 3 stays undeclared, no literal
  fallbacks in component SCSS, and the `:root` vs `:root, [data-theme]` rule stated as the
  "does the value contain `var()`?" test.
- ✅ `api-design.instructions.md` (new) — the four extension axes in priority order (token →
  slot → headless primitive → input), one sanctioned slot mechanism, the ban on parallel input
  families, the "never hardcode a DTO" rule, the rule of three for deduplication, config-merge
  semantics, and the consistency checklist.

---

## Iteration 1 — Token contract enforcement + float-label regression

**Why first:** every later iteration touches SCSS. Landing the check before the churn means the
churn cannot re-introduce what iteration 0 just documented.

1. **Extend `scripts/check-tokens.mjs`** into a real contract check, run in CI (`.github/workflows/ci.yml`)
   and via `npm run check:tokens`:
   - fail on a literal fallback in any component SCSS — `var(--gog-x, 8px)` — while allowing
     token-to-token chains `var(--gog-x, var(--gog-y))`;
   - fail on a `--gog-*` token that a component *reads* but `theme.css` never declares, except
     the documented instance-layer names (needs an explicit allowlist of layer-3 tokens, which
     doubles as their documentation);
   - fail on a token declared in the `:root` literals block whose value contains `var(`.
2. **Move the float-label defaults into `theme.css`.** `--gog-{input,select,ms,textarea}-float-label-{in-top,on-bg,over-gap,over-reserve,reserve}`
   currently exist only as literal fallbacks in four component stylesheets (`8px`, `18px`,
   `1.4em`). Add them to the correct `theme.css` block (`over-reserve`/`reserve` are literals →
   `:root`; `on-bg` reads `--gog-*-field-bg` → `:root, [data-theme]`) and strip the fallbacks.
3. **Sweep the remaining literal fallbacks** the new check surfaces across all component SCSS.
4. Add the new tokens to the README theming table.

**Done when:** `npm run check:tokens` passes and fails correctly on a deliberately broken token;
`ng build @gleks/ui` clean; float label renders identically in `ui-showcase` before/after.

### Outcome ✅

All four rules (`no-literal-fallback`, `resolvable`, `root-literals-only`, `allowlist-fresh`)
implemented and each verified against a deliberately introduced violation. 16 hidden defaults
moved out of the four field stylesheets into a new shared `--gog-field-float-label-*` scale;
`INSTANCE_TOKENS` now documents all 59 layer-3 tokens and is self-verifying. 433 specs pass,
library builds clean, and all three float variants were measured live in `ui-showcase` with
identical geometry (`in` 28px, `on` `top:0` + border mask `#16120e`, `over` −8px), including a
scoped-`[data-theme]` override propagating to all three component blocks.

**Blocker found, not fixed — needs a decision.** CI is already red on `master`, before any of
this work: `npm run format:check` fails on 108 files in the library and 90 in `ui-showcase`,
and `npm run lint` fails on one pre-existing error
(`ui-showcase/src/app/pages/select-page/select-page.html:95`,
`@angular-eslint/template/prefer-static-string-properties`). Because `ci.yml` orders the steps
Lint → Format → Token check, **the new guardrail never executes in CI.** Iteration 1's value is
only realised once those two steps are green. Options: (a) one mechanical
`npm run format` + `ng lint --fix` commit, (b) move the token check above lint/format, (c) leave
it and rely on running the check locally.

---

## Iteration 2 — Deduplicate float label + config resolver

**Why here:** the float-label feature is the newest code and currently the most duplicated
(3 copies of the TS state, 4 of the SCSS). Cheapest to collapse now, before iterations 4–5 move
the same files around.

1. **`lib/shared/float-label-state.ts` — `GogFloatLabelState`**, modelled exactly on
   `GogErrorState` (plain class, signals in via constructor, composed rather than inherited —
   it has to serve `gog-inputfield` and `gog-textarea`, which have no common base, as well as
   `GogDropdownBase`, which does). Absorbs `resolvedFloatLabel`, `resolvedFloatLabelShowPlaceholder`,
   `isFloatLabelActive`, `isFloatLabelFloated`, `effectivePlaceholder`.
   Replaces the copies in `inputfield.component.ts:116-137`, `textarea.component.ts:73-…`,
   `dropdown-base.ts:190-210`.
2. **`lib/styles/_float-label.scss` mixin**, parameterized by block prefix, replacing the four
   near-identical ~45-line blocks in `inputfield`, `select`, `multiselect`, `textarea` SCSS.
   Requires the block/element class names to be passed in, since they differ
   (`.gog-input-wrapper` vs `.gog-select`).
3. **`resolveConfigured()` helper in `lib/shared/config.ts`** for the
   `input() ?? globalConfig.a?.b ?? DEFAULT` chain — currently hand-written in button, scroll,
   tooltip, and ×2 in each of the three float-label sites. Update
   `gleks-ui-library.instructions.md`'s step-by-step "Global configuration" recipe to use it.

**Done when:** no `resolvedFloatLabel` computed outside the shared class; float-label SCSS
exists once; all four fields verified live in `ui-showcase` across all three variants
(`in`/`on`/`over`) in both themes.

---

## Iteration 3 — Config semantics & coverage + size-class boilerplate

**Behavioural** — the one iteration that changes what existing apps do, so it lands on its own.

1. **`provideGogConfig` must merge, not replace.** Today a nested call drops every sibling key
   silently (`config.ts:76-79` documents this as intended; it is a trap — a route-level
   `{ tooltip: … }` loses the app-level `button.debounce` with no error). Change the factory to
   read `inject(GOG_CONFIG, { skipSelf: true, optional: true })` and deep-merge one level per
   component key. Document the new semantics in the JSDoc and README, and add specs for the
   nested-injector case.
2. **Widen `GogGlobalConfig`** to the settings apps realistically repeat on every instance —
   each one gated on the CSS-token rule (must be read in TypeScript, not just bound to a style):
   - `errorDisplay` (default `'manual'`; most Reactive-Forms apps want `'auto'` everywhere);
   - `size` (a compact app writes `size="sm"` on every control);
   - `appendToBody` + `dropdownDirection` for the dropdown family;
   - `toast.position` / `toast.duration` (currently constants in `toast-service.ts:40-41`).
   Every one of these needs the input's default moved to `undefined` + a `DEFAULT_X` const, per
   the recipe — via the iteration-2 resolver.
3. **Collapse the manual size-class bindings.** Seven templates carry 4–8 lines of
   `[class.gog-x--sm]="size() === 'sm'"` (`select` and `multiselect` have 8 each). Replace with
   a single computed class binding per component. Keep the emitted class names identical —
   they are public API for consumers' CSS overrides, and the `--portal` dropdown modifiers
   depend on them.

**Done when:** nested-config specs pass; a `provideGogConfig` at a route no longer drops parent
keys; existing size classes byte-identical in the rendered DOM (verify in `ui-showcase`, not
just specs).

---

## Iteration 4 — Slot unification + naming

**Breaking, but mechanical.** Every removal gets a deprecated alias.

1. **`<column>` → `<gog-column>`** (`table/column.ts:17`) — the library's only unprefixed
   selector, currently carrying an `eslint-disable`. Keep `column` as a deprecated second
   selector for one minor, drop the disable comment.
2. **Per-column template directives** replacing the string-keyed `TemplateDirective`
   (`type="body" template="fieldName"`): `gogColumnBody` / `gogColumnHeader` read with
   `contentChild()` on `Column`, with typed contexts (`{ $implicit: T; row: T; index: number }`).
   Keeps the old directive working, deprecated.
3. **Collapse the `gog-inputfield` icon API.** 8 of its 26 inputs serve two icons. Introduce
   `gogInputAddonStart` / `gogInputAddonEnd` content slots that take arbitrary projected markup
   (including a `<gog-button>` for the actionable case), deprecating `icon{Start,End}Template`,
   `icon{Start,End}Fn`, `icon{Start,End}Label`. Plain `iconStart`/`iconEnd` **stay** — a bare
   icon name is genuinely the common case and is axis-4-legitimate. The built-in password
   reveal keeps working untouched.
4. **Convert the remaining `input<TemplateRef>` slots** to directives where they are real slots:
   `checkbox.checkIconTemplate`, `multiselect.clearIconTemplate`, `tag.iconTemplate`.
   `gog-icon`'s own `template` input stays — there the template *is* the component's data.
   `chevronTemplate` on the dropdown base moves to a `gogDropdownChevron` directive.

**Done when:** one slot mechanism documented in the README; every deprecated symbol has an
`@deprecated` tag naming its replacement; showcase pages updated to the new API; `CHANGELOG.md`
`### Changed` lists each break with a migration line.

---

## Iteration 5 — Dropdown data model

**The largest breaking change, and the reason this is 21.3.0 rather than 21.2.5.** Must land
before 1.0.

1. **Generic `GogDropdownBase<TValue, TOption = GogDropdownOption>`** with accessor inputs:
   - `optionLabel: string | ((o: TOption) => string)` (default `'name'`),
   - `optionValue: string | ((o: TOption) => unknown) | null` (default `null` = the option
     object itself; `'id'` reproduces today's behaviour),
   - `optionDisabled: string | ((o: TOption) => boolean)` (default `'disabled'`).
   Shared resolver in `lib/shared/` (dot-path support can reuse `table`'s `getByPath`, which
   should move to `lib/shared/` in the process — it is currently private to the table).
2. **Migrate `select` and `multiselect`**, including the `--portal` panel and the
   `hasFloatValue` / `selectedOption` computeds.
3. **Option template slot** — `gogDropdownOption` directive with `{ $implicit: TOption;
   selected: boolean; disabled: boolean }`.
4. **Defaults chosen so existing `{id, name}` code keeps compiling**: `optionLabel` defaults to
   `'name'`, and `optionValue` defaults must reproduce today's `option.id` semantics for the
   `GogDropdownOption` case. `GogSelectOption` stays deprecated-aliased.
5. Type-level check that a consumer's own DTO flows through untouched (`(valueChange)` emits
   their object when `optionValue` is unset).

**Done when:** a showcase page drives a dropdown from a non-`{id,name}` DTO with no mapping;
all existing showcase usages still work unchanged; spec suites for select/multiselect (842 +
724 lines) pass with additions for the accessor paths.

---

## Iteration 6 — Token system industrialization

**Why last:** it rewrites `theme.css` wholesale, so it should follow every iteration that adds
or renames tokens.

1. **Single source of truth.** 794 tokens hand-maintained across a 1057-line file is past the
   point of reliable manual upkeep. Move to a declarative source (`src/styles/tokens.ts` or
   `.json`) and generate:
   - `styles/theme.css` (correctly split into the literal and derived blocks — the generator
     can decide the block from whether the value contains `var(`, removing that class of bug
     entirely);
   - a `GogTokenName` union type shipped in the public API, so tooling/consumers get
     autocomplete;
   - the README theming table, which is currently hand-written and already drifting.
   `check:tokens` then verifies the generated file matches the source (CI fails on a manual
   edit to the generated CSS).
2. **Token coverage pass.** Coverage is uneven — accordion 78, chip 54, but paginator 5 and
   `collapsible` 3. Audit every block against what it actually paints; paginator especially.
3. **Block naming.** `--gog-ms-*` → `--gog-multiselect-*`, `--gog-btn-*` → keep (`btn` is
   universally understood and is 58 tokens of churn otherwise — decide explicitly rather than
   by default). Ship aliases for one minor.
4. **Ship a second preset.** The theming system supports scoped themes but the package contains
   only the baseline; one alternative preset is what makes the capability legible (and is a
   real test that the derived layer re-resolves correctly).

**Done when:** `theme.css` is generated, `check:tokens` guards it, README table is generated,
side-by-side theme lab in `ui-showcase` renders both presets correctly.

---

## Backlog — deliberately not in 21.3.0

Real gaps from review section 4, but they are **new features**, not corrections to existing
design, and none get more expensive by waiting (they are additive):

- dropdowns: filter/search, option grouping, virtual scroll;
- table: server-side sort/pagination (currently client-only, `table.component.ts:82-130`), row
  selection, column resize/reorder;
- extraction of further headless primitives from `GogDropdownBase` / `roving-focus` /
  `*-position` helpers, per axis 3 of `api-design.instructions.md`.

`gleks-ui-lab` (the public documentation site) is also out of scope here: per
`gleks-ui-library.instructions.md`, it documents the *published* API and must only be updated
after the release actually ships.
