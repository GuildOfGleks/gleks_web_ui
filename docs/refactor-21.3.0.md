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
| 1b | CI made green (lint + workspace-wide format) | ✅ done |
| 1c | Command-execution reliability (`running-commands`, `CLAUDE.md`) | ✅ done |
| 2 | Deduplicate float label (TS + SCSS) + config resolver | ✅ done |
| 3 | Config semantics & coverage + size-class boilerplate | ✅ done |
| 4 | Slot unification + selector/naming fixes | ✅ done |
| 5 | Dropdown data model (`optionLabel`/`optionValue`, generics) | ✅ done |
| 6 | Token system industrialization + coverage | ✅ done |
| 7 | One Dark/One Light presets, dropdown filter, clearable controls | ✅ done |

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

### Iteration 1b — CI made green ✅

CI was already red on `master` before any of this work, which meant the new guardrail never
executed (`ci.yml` orders the steps Lint → Format → Token check, so it was unreachable). Fixed
as a separate mechanical pass:

- the one pre-existing lint error — `select-page.html:95` bound a constant with
  `[value]="'angular'"`; changed to the static attribute `value="angular"`;
- `npm run format` across all three projects — 294 files.

**The format pass was verified to be behaviour-neutral rather than assumed to be.** Comparing
every changed file against `HEAD` with formatting-only differences neutralised (whitespace and
line wrapping, quote style, trailing commas, and backslash escaping inside template literals)
leaves exactly two files, both intentional and both inert:

- `ui-showcase/.../select-page.html` — the lint fix above;
- `gleks-ui-lab/src/index.html` — prettier dropped a trailing `;` inside an inline `style`.

**The library itself has zero semantic changes.** Worth knowing for next time: prettier formats
embedded HTML inside Angular `template:` template literals, so it rewrote the escaping of the
code samples in `gleks-ui-lab`'s doc pages (`\"` ⇄ `\'`). The resulting *strings* are identical —
inside a template literal both escapes collapse to the same character — but it is why those
files show up in a "formatting-only" diff at all.

All seven CI steps now pass locally: lint, format:check, check:tokens, build:lib, test:lib
(433 specs), build:showcase, plus build:lab (not a CI step, but 101 of its files changed —
verified via its output marker, since that command never exits; see below).

### Iteration 1c — command-execution reliability ✅

Chasing the `build:lab` verification surfaced a workflow problem worth fixing permanently:
one script in this workspace completes its work and then never terminates, which is
indistinguishable from "slow" unless you know. Every script was measured:

`check:tokens` ~1 s, `format:check` ~6 s, `build:lib` ~5–7 s, `lint` ~10 s, `test:lib` ~13 s,
`build:showcase` ~11–15 s — all exit cleanly. **`build:lab` never exits** (work finishes in
~8 s). Ruled out by direct experiment: the corporate proxy env vars, prerendering,
`.angular/cache`, the `server.ts` entry, and the `npm run` wrapper. Root cause is an Angular CLI
teardown issue specific to that project; it is not a CI step, so it rarely needs running.

- `.github/instructions/running-commands.instructions.md` (new) — the measured table, the
  `timeout N … ; echo exit=$?` rule (124 = hung), the marker-based recipe for `build:lab`, the
  process-cleanup snippets, and the Windows/sandbox gotchas hit this session (`rm -rf` blocked,
  `npm install` not restoring a same-version package, chained sleeps blocked, ANSI stripping).
- `CLAUDE.md` (new) — **`.github/instructions/*.md` are Copilot-format files that Claude Code
  does not auto-load**, so the whole rule set was invisible to it. `CLAUDE.md` is the entry
  point that routes to them, plus the three rules that bite hardest (never publish; `build:lab`
  hangs; verify in `ui-showcase` only).

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

### Outcome ✅

- `lib/shared/float-label-state.ts` — `GogFloatLabelState` replaces the three copies in
  `inputfield`, `textarea` and `dropdown-base`. In `GogDropdownBase` the subclass's
  `hasFloatValue` is wrapped in a `computed()` rather than passed directly: base-class field
  initializers run before the subclass's, so a direct reference is `undefined` at that point.
