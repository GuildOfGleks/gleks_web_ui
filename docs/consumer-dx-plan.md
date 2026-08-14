# @guildofgleks/ui — consumer-DX refactor plan

Working plan derived from the **consumer-perspective review of 2026-08-13** — the library read
end-to-end as a web developer who runs `npm i @guildofgleks/ui` and builds a real site on it,
rather than as its author. Complements `refactor-21.3.0.md`, which reviewed the library from the
inside (architecture, token contract, API consistency). Everything here is about the seam
between the package and the person consuming it.

Unlike `refactor-21.3.0.md`, this one is **ordered by cost/benefit, not by review order**:
iterations 1–4 are hours-to-a-day each and remove hard failures; 5–7 are real feature work.

**Baseline measured on 2026-08-13:** `npm run build:lib` clean (5.8 s), `npm run test:lib`
green (786 specs / 45 files), FESM 1 001 601 B raw / 158 856 B gzip, `theme.css` 92 596 B raw /
16 817 B gzip.

**Version:** iterations 1–4 are documentation, accessibility and bug fixes and fit the
in-progress patch heading; 5–7 add public API and need a minor. Which release each lands in is
the user's call — per `gleks-ui-library.instructions.md` rule 9 the agent never publishes, never
bumps the version, and never edits `CHANGELOG.md`'s `planned` heading.

## Status

| # | Iteration | Kind | State |
| --- | --- | --- | --- |
| 1 | Onboarding blockers (README ↔ package reality) | docs | ✅ done |
| 2 | Accessibility defaults (label association, live regions) | fix | ✅ done |
| 3 | Native attribute passthrough on text controls | api | ✅ done |
| 4 | Packaging correctness + small bugs | fix | ✅ done |
| 5 | Icon registry | feature | ✅ done |
| 6 | `gog-table`: outputs + lazy mode | feature | ✅ done |
| 7 | Link-flavoured button | feature | ✅ done |