- `lib/styles/_float-label.scss` — first shared SCSS partial in the library (nothing used
  `@use` before). One `variants()` mixin replaces four ~90-line copies. `gog-textarea`'s real
  difference is now explicit rather than accidental: `$rest-top` / `$rest-centered`, because a
  textarea's placeholder starts at the top instead of being vertically centred.
- `resolveConfigured()` in `config.ts`.

**Behaviour-preservation was proven, not assumed.** Each of the four stylesheets was compiled
with sass at `HEAD` and after the change, and the results compared both as normalised rule sets
and as ordered selector lists — **identical on both counts for all four**, so the CSSOM and
therefore the rendering cannot differ. Plus 433 specs and a clean build.

Live-verified in `ui-showcase` across the full matrix — 4 controls × 3 variants × resting/floated
= 24 states, all correct. `in` floats to 8px/14px/accent-uppercase, `on` lands at `top: 0` with
`translateY(-50%)` and the `#16120e` border mask at `left: 10px` (inset − 4px), `over` sits at
−8px with `translateY(-100%)`. `gog-textarea` keeps `transform: none` where `$rest-centered:
false` applies, and `gog-select`/`gog-multiselect` carry `cursor: default`.

**Measurement note for whoever verifies float label next.** The label transitions `top`,
`font-size`, `color` and `background-color` over `--gog-*-transition-duration`, so reading
`getComputedStyle` right after flipping a class returns a mid-animation value — which reads
exactly like "the floated rule isn't applying". Set `label.style.transition = 'none'` before
toggling, and pick the element by `gog-textarea`/`gog-inputfield` host: the textarea page alone
renders 15 wrappers and only one of them carries a float variant.

**`check:tokens` now analyses compiled CSS instead of raw SCSS.** The mixin builds token names
by interpolation (`var(--gog-#{$prefix}-float-label-on-bg, …)`), which a text scan cannot
resolve — the checker correctly flagged three tokens as "no longer read", which was the tool
being wrong rather than the code. Compiling first makes it robust to any SCSS factoring, and it
is now strictly stronger: a literal fallback introduced *inside* the mixin is reported against
every component that includes it, which the old text scan could not see at all.

### Retracted: the "textarea float-label bug" was a measurement error

An earlier pass through this iteration reported that `gog-textarea` with `floatLabel="in"` never
applied its floated state. **That was wrong — there is no such bug**, and nothing was changed to
"fix" it. Two mistakes compounded: the readings were taken while the label's 0.15 s transition
was still running, and on a page with 15 `gog-textarea` instances the element being measured was
not always the one carrying the float variant. Re-measured with transitions disabled and the host
selected explicitly, all 24 states are correct. The measurement note above exists so the same
trap doesn't catch the next person.

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

### Outcome ✅

1. **`provideGogConfig` merges.** `useFactory` + `inject(GOG_CONFIG, { skipSelf, optional })`
   layers onto the parent injector's config, one level deep per component key. New
   `config.spec.ts` (10 specs) pins it: sibling keys survive, fields merge within a key, it
   layers through more than one level, and the parent's object is not mutated.
2. **Config widened** to `control.size`, `control.errorDisplay`, `dropdown.appendToBody`,
   `dropdown.direction`, `toast.position`, `toast.duration` — all routed through
   `resolveConfigured`, all still per-instance overridable. `control.size` covers only the
   interactive form controls; `gog-table` / `gog-accordion` / `gog-paginator` keep their own
   density defaults (they differ: `lg`, `lg`, `sm`), as do the decorative components.
3. **Size-class bindings collapsed** — 33 `[class.<block>--<size>]` bindings across 7 templates
   became one `[class]="sizeClass()"` each, plus `panelSizeClass()` for the two append-to-body
   panels. Each `sizeClass` encodes its own component's default size, which is why it can emit
   nothing for that size exactly as the old bindings did.

**The emitted DOM classes were verified, not assumed** — they are public API for consumers' CSS.
Checked live for all seven: `gog-btn` emits all five sizes including `--md`; the field blocks
and `gog-select`/`gog-ms-wrapper` emit `xsm/sm/lg/slg` and nothing for `md`; `gog-table` and
`gog-accordion` emit nothing for `lg`. Static classes (`gog-contained-layout`) and sibling
bindings (`--floated`, `--col-borders`, `--loading`, `--primary`) all survive alongside the
`[class]` binding, and an append-to-body panel still gets `--portal` with no stray size
modifier. The scoped-config demo on the Global config page still applies its subtree override.

443 specs (was 433), clean build, lint/format/tokens green.

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

### Outcome ✅

Everything now projects content and is picked up with `contentChild`; nothing new takes a
`TemplateRef` input. Eight new directives: `gogColumnBody` / `gogColumnHeader`,
`gogCheckboxIcon`, `gogTagIcon`, `gogMultiselectClearIcon`, `gogDropdownChevron`,
`gogInputAddonStart` / `gogInputAddonEnd`. Plus `GogColumn` / `<gog-column>`, retiring the
library's last unprefixed element selector.

`gog-inputfield` went from 26 inputs to 20: the six-input icon family collapsed into two addon
slots that take a real `<button>` with its own `aria-label` and `(click)`. The built-in password
reveal toggle deliberately keeps the trailing slot, so it cannot be displaced.

**A deprecation policy now backs this**, at the user's direction and written into
`api-design.instructions.md`: deprecate → carry for one or two minors → **delete on schedule**,
with a fixed `@deprecated since <version> (YYYY-MM-DD) — <replacement>. Removed in <version>.`
tag so `grep -rn "@deprecated since"` lists the whole set before a release. All 21.3.0
deprecations are dated 2026-08-07 and removed in 21.5.0; the two pre-existing option aliases
were back-filled to the same format (21.2.2, removed in 21.4.0).

Verified: 453 specs (was 446) including a new `content-slots.spec.ts` that pins every slot *and*
that a projected slot beats the deprecated input it replaces — which is what lets a codebase
migrate one call site at a time. Live checks in `ui-showcase`: the table renders its
column-scoped tag cells and custom header, the projected clear button carries its own
`aria-label` and clears the field, and a password field still toggles `password` ⇄ `text` with
`Show password` ⇄ `Hide password`.

One bug caught by the new specs rather than by review: `gog-tag` gates its icon on `hasIcon()`,
which counted only `iconName`/`iconTemplate` — so a tag with nothing but a projected template
rendered no icon at all. The spec now guards it. The showcase's onboarding page also lost its
hand-rolled password toggle, which had been duplicating the built-in one.

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

### Outcome ✅

`GogDropdownBase<TValue, TOption = GogDropdownOption>` with three accessor inputs, each taking a
property path or a function. `optionValue: null` emits the option object itself — verified by a
spec asserting the emitted value is the *same reference* the consumer passed in, which is the
whole point of the change.

Backwards compatibility is the load-bearing part, and it held: defaults `'name'` / `'id'` /
`'disabled'` mean the entire pre-existing select + multiselect suite passes untouched. Value
matching keeps the old primitive leniency (`isSameOptionValue`: a `formControl` holding `'1'`
still matches option value `1`) but switches to identity for objects, since coercing them would
make every plain object equal to every other.

`gog-table`'s private `getByPath` moved to `lib/shared/option-accessor.ts` and is now shared by
both features rather than duplicated.

461 specs (was 453). Live-verified on the select page against a `{ uuid, profile: { fullName,
role }, suspended }` DTO: nested-path labels, `optionDisabled="suspended"` greying the right row
(`aria-disabled` + modifier class), a `gogDropdownOption` row rendering `profile.role`, and
`[optionValue]="null"` handing back the object.

**Known ergonomic cost, accepted:** making the components generic means
`TestBed.createComponent(SelectComponent)` (and any bare `viewChild(SelectComponent)`) infers
`unknown` for both parameters — templates infer fine from bindings, but explicit TS references
need an explicit type. The two existing spec files now declare `type DefaultSelect =
SelectComponent<GogDropdownOption, string | number | null>` for this. Worth knowing before
adding more TS-side references to these components.

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

### Outcome — with one deliberate change of direction