Iterations 1–4 landed together under `CHANGELOG.md`'s `[21.3.2] - planned` heading; `[21.3.1]`
was left untouched for the release the user cuts first. Per-iteration outcomes are recorded
under each section below, and the defects the work itself turned up — none of them planned —
under [Follow-ups](#follow-ups--everything-iterations-14-turned-up-).

Update this table at the end of every iteration, and re-state "done / remaining" in the turn
summary.

---

## Iteration 1 — Onboarding blockers

**Why first:** these are the only findings in the review that make a brand-new consumer fail
outright, they are documentation-only, and they cost hours rather than days. Everything below
this line is invisible to someone who never got the package to render.

1. **Fix the stylesheet path.** `README.md:53` tells consumers to add
   `node_modules/@guildofgleks/ui/styles/index.css` to `angular.json`. That path does not exist
   in the published package: `ng-package.json:7` copies `assets: ["src/styles"]`, so the file
   ships at `node_modules/@guildofgleks/ui/**src**/styles/index.css` — which is what
   `angular.json:175` (the lab app, consuming the published package) actually uses, and what
   `getting-started-page.ts:42` on the docs site documents. The npm README is the one place
   that is wrong, and it is the only text people read before installing.

   Two ways to close it; **prefer (b)**:
   - (a) correct the three occurrences in `README.md` to `src/styles/…`;
   - (b) change `ng-package.json` so the assets land at the package root (`styles/…`) and the
     README becomes true as written. Then update `angular.json:165–178` (lab), the
     `getting-started-page.ts` snippet and `src/styles/index.css`'s own header comment, which
     already advertises the short `@guildofgleks/ui/styles/index.css` form.
     Note that the short form does **not** resolve through the generated `exports` map (it lists
     only `.` and `./package.json`), so if (b) is taken, also add a `"./styles/*"` entry —
     otherwise a SCSS `@import '@guildofgleks/ui/styles/index.css'` keeps failing even though
     the `angular.json` file path works.

2. **Document the dialog and toast host elements.** `DialogService.open()` and
   `ToastService.show()` render nothing until `<gog-dialog />` / `<gog-toast-container />` are
   placed in a template — visible in `ui-showcase` (`catalog-page.html:82–83`) but absent from
   the README. Add a "Services need a host" subsection to `## Setup` showing both in the app
   root, and cross-reference it from the `DialogService`/`ToastService` mentions in
   `## Components`.

3. **Refresh the component inventory.** `README.md:14` claims "18 standalone components";
   `README.md:249–252` lists 21; `src/lib/components/` holds 29. Undocumented today:
   `gog-autocomplete`, `gogBadge`, `gog-button-toggle`, `gog-datepicker`, `gog-divider`,
   `gog-progressbar`, `gog-tabs`, `gog-toggle`. Datepicker and tabs are among the first things
   anyone looks for — their absence from the README reads as "not implemented".

4. **Split the token table out of the README.** The built `README.md` is 231 927 B, nearly all
   of it the generated `--gog-*` tables between `<!-- tokens:start -->` and its end marker. The
   Setup section — the part that must be found in ten seconds on npmjs.com — is buried. Move
   the generated tables to `TOKENS.md`, keep the three-layer explanation plus a link in the
   README, and point the generator (`scripts/`) at the new file.

**Done when:** a scratch Angular 21 app, wired only from the README with no other source of
truth, renders a styled `gog-button`, opens a dialog and shows a toast on the first attempt.

### Outcome ✅

Option (b), without moving any source files: `ng-package.json` now carries a second asset
pattern (`{ glob, input: "src/styles", output: "styles" }`) alongside the original, so the
built package contains **both** `styles/` and `src/styles/`. Existing consumers — including
`gleks-ui-lab`, which resolves the published package — keep working untouched; `src/styles/` is
marked deprecated for removal in 21.5.0. Verified against the real build output, not just the
config: `dist/gleks/ui/styles/index.css` exists, and ng-packagr merged the hand-written
`exports` entries (`./styles/*`, `./src/styles/*`) ahead of its own generated ones.

`gleks-ui-lab` and its docs were deliberately **not** updated — they describe the published
21.3.0 package, where the short path genuinely does not exist yet. Everything the lab will need
once 21.3.2 ships is recorded in [`lab-after-publish.md`](./lab-after-publish.md), including the
two statements it currently makes that stop being true (`ThemeService.theme` as a
`WritableSignal`, and `gog-calendar` not reading `GOG_CONFIG`).

README: added a "Services need a host element" section with a runnable root-component example;
replaced the stale "18 standalone components" claim and the 21-entry list with a grouped table
covering all 27 components, both directives, and the 15 slot directives. Token tables moved to
`TOKENS.md` (`generate-tokens.mjs` retargeted, marker mechanism unchanged), taking the README
from 232 KB to 14 KB.

**Out-of-plan fix, found on the way:** `npm run check:tokens` was already failing on `master` —
`token-names.ts` was stale by 18 tokens, and `textarea.component.scss` carried two literal
`var(--x, 0px)` fallbacks for tokens declared nowhere. Both fixed (see iteration 4's outcome);
the check is green again.

---

## Iteration 2 — Accessibility defaults

**Why here:** the package's own keywords and `README.md:28` promise "accessible by default",
and the two defects below both fire in the default configuration — i.e. exactly for the
consumer who trusted that line and wrote no extra attributes.

1. **Auto-generate a field id.** `inputfield.component.html:44` binds
   `[attr.id]="inputId() || null"` and lines 12/16 bind `[attr.for]="inputId() || null"`, so
   with no `inputId` the `<input>` has no id at all: the label is not programmatically
   associated (clicking it does not focus the field), and the `aria-describedby` → error link
   on line 55 never materialises, so validation messages go unannounced.
   `gog-select` already solves this — `select.component.ts:60` falls back to
   `gog-select-${this.uid}`. Apply the same pattern to `gog-inputfield` and `gog-textarea`
   (`textarea.component.ts:55` has the identical `inputId` input), keeping an explicitly passed
   `inputId` authoritative. Audit `gog-checkbox` and `gog-radio-group` for the same gap while
   in there.

2. **Move `aria-live` to the toast container.** `toast.component.ts:25–27` puts
   `role`/`aria-live`/`aria-atomic` on the toast host, which enters the DOM together with its
   own text — screen readers routinely miss announcements from a live region created in the
   same tick as its content. The region must pre-exist: declare it on the per-position wrapper
   in `toast-container.component.html` and leave the individual toast as plain content. Keep
   the existing `ariaRole`/`ariaLive` derivation (assertive for errors) by lifting it to the
   group level, since a group is already per-position.

**Done when:** in the showcase, clicking a `gog-inputfield`'s label focuses the field with no
`inputId` set; an invalid touched field's message is reachable via `aria-describedby`; and a
toast fires an announcement in a screen reader on the first show, not only on the second.

### Outcome ✅

Id generation extracted to `lib/shared/control-id.ts` (`nextGogControlId(prefix)`, per-prefix
counters so ids stay stable per component type and hydration-safe) rather than copied a fourth
and fifth time. `gog-inputfield` and `gog-textarea` now generate one; `gog-radio-group` and
`gog-slider` were migrated to the shared helper with byte-identical output. `GogDropdownBase`
deliberately keeps its numeric `uid` — it derives four ids (trigger, listbox, label, error)
from one instance, so what it needs is the number, not a finished id. `gog-checkbox` needed
nothing: it wraps its input in the `<label>`, which associates implicitly.

`aria-describedby` was additionally re-keyed from `hasError()` to `visibleError()` — the two
disagree under `errorDisplay="auto"` with an empty message, and it was pointing at an element
that isn't in the DOM.

Toast live regions: two permanently-mounted, visually-hidden regions on `gog-toast-container`
(polite + assertive), fed from `groups()` so a toast queued beyond `maxVisiblePerPosition` is
not announced before it is visible; keyed by `id:revision` so a deduped re-show re-announces.
`gog-toast` lost its own `role`/`aria-live` to avoid double announcements — it is only ever
rendered by the container, so nothing else depended on them.

Verified live in `ui-showcase`: 25 of 25 inputfields have `for` matching their input id (mixed
explicit and generated), clicking a label focuses its own field, a blurred invalid email links
`aria-describedby` → `email-error`, and firing one toast of each type routes success/info to
the polite region and error/warning to the assertive one while the toasts themselves carry no
`role` or `aria-live`.

---

## Iteration 3 — Native attribute passthrough

**Why:** the real `<input>`/`<textarea>` is sealed inside the component, so anything the
component does not forward is unreachable — there is no escape hatch. The first ordinary form
on a real site (a phone number, a length-capped bio, a read-only field) hits this.

1. **Widen `gog-inputfield`'s `type`.** `inputfield.component.ts:86` allows
   `text | password | email | number | date`. Add at least `tel`, `url`, `search`; consider
   `time` and `datetime-local` alongside the existing `date`.
2. **Forward the missing native attributes** on `gog-inputfield`: `readonly`, `maxlength`,
   `minlength`, `pattern`, `inputmode`, `autofocus`, `spellcheck`. Mirror `readonly` and
   `maxlength` onto `gog-textarea` (`textarea.component.ts:46–84` currently exposes only
   `rows` beyond the shared field inputs).
3. Decide and document the rule in `api-design.instructions.md`: *a wrapper around a native
   control forwards the native attribute space of that control by default; anything it does not
   forward is a deliberate, documented omission.* Without a stated rule this list is re-litigated
   per field, one input at a time.
4. `readonly` interacts with `clearable` and with the float-label state — a read-only field must
   not offer a clear button. Cover both in specs.

**Done when:** a `tel` field with `inputmode="tel"`, `maxlength` and `readonly` is expressible
without touching the DOM directly, and `npm run test:lib` covers each new attribute.

### Outcome ✅

Landed as planned, with two deviations:

- **`autofocus` was dropped, not added.** `@angular-eslint/template/no-autofocus` is on in this
  repo and rejected it — the project already had a position on this, and it is the right one.
  It is now the worked example of a *deliberate* omission in the new instruction-file rule,
  which is exactly the distinction that rule exists to force.
- **`GogClearableState`'s third parameter was renamed** `isDisabled` → `isNotEditable`, since
  read-only now feeds it too. Dropdowns pass the same signal as before.

`GogInputType` and `GogInputMode` added to `shared/types.ts` and the public API. The
"wrapping a native control" rule was written into `api-design.instructions.md`, including the
keep-the-native-name convention (`readonly`, not `isReadOnly`) and the requirement to model the
interactions rather than just bind the attribute.

**Found while writing the specs:** on a `type="number"` field the clear button never renders,
because the spin buttons and the clear button share the field's end slot and the spin branch
wins. Not fixed here — the end slot fits one control, so showing both is a layout decision, not
a one-line change. Recorded in the backlog below.

---

## Iteration 4 — Packaging correctness and small bugs

**Why here:** each item is small and independent; grouped so they do not each cost a release.

1. **Declare `@angular/platform-browser` as a peer dependency.** `icon.component.ts:10` imports
   `DomSanitizer`, but `package.json:20–24` lists only `@angular/common`, `@angular/core` and
   `@angular/forms`. It resolves under npm's flat tree and breaks under strict pnpm — and it
   makes the "three dependencies" claim in the README and the package description inaccurate.
   Alternative worth weighing: drop the `DomSanitizer` dependency entirely by rendering the
   built-in icons as real `<svg>` template markup instead of `bypassSecurityTrustHtml` over a
   string blob (`icon.component.ts:45–47`) — which also removes an XSS-shaped API from the
   component and pairs naturally with iteration 5.
2. **Fix clear-on-number.** `inputfield.component.ts:381–387` (`clearValue`) calls
   `_onChange('')`, while `onInput` for a number field calls `_onChange(null)` (line 356). The
   clear button therefore writes an empty **string** into a `FormControl` typed as
   `number | null`. Emit `null` for number fields; add a spec asserting the control value type
   after clear for both `text` and `number`.
3. **Harden `ThemeService`.** `theme.service.ts:8` exposes `theme` as a public *writable*
   signal, so `themeService.theme.set('dark')` changes the signal without ever running
   `applyTheme` — the DOM attribute and the signal silently diverge. Expose a readonly signal
   plus `setTheme`/`toggleTheme`. While there, close the two gaps that force every consumer to
   write a wrapper anyway: persistence (opt-in `localStorage` key) and initial resolution from
   `prefers-color-scheme` when no `data-theme` is present. Both must stay SSR-safe — the
   service currently touches `documentElement` in its constructor.
4. **Make the remaining hardcoded English configurable.** `multiselect.component.html:199–200`
   renders literal "Select all" / "Clear" with no input at all; `dialog.component.html:41`
   ("Close dialog"), `toast.component.html:48` ("Close toast") and
   `calendar.component.html:113/124/136` ("Hours"/"Minutes"/"Seconds") are hardcoded
   `aria-label`s. The library already does this right elsewhere (`clearAriaLabel`,
   `showPasswordLabel`, `paginator.ariaLabel`), so this is an inconsistency, not a missing
   concept. Given the number of strings now involved, prefer a `GOG_CONFIG.labels` block over
   one input per string, and state the choice in `api-design.instructions.md`.

**Done when:** `npm run lint`, `npm run test:lib` and `npm run build:lib` are clean; the
published `package.json` lists four peers; and a non-English app can relabel every
user-visible string without forking a template.

### Outcome ✅

1. **Peer dependency declared** rather than removing `DomSanitizer`. The alternative in the plan
   (render the built-ins as real SVG markup) is a breaking change — `ICON_DEFS` is a public
   `Record<GogIconName, string>` — so it belongs with iteration 5's icon work, not here.
2. **Clear-on-number fixed**, with specs pinning the control value type after clearing for both
   `text` and `number`.
3. **`ThemeService` rewritten**: `theme` is now `Signal<string>` off a private writable;
   `GOG_CONFIG.theme` adds `storageKey`, `defaultTheme`, `followSystem`, `lightTheme`,
   `darkTheme`. Resolution order is document `data-theme` → stored → OS → default, with storage
   access wrapped (Safari private mode and blocked site data both *throw* rather than degrade)
   and `matchMedia`/`localStorage` behind `isPlatformBrowser`. **Everything is off by default**,
   so an existing app's opening theme cannot change under it on upgrade. 12 specs, including
   the read-only signal.
4. **`GOG_CONFIG.labels`** covers all 23 fixed chrome strings. Existing per-instance label
   inputs were folded into the same instance → config → default chain via `resolveConfigured`
   rather than left as a second, inconsistent mechanism. `gog-datepicker` forwards
   `todayLabel`/`thisMonthLabel` as `undefined` so `gog-calendar` resolves them itself instead
   of receiving an English default that would shadow the app's config.

   Deliberately excluded: content-shaped `ariaLabel` inputs (`gog-checkbox`, `gog-button`,
   `gog-select`), which differ per instance and have no meaningful app-wide value; and
   `gog-paginator`'s per-page labels ("Go to page 4"), which interpolate and need a function —
   see the backlog.

Verified live in `ui-showcase` after pointing it at the local build: default labels render
everywhere they did before (`Clear`, `Increment`/`Decrement`, `Clear selection`, `Select all`/
`Clear`, `Previous page`/`Next page`, `Pagination`, `Previous year`…`Next year`, `Today`,
`Open calendar`, `Close toast`), the theme switcher still repaints the page through
`setTheme('one-light')`, and the textarea resize grip sits at exactly the same 3px/3px as
before the token change. The `node_modules` swap has been reverted to the published 21.3.0 and
the dev server stopped.

---

## Follow-ups — everything iterations 1–4 turned up ✅

Not planned work: four defects and one piece of pre-existing drift found *while* doing
iterations 1–4, closed in the same release rather than left to rot in the backlog. All five are
in `CHANGELOG.md`'s `[21.3.2]` section.

1. **A `clearable` number field had no clear button.** The stepper and the clear button share
   `gog-inputfield`'s end slot, and the stepper won the `@else if` chain outright — so
   `clearable` was a silent no-op on `type="number"` unless `showSpinButtons` was also off.
   Both now render. The geometry needed no invention: the stepper's own width became a token
   (`--gog-input-spin-width`, previously a `calc()` inline in the stylesheet), and a
   `--spin-clear` wrapper modifier offsets the clear button and widens the text gutter by
   exactly that. Verified live: 8px gap between the two, gutter 57.6px with both and 36px with
   the stepper alone, and the extra gutter appears and disappears with the clear button.
2. **`gog-calendar` ignored `GOG_CONFIG.datepicker`.** The config doc has always said `locale`
   and `firstDayOfWeek` apply to `gog-calendar` too; only `gog-datepicker` read them, so a
   standalone calendar in a `uk-UA` app rendered in `en-US`. The calendar now resolves both
   itself. Rendered through `gog-datepicker` nothing changes — it passes its own resolved
   values, which win and resolve identically.
3. **`gog-paginator`'s per-page names were unreachable.** Fixed with
   `GOG_CONFIG.labels.page: (page, isCurrent) => string`. A function, and the only one in that
   block: a `{0}`-style placeholder string would be a second, weaker formatting language, and
   one that cannot express languages where the number's position or the surrounding grammar
   depends on its value. Documented as such in `config.ts`.
4. **`aria-describedby` pointing at an unrendered element** — folded into iteration 2, see there.
5. **`npm run check:tokens` and `npm run format:check` were both red on `master`** before any of
   this work: `token-names.ts` stale by 18 tokens, two literal `var()` fallbacks in
   `textarea.component.scss`, and three files prettier wanted to rewrap. All fixed; CI's three
   checks (lint → format → tokens) are green together for the first time in this branch's
   history.

`ui-showcase` gained a "Native attributes" card and a clearable number field on the inputfield
page — the combination had no live example, which is why the slot collision went unnoticed.

---

## Iteration 5 — Icon registry

**Why:** `icon.component.ts:36` types `name` as `GogIconName`, a closed union of 20 lucide
glyphs (`shared/icons.ts:1–21`). A consumer's own icon can only be passed per instance as a
`TemplateRef` via the `template` input — there is no way to register one by name. On a real
site that means installing a second icon library, which is precisely the dependency the
"no CDK, no Material" pitch exists to avoid.

1. Add `provideGogIcons({ cart: '<svg …>' })`, merging down the injector tree the way
   `provideGogConfig` already does (`shared/config.ts:223–231` is the model to copy, including
   its `skipSelf` merge semantics).
2. Keep `GogIconName` as the autocompleted set of built-ins while widening the input to
   `GogIconName | (string & {})`, so the built-ins still autocomplete and a registered custom
   name type-checks.
3. Define the miss behaviour explicitly: render nothing and warn in dev mode, never throw.
4. Sanitisation: registered SVG must go through the same path as the built-ins — decide it
   together with 4.1, and document that the consumer's markup is trusted input.

**Done when:** the showcase registers a custom icon in `app.config.ts` and uses it via
`<gog-icon name="…">` in three unrelated components, with no `TemplateRef` in sight.

### Outcome ✅

`shared/icon-registry.ts`: `GOG_ICONS` token + `provideGogIcons(...)`, copying
`provideGogConfig`'s `skipSelf` layering so a nested registration adds to the parent set instead
of replacing it. A registered name **wins over a built-in**, which turns the registry into the
way to re-skin the library's own glyphs app-wide.

Step 2 was done by **renaming rather than widening at the call sites**: the closed union became
`GogBuiltinIconName`, and `GogIconName` is now `GogBuiltinIconName | (string & {})`. All ten
places that already used `GogIconName` for an input or config field (`gog-tag`, `gog-chip`,
`gog-tabs`, `gog-button-toggle-group`, `gog-inputfield`'s `iconStart`/`iconEnd`, `ToastConfig`,
`DialogConfig`, …) therefore accept registered names with **no edit**, and `ICON_DEFS` keeps its
exhaustive `Record<GogBuiltinIconName, string>` — a `Record` over the open type would have
collapsed to an index signature and stopped catching a missing definition.

Miss behaviour: renders nothing, warns once per name in dev mode (module-level `Set`, so a
missing icon inside a `@for` logs once, not once per row), never throws. Sanitisation stays
`bypassSecurityTrustHtml` for registered and built-in markup alike — Angular's HTML sanitizer
strips SVG outright, so there is no "sanitize it properly" option; the doc comment says plainly
that this is for static markup you authored. That also settles iteration 4's open question:
dropping `DomSanitizer` is off the table for good, since arbitrary consumer SVG requires it.

Verified in `ui-showcase`, which now registers three icons in `app.config.ts`
(`custom-icons.ts`) and renders them through `gog-icon`, `gog-tag` and `gog-chip` with no
`TemplateRef` anywhere. The third registered icon deliberately reuses the built-in name `copy`;
in the server-rendered HTML the built-in lucide glyph is gone from the page entirely, which is
the override working. 11 new specs, `gog-icon` having had none at all before.

**Follow-on, at the user's request: the built-in set went from 20 glyphs to 41.** The registry
makes any icon reachable, but a library whose built-ins cover only its own internals still sends
every consumer looking for a second icon package on day one — there was no `search`, no `trash`,
no `more-vertical`. Added 21 Lucide glyphs across actions, chrome, navigation and objects, plus
`star`/`star-filled` as the single outline/filled pair (the `checkbox`/`checkbox-checked` case:
a **toggle**, not decoration). Deliberately not a blanket solid duplicate of the set — that
doubles the payload for a distinction almost nothing needs, and the registry covers exceptions.
`ICON_DEFS` is one non-tree-shakeable object, so the cost is shared by everyone: 1.6 KB → 2.7 KB
gzipped, which is the number to weigh before adding more.

Two things surfaced while doing it:

- **The glyphs are Lucide, not Heroicons** (every one carries `class="lucide …"`), and nothing in
  the package said so — Lucide's ISC licence asks for the notice to travel with the copies. Notice
  added to `icons.ts` and the README. Worth knowing before anyone adds a glyph from elsewhere:
  Heroicons is drawn for `stroke-width` 1.5 against Lucide's 2, and mixing the two reads as uneven
  weight in a row of icons.
- **`--gog-icon-stroke-width` only reached `path`, `circle` and `rect`** — exactly the elements
  the original 20 happened to use, which is why nothing looked wrong. Icons drawn with `line`,
  `polyline` or `polygon` ignored the token entirely, including anything a consumer registers.
  Selector extended; verified in the browser by overriding the token and watching a `polygon`
  follow it from 2px to 4px.

**Found on the way — `ui-showcase.instructions.md` was wrong about how the showcase resolves the
library.** It claimed the showcase reads `@guildofgleks/ui` from `node_modules` "like any real
consumer" and prescribed copying `dist/` over the installed package before every live check. The
root `tsconfig.json` maps the name to `./dist/gleks/ui` and the showcase extends it unchanged —
`paths: {}` is cleared in **`gleks-ui-lab`**'s tsconfig, not the showcase's, and the instruction
had the two projects swapped. Proved it by serving the showcase with the published 21.3.0 in
`node_modules` (no `provideGogIcons` in it) and watching the registry work. The prescribed swap
was not merely useless: `node_modules` is shared with the lab, so it was the one thing that
could point the lab at an unreleased build — the risk the same paragraph warned about. Corrected
in `ui-showcase.instructions.md` and in the library guide's step 7.

---

## Iteration 6 — `gog-table`: outputs and lazy mode

**Why:** `table.component.ts` declares no `output()` at all — no row click, no sort change, no
page change — and sorts (`:83`) and paginates (`:125`) purely in memory over `value` (`:54`).
That is a fine data grid for a marketing page and unusable for anything backed by a server, so
today it is the component most likely to be swapped out for a competitor's, taking the
paginator and scroll with it.

1. **Outputs first** (additive, no behaviour change): `gogRowClick`, `gogSortChange`,
   `gogPageChange`. `sortState` (`:81`) and `currentPage` (`:117`) already hold exactly the
   payloads.
2. **Lazy mode:** a `lazy` input that stops the in-memory `sortedData`/`visibleRows` pipeline
   and treats `value` as the current page as given, plus `totalRecords` to drive
   `totalPages` (`:104`) instead of `value.length`. The `linkedSignal` page-clamping comment at
   `:110–116` documents the invariant that has to keep holding in lazy mode.
3. **Row selection** — single and multiple, `[(selection)]` as a `model()`, with the checkbox
   column opt-in. Deliberately after 1 and 2: it is the largest piece and the one most likely
   to want a design round of its own.
4. Keep `gog-paginator` authoritative for pagination UI; the table must not grow a second
   pagination implementation for the lazy path.

**Done when:** the showcase drives a `gog-table` from a simulated paged/sorted endpoint, and
the eager path's specs still pass untouched.

### Outcome ✅

All four steps, in the order the plan set. The eager path's 20 existing specs passed **untouched**
throughout — the lazy branches are `if (this.lazy())` early exits in `sortedData`/`visibleRows`
rather than a rewrite of the pipeline, so the in-memory behaviour is literally the same code.

- **Outputs.** `gogSortChange`, `gogPageChange`, `gogRowClick`. The one non-obvious decision:
  `gogPageChange` suppresses the page-1 reset that follows a sort. `currentPage` and `sortState`
  both change in that computation, so the effect attributes the page move to the sort and stays
  quiet — otherwise every sort on a lazy table fires two requests. `SortState` was promoted to
  the exported `GogTableSortEvent`.
- **Lazy.** `lazy` + `totalRecords`. `rowCount` (new) is the single place that answers "how many
  rows are we paginating", which is what both `totalPages` and `showTotal` now read — they used
  `value.length` in two places before. `globalRowIndex` needed no change: it was already computed
  from `currentPage` and `pageSize`, which is correct in both modes.
- **Selection.** `selectionMode` + `[(selection)]` as `T[]` in both modes, `dataKey` for identity,
  `showSelectionColumn` to opt out of the checkbox column. `dataKey` also became the `@for` track
  key, replacing `track $index` — with lazy refetches, index tracking rebuilds the whole page's
  DOM on every response.
- **`gog-paginator` stayed authoritative.** No second pagination implementation for the lazy
  path: the table only changes what it feeds `totalPages`.

Three things the work forced that the plan did not list: `interactiveRows` (a `<tr>` is not
focusable, so shipping `gogRowClick` alone would have been a mouse-only feature — the library's
own a11y bar rules that out), four new `GOG_CONFIG.labels` keys (the footer's `Total:` and the
paginator's `Table pagination` were hardcoded English), and two tokens
(`--gog-table-selected-bg`, `--gog-table-select-col-width`).

Verified live against a fake 137-row endpoint on the showcase's table page: 14 pages from a
`value` holding 10 rows, row numbers 11–13 on page 2, sorting by score asc → `1,1,2,3` and desc →
`100,100,99,98` with the page reset to 1 and `aria-sort="descending"` on the header, and a
selection made on page 1 still ticked after navigating away and back — i.e. surviving a refetch
that produced entirely new objects. 23 new specs; suite at 869.

---

## Iteration 7 — Link-flavoured button

**Why:** `button.component.html:1` always renders a native `<button>`. On a site, a large share
of buttons are navigation (`routerLink`, `href`), and wrapping `<a>` around `<gog-button>` gives
wrong semantics and a doubled focus target.

Decide the mechanism before writing code — this is the one item here with a genuine
architectural fork:

- (a) an `as="a"` / `href` / `routerLink` input trio on `gog-button` — smallest change,
  but the component starts brokering the router's whole input surface (`routerLinkActive`,
  `queryParams`, `fragment`…) and will keep growing;
- (b) a `gogButton` **directive** applying the same classes to a consumer-owned
  `<a>`/`<button>` — no input brokering at all, the consumer keeps the native element and its
  directives, and it matches the "headless primitive" axis `api-design.instructions.md` already
  ranks above "add an input". Costs a second way to spell a button.

Recommendation: (b), with `gog-button` kept as-is and re-documented as the convenience form.

**Done when:** a `routerLink` CTA is expressible with correct semantics, one focusable element,
and the same visuals as `<gog-button>` in all variants and sizes.

### Outcome ✅

Option **(b)**, the `[gogButton]` directive — and the fork turned out to be less balanced than the
plan assumed. Option (a) does not just risk brokering the router's input surface: it *requires*
`@angular/router` as a fifth peer dependency, which breaks every app without a router and
contradicts the footprint the package advertises. That settled it.

The mechanism has a precedent in the library that made it cheap: `gogBadge` is already a
directive that styles a consumer's element, and its CSS already lives in the global
`utilities.css` for exactly the reason encapsulation forces. So the work was:

1. Move the `.gog-btn*` block out of `button.component.scss` into `styles/button.css`
   (`index.css` imports it). The SCSS turned out to be plain CSS already — 184 lines, no nesting,
   no literals, every value a token — so it moved verbatim. The component keeps only its two
   `:host` rules, which the directive has no equivalent of.
2. `GogButtonDirective` with `variant`, `size` (with the `GOG_CONFIG.control.size` fallback) and
   `fullWidth` as a `booleanAttribute`. Selector `a[gogButton], button[gogButton]` rather than a
   bare attribute — on a `<div>` the result would look clickable and be invisible to the keyboard.
3. `--full-width` needed its own class: the component achieves it through `:host`, and the
   directive has no wrapper.

**A defect the move exposed:** `.gog-btn` never reset `text-decoration`, because a `<button>` has
none. The moment the same block landed on an `<a>`, every link-button came out underlined. Fixed
in `button.css`.

**Also extended `check:tokens`.** Moving CSS to `styles/` would have taken the button out of the
token contract, which only scanned `lib/**/*.scss` plus a hardcoded `utilities.css`. It now walks
`styles/*.css` as a directory, so any future global stylesheet is covered automatically — 34
stylesheets checked before, 38 now, and `utilities.css` stopped being a special case.

Verified live: a `routerLink` anchor navigates in-app without a page load (`/buttons` → `/table`
→ back), the external link keeps its `target`/`rel`, `text-decoration` computes to `none` on all
four, and an isolated directive anchor measures exactly the component's 44 px. (An earlier 47 px
reading was flex-stretch in the showcase row, which affected the real `<button gogButton>` in the
same row identically — a measurement artefact, not a discrepancy.) 12 new specs; suite at 897.

---

## Backlog — deliberately not in this plan

- **`theme.css` payload.** 92 596 B / 16 817 B gzip is loaded whole even by an app importing
  three components. Splitting it per component would break the "one stylesheet, one import"
  setup story that iteration 1 is busy making work, and the gzip figure does not justify that
  trade yet. Revisit only if the file keeps growing.
- **Secondary entry points** (`@guildofgleks/ui/table`, …). The FESM bundle is a single 1 MB
  file, but `sideEffects: false` plus ESM means consumers only pay for what they import, so
  this buys build ergonomics rather than bytes.
- **`(click)` vs `(gogClick)` on `gog-button`.** A native click bubbles from the inner
  `<button>` to the host, so a consumer writing `(click)` silently bypasses the debounce guard.
  Worth a README warning now; a real fix means stopping propagation, which is its own trap.
- **RTL coverage.** Nine component stylesheets already use logical properties; a full audit is
  its own piece of work with its own verification story.
- **`DIALOG_DATA` typing.** `dialog.tokens.ts:3` is `InjectionToken<unknown>`, so every dialog
  component casts on injection. A generic `DialogService.open<TData, TResult>()` threading the
  type through would be nicer, but the cast is a one-liner and Material has the same wart.
- ~~**No clear button on a `type="number"` field.**~~ Fixed — see "Follow-ups" below.
- ~~**`gog-paginator`'s per-page labels.**~~ Fixed — see "Follow-ups" below.