**The generation direction was inverted from what this plan said.** The plan called for a
JSON/TS token source that *generates* `theme.css`. On reading the file that turned out to be the
wrong way round: `theme.css` carries the explanation of the whole system — the `:root` vs
`:root, [data-theme]` split, why the instance layer is undeclared, how to add a theme — and a
generated stylesheet would either lose that or bury it in a data file where it reads far worse.
The drift the plan was actually complaining about was never in the stylesheet; it was in the
hand-copied README table and the absence of any typed list, both *downstream* of it.

So `theme.css` stays the source, and `scripts/generate-tokens.mjs` produces
`lib/shared/token-names.ts` (`GogTokenName` + `GOG_TOKEN_GROUPS`, both exported) and the README
table between markers. `check:tokens` now also runs `--check` and fails when either is stale —
verified by adding a token and watching it fail. 887 tokens across 34 groups.

**The "uneven token coverage" finding in the review was wrong, and is retracted.** It inferred
under-coverage from token counts (accordion 78, paginator 5). Auditing what each component
actually paints: `gog-paginator` is three `<gog-button>`s and one `<span>` behind a 26-line
stylesheet — its 5 tokens cover it completely, with the buttons themed through `--gog-btn-*`;
`gog-collapsible` is headless with an 8-line stylesheet. A sweep for themeable properties painted
with a raw literal across every component found **7**, of which 6 are `border-radius: 50%`
(a circle, which must stay literal) and one is a 2px tick gap in the slider. Coverage is
complete; the counts were measuring component complexity.

`--gog-ms-*` -> `--gog-multiselect-*` (57 tokens) with a compatibility window: the old name stays
the declared one and the new name derives from it, so overriding either works. Confirmed live in
both directions. The float-label mixin's `$prefix` had to move too — the checker caught that,
since it reads compiled CSS and the mixin builds those names by interpolation.

`styles/presets/slate.css` ships as the second preset. Verified live by moving a real
`gog-multiselect` into a `data-theme="slate"` subtree: field background -> white, border ->
indigo, text -> slate, none of which the preset mentions by name.

461 specs. **Known flake:** `scroll.component.spec.ts > applies an explicit overscrollBehavior
input once the axis overflows` failed once and passed on two consecutive re-runs; it is
layout-dependent in jsdom and unrelated to this work.

---

## Iteration 7 — One themes, dropdown filter, clearable controls

Requested directly rather than derived from the review.

1. **`one-dark.css` / `one-light.css`** presets, mirroring `slate.css`: palette only, with the
   editor syntax hues mapped onto the library's semantic roles (blue = accent, green/red/yellow/
   cyan = success/danger/warning/info). Registered in the showcase's theme picker.
2. **Filtering** in `gog-select` / `gog-multiselect`: `filter`, `filterPlaceholder`,
   `filterEmptyMessage`, `filterMatch` (a predicate replacing the default case-insensitive
   substring match on the resolved `optionLabel`), plus `GOG_CONFIG.dropdown.filter`. The query
   resets on close, and `visibleOptions()` — not `options()` — feeds the loops, the keyboard
   navigation targets, the panel height estimate, and multiselect's select-all, so "select all"
   under an active filter takes only what the user can see.
3. **`clearable`** on all four field controls, backed by `GogClearableState` (the fourth
   composition class in the `GogErrorState` mould, added at exactly the "rule of three" point).
   The button is value-driven: it appears when there is something to clear and vanishes when
   there isn't, which is the point — it replaces the fake `"— not selected —"` option teams add
   to make a choice undoable. `GOG_CONFIG.control.clearable` switches it on app-wide.

   One asymmetry, deliberate: the default is `false` everywhere except `gog-multiselect`, which
   shipped a clear button before this input existed. Defaulting it to `false` there would have
   silently removed a control; defaulting it to `true` everywhere would have grown a button on
   every existing inputfield.

Verified: 475 specs (was 461) across three new spec files. Live in `ui-showcase` — filter
narrows and shows its empty message, the select's clear button appears only after a selection at
`right: 46px` with the trigger's padding growing 40px → 62px so the label can't run underneath,
the textarea's clear button empties the field and then disappears, and both One themes drive
component tokens they never mention (`--gog-btn-primary-bg` picks up `#61afef` / `#4078f2`).

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
