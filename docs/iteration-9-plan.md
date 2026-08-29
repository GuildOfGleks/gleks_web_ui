# Iteration 9 — eight new components

Requested directly: the Angular Material components worth having here. Unlike iterations 1–8,
this is **new capability**, not correction of existing design — so it lands under the same
in-progress `21.3.0` heading in `CHANGELOG.md`, but as `### Added` only. Nothing existing
changes shape.

Scope decided with the user before writing this:

| Component          | Shape chosen                            | Rejected alternative                   |
| ------------------ | --------------------------------------- | -------------------------------------- |
| `gog-datepicker`   | single date **+ range + time**          | date-only                              |
| `gog-autocomplete` | own component on `GogDropdownBase`      | an `editable` mode inside `gog-select` |
| `gog-tabs`         | projected `<gog-tab>` children          | `[tabs]` array + one context template  |
| `gogBadge`         | **directive** on someone else's element | a `<gog-badge>` component              |

The last three are api-design calls, not taste. `gog-select` is already at the input count
where `api-design.instructions.md` says to stop and re-read it, so a second identity inside it
was the wrong axis. `gogBadge` as a component would have been `gog-tag` with a different
radius — a parallel public API for one visual difference. Tabs carry arbitrary markup per tab,
which is axis 2 (a slot), not axis 4 (an input).

**`gog-autocomplete` closes iteration 8 §3c.** The deferred "lookup mode" — typing into the
trigger rather than into a panel filter — is exactly this component. `gog-select` keeps its
in-panel filter unchanged; the two stay separate controls with separate jobs.

---

## Status

| #   | Item                                              | State |
| --- | ------------------------------------------------- | ----- |
| 0   | Shared prerequisites (roving focus, icons, types) | ✅    |
| 1   | `gog-divider`                                     | ✅    |
| 1   | `gogBadge`                                        | ✅    |
| 1   | `gog-progressbar`                                 | ✅    |
| 1   | `gog-toggle`                                      | ✅    |
| 2   | `gog-button-toggle-group`                         | ✅    |
| 2   | `gog-tabs` / `gog-tab`                            | ✅    |
| 3   | `gog-autocomplete`                                | ✅    |
| 4   | `gog-datepicker`                                  | ✅    |
| 5   | Showcase pages + live verification                | ✅    |
| 6   | Tokens, public API, CHANGELOG, CI                 | ✅    |

Update this table as each lands, per the convention in `docs/refactor-21.3.0.md`.

---

## Outcome ✅

All eight shipped, plus `gog-calendar` as a ninth exported component (the datepicker's month
grid, usable on its own — `inline` mode is literally it). **742 specs, up from 476**; lint,
`check:tokens`, `build:lib` and `build:showcase` all clean.

Eight showcase pages with routes and nav entries, verified live in the browser.

### Two deviations from the plan above

**1. The tabs indicator is a pseudo-element, not a slid element.** The plan called for one
element transitioned between header positions. That needs the active header's measured
geometry, and measuring it here did not work: the header row is projected into `<gog-scroll>`,
and neither the `viewChildren` the measurement depended on nor a DOM-query rewrite of it ever
produced a value — live, the indicator simply never appeared. Replaced with an `::after` on
`.gog-tabs__tab--active`: always in the right place by construction, no JavaScript, correct
during SSR. Verified in the browser as a 2px accent bar matching the active header's width
exactly (88.4px → 129.6px on switching) and absent on inactive ones. The slide is gone; a
correct indicator is worth more than an invisible animated one.

**2. `check:tokens` now also scans `styles/utilities.css`.** Not in the plan, but `gogBadge`
styles itself from there — as `gog-collapsible` already did — so that whole surface was
unchecked by the token contract. It caught two unregistered instance-layer tokens on the first
run, which is exactly the class of silent failure it was added for.

### Three defects the work surfaced, each fixed

- **`gog-calendar` fought its own navigation.** The "open on the selected month" effect tracked
  `viewMonth`, so every page re-ran it, saw the month no longer matched the anchor, and snapped
  back — next/previous and PageUp/PageDown all appeared to do nothing. `viewMonth` is now read
  `untracked`.
- **`gog-datepicker` left the field empty after a pick.** The "don't overwrite while typing"
  guard was keyed on focus, and picking a date hands focus _back_ to the field — so the new
  text was refused. Now keyed on an explicit `isEditing` flag.
- **`gog-autocomplete` threw in a microtask.** `scrollIntoView` was called unguarded from a
  `queueMicrotask`; on a host without it the exception was unhandled and failed the whole test
  run rather than one line. Feature-detected now.

### Follow-up — the "Today" button did the wrong thing

Reported from use: the footer's single **Today** button only paged the _view_ to the current
month, while everyone who pressed it expected it to _select_ today — which is what PrimeNG and
most calendars do, and the reason the expectation is so strong.

Split into two, because no wording makes one button unambiguous: after paging away, the same
label reads as "take me back" to one person and "set it to today" to another.

- `showTodayButton` (on by default) — **Today** selects today's date. The view follows for free:
  the selection is the anchor the calendar opens on, so there is nothing to navigate separately.
  Disabled when `min`/`max` or `disabledDates` rule today out, rather than silently doing
  nothing.
- `showThisMonthButton` (off by default) — **This month** moves only the view and leaves the
  selection alone, for browsing far from today without committing.

Labels via `todayLabel` / `thisMonthLabel`. Behaviour change, but the component is unreleased,
so no deprecation window applies. 742 specs (was 733).

Verified live: after paging to October, **Today** set the value to today and closed the panel;
**This month** moved August 2025 → August 2026 with the panel still open and the field still
empty; with `min` a year out, **Today** was disabled while **This month** stayed usable.

### Verified live, closing the previous gap

The datepicker's **range** interaction — left unverified in the browser first time round — now
checked end to end: two months side by side, the first click sets the start and keeps the panel
open, hovering previews the span (9 highlighted cells), and the second click closes it with
`10.08.2026 — 18.08.2026` in the field.

---

## Iteration 0 — shared prerequisites

These come first because three of the eight need them, and writing them per-component is
exactly the duplication `api-design.instructions.md`'s rule of three forbids.

1. **Horizontal roving focus.** `lib/shared/roving-focus.ts` handles only
   `ArrowDown`/`ArrowUp`/`Home`/`End` — it was written for the vertical option lists in
   `GogDropdownBase`. `gog-tabs` and `gog-button-toggle-group` are horizontal by default and
   need `ArrowLeft`/`ArrowRight`, plus vertical when their `orientation` says so.

   Extend rather than fork: add an `orientation` parameter to `handleRovingFocusKeydown`,
   defaulting to `'vertical'` so every existing caller is untouched. `Home`/`End` stay
   orientation-independent. This keeps one implementation of the wrap-around arithmetic.

   Also needed by tabs and the toggle group but absent today: **skipping disabled items**.
   The dropdowns never had disabled targets in their roving list, so the helper walks to the
   next index blindly. Add an optional predicate; without it, behaviour is unchanged.

2. **Four icons** in `lib/shared/icons.ts` (Lucide, matching the existing 15):
   `calendar`, `chevron-left`, `chevron-right`, `clock`. `GogIconName` is a union derived
   from `ICON_DEFS`, so adding a key is all that is needed.

3. **Types** in `lib/shared/types.ts` — the closed enums the new components take. Naming
   follows the existing entries (`Gog<Component><Concept>`):
   `GogOrientation` (shared: `'horizontal' | 'vertical'`), `GogDividerVariant`,
   `GogBadgePosition`, `GogProgressbarMode`, `GogButtonToggleAppearance`,
   `GogTabsAlign`, `GogDateSelectionMode`, `GogHourFormat`.

   `gog-radio-group` and `gog-slider` already declare their own inline
   `'horizontal' | 'vertical'`. Introducing `GogOrientation` and pointing the new components
   at it is the third occurrence — extract per the rule of three, and re-point the two
   existing ones (a type alias, so not a breaking change).

**Done when:** `roving-focus.spec.ts` covers both orientations and the disabled-skipping
predicate, existing specs pass untouched, and the four icons render in the showcase.

---

## Iteration 1 — the four small ones

Grouped because none has a dependency and each is a single stylesheet plus a handful of
signals. Done together so the token block, README table and showcase page all land in one pass.

### `gog-divider`

```html
<gog-divider />
<gog-divider orientation="vertical" />
<gog-divider>OR</gog-divider>
```

- `orientation` (`GogOrientation`, `'horizontal'`), `variant` (`'solid' | 'dashed' | 'dotted'`),
  `inset` (boolean — indents to align with list text, as Material's `inset` does).
- Projected content becomes a centred label with the rule running through it. No `label`
  input: it is content, so it is `<ng-content>` (axis 2 before axis 4).
- Renders `role="separator"` with `aria-orientation`; decorative when it has a label, since
  a labelled divider is a heading-ish landmark rather than a pure separator.
- Tokens: `--gog-divider-{color,thickness,style,spacing,inset,label-gap,label-color,label-font-size}`.

### `gogBadge` (directive)

```html
<gog-button gogBadge="12" badgePosition="top-end">Inbox</gog-button>
<gog-icon name="info" gogBadge badgeDot />
```

- A **directive**, so it overlays any host without wrapping it — that is the whole reason it
  is not a component. Sets `position: relative` on the host and renders its own absolutely
  positioned element.
- `gogBadge` (the value: `string | number | null`), `badgePosition` (`GogBadgePosition`:
  `'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'`, default `'top-end'`),
  `badgeVariant` (reuses `GogTagVariant`), `badgeDot` (no value, just a marker),
  `badgeMax` (default `99` — renders `99+` beyond it), `badgeHidden`.
- **Hides itself when the value is `0`, `null` or `''`** unless `badgeDot`. A badge showing
  "0" is the most common bug in this component class.
- Accessibility: the badge text is not announced by default — it renders `aria-hidden` and
  the directive appends a visually-hidden `aria-label` fragment describing it, so a button
  reads as "Inbox, 12 unread" rather than "Inbox12". Wording via
  `badgeAriaLabel`.
- Tokens: `--gog-badge-{bg,color,size,dot-size,font-size,font-weight,radius,offset,border-*}`.

### `gog-progressbar`

```html
<gog-progressbar [value]="42" />
<gog-progressbar mode="indeterminate" />
<gog-progressbar [value]="42" [buffer]="70" mode="buffer" />
```

- `value` (0–100, clamped), `mode` (`GogProgressbarMode`:
  `'determinate' | 'indeterminate' | 'buffer'`), `buffer`, `variant` (`GogTagVariant` again —
  same semantic colour set), `size` (`GogSize`), `showValue` (renders `42%` inside/next to
  the bar), `ariaLabel`.
- `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, and **no
  `aria-valuenow` at all in indeterminate mode** (that is what tells AT it is indeterminate).
- The indeterminate animation must be disabled under `prefers-reduced-motion` — a
  continuously moving bar is exactly what that media query exists for. Falls back to a static
  striped fill.
- Tokens: `--gog-progressbar-{track-bg,fill-bg,buffer-bg,height,radius,duration,label-*}` plus
  a per-size height scale.

### `gog-toggle`

The user's framing: a checkbox, but unmistakably an on/off switch.

```html
<gog-toggle label="Notifications" [(checked)]="on" />
<gog-toggle formControlName="darkMode" labelPosition="start" />
```

- Modelled on `CheckboxComponent` — same `ControlValueAccessor`-through-`NgControl`
  registration, same `[(checked)]` model, same `GOG_CONFIG.control.size` resolution, same
  `fullWidth` host class. A native `<input type="checkbox" role="switch">` underneath, so
  keyboard, forms and AT come from the platform.
- `label`, `ariaLabel`, `size`, `disabled`, `fullWidth`, `labelPosition` (`'start' | 'end'`,
  default `'end'`), `onLabel` / `offLabel` (optional text rendered _inside_ the track, the one
  thing a checkbox genuinely cannot do).
- `role="switch"` + `aria-checked` is the whole reason this exists next to `gog-checkbox`:
  it announces as "switch, on" rather than "checkbox, checked".
- Reuses `GOG_CHECKABLE_CONTROL_SIZE_MAP` where the scale matches; adds
  `--gog-toggle-{track-*,thumb-*}` for what is genuinely new.

**Done when:** four spec files pass, `check:tokens` green, all four visible on their showcase
pages in both themes.

---

## Iteration 2 — the two grouped controls

Both are roving-focus containers with a selected child. Built after iteration 0 for that
reason, and together because they share the same keyboard contract.

### `gog-button-toggle-group`

The user's definition: a row of buttons where one (or several) can be picked.

```html
<gog-button-toggle-group [(value)]="align" [options]="alignOptions" />

<gog-button-toggle-group [(value)]="tools" [multiple]="true" [options]="toolOptions" />
```

- **Options-driven with accessors, not a hardcoded DTO** — `api-design.instructions.md` is
  explicit about this, and `GogRadioOption { id, label }` is the shape not to repeat:

  ```ts
  readonly options = input<TOption[]>([]);
  readonly optionLabel = input<GogOptionAccessor<TOption, string>>('name');
  readonly optionValue = input<GogOptionAccessor<TOption, unknown> | null>('id');
  readonly optionDisabled = input<GogOptionAccessor<TOption, boolean>>('disabled');
  readonly optionIcon = input<GogOptionAccessor<TOption, GogIconName | null> | null>(null);
  ```

  Reuses `lib/shared/option-accessor.ts` (`readOption`, `isSameOptionValue`) — the same
  resolver `gog-select` uses, so an app's DTO flows through both identically.

- `multiple` (default `false`). Single mode emits the value; multiple emits an array. `value`
  is a `model` for `[(value)]`, plus `ControlValueAccessor` so it works in Reactive Forms.
- `appearance` (`GogButtonToggleAppearance`: `'joined' | 'separated'`, default `'joined'` —
  Material's segmented look versus discrete buttons), `size`, `orientation`, `disabled`,
  `fullWidth`, `ariaLabel`.
- A **slot** for the button content, not an icon-input family:
  `<ng-template gogButtonToggleOption let-option let-selected="selected">`.
- ARIA: `role="group"` with `aria-pressed` per button in multiple mode; `role="radiogroup"`
  with `aria-checked` in single mode. These are genuinely different widgets to AT and getting
  it wrong is the usual bug here.
- Keyboard: roving tabindex — one tab stop for the group, arrows move _and_ select in single
  mode (radio semantics), arrows move only + Space toggles in multiple mode.

### `gog-tabs` / `gog-tab`

```html
<gog-tabs [(activeIndex)]="index" align="start">
  <gog-tab label="Profile">
    <app-profile />
  </gog-tab>

  <gog-tab label="Settings" iconName="info" [disabled]="!canEdit">
    <ng-template gogTabContent>
      <!-- built only when this tab is first shown -->
      <app-settings />
    </ng-template>
  </gog-tab>
</gog-tabs>
```

- `gog-tab` is a **content child, not a rendered component** — it declares `label`,
  `iconName`, `disabled`, and holds its content. `gog-tabs` reads them with
  `contentChildren(TabComponent)`.
- **Two content modes, deliberately.** Plain projected markup renders eagerly and is merely
  hidden when inactive (correct for cheap content, and keeps DOM state such as scroll
  position and un-submitted input). An `<ng-template gogTabContent>` inside the tab is built
  on first activation and kept alive after — the escape hatch for an expensive subtree.
  Which one you get is decided by whether the template is present; no `lazy` input.
- `gog-tabs` inputs: `activeIndex` (`model<number>`), `align` (`GogTabsAlign`:
  `'start' | 'center' | 'end' | 'stretch'`), `orientation`, `size`, `fullWidth`,
  `ariaLabel`. Output `gogTabChange`.
- A **slot for the tab header**: `<ng-template gogTabHeader let-tab let-active="active">`,
  typed context, per axis 2 — that is how a consumer puts a badge or a close button in the
  header without a new input.
- ARIA is the substance here: `role="tablist"` / `role="tab"` / `role="tabpanel"`, with
  `aria-selected`, `aria-controls`/`aria-labelledby` pairing, `tabindex="-1"` on inactive
  tabs, and the panel focusable so keyboard users can reach the content.
- **Overflow**: the header scrolls horizontally when the tabs don't fit. Per
  `styling.instructions.md` this must be a `<gog-scroll axis="horizontal" size="thin">`, not
  a raw `overflow-x: auto` — a native scrollbar is the one strip of chrome the theme cannot
  reach. Chevron affordances at either end when scrollable.
- The active-tab indicator is a single element transitioned between positions rather than a
  border per tab, so it slides; disabled under `prefers-reduced-motion`.

**Done when:** both keyboard contracts pass specs, the lazy template builds exactly once,
tabs overflow correctly at a narrow width in the browser (jsdom cannot show this).

---

## Iteration 3 — `gog-autocomplete`

```html
<gog-autocomplete
  [options]="users"
  optionLabel="profile.fullName"
  [optionValue]="null"
  [(value)]="user"
  (gogSearch)="load($event)"
  [loading]="loading()"
/>
```

Extends `GogDropdownBase<TValue, TOption>`, which already supplies open/close, placement, the
append-to-body overlay with theme copying, click-outside, `ControlValueAccessor`, the option
accessors, float label, clearable and error state. What this component adds:

1. **The trigger is a real `<input>`.** Everything else in the family uses a `div` or
   `button` with `role="combobox"`; here the input _is_ the combobox
   (`role="combobox"` + `aria-autocomplete="list"` + `aria-activedescendant`), which is the
   pattern AT expects and the reason this is a separate component.
2. **`gogSearch` output, debounced** — `searchDebounce` (default 300 ms) so a server-backed
   consumer isn't hammered per keystroke. Debounce is a TypeScript-side timing knob, so it is
   also a `GOG_CONFIG.autocomplete.debounce` field per the config rule.
3. **`filterLocal`** (default `true`): filter the given `options` in the browser. Set it
   `false` when `gogSearch` already returns a filtered list from the server — otherwise the
   local pass filters the server's answer a second time, which is the classic
   double-filtering bug.
4. `minLength` (default `1`) before the panel opens, `loading` (renders `gog-spinner` in the
   trailing slot), `emptyMessage`, `forceSelection` (default `true` — clears free text that
   matches nothing on blur; `false` keeps it, for a create-as-you-type flow).
5. Reuses `gogDropdownOption` for the option row and `gogDropdownChevron`. No new slot
   vocabulary.

**Risk to watch:** `GogDropdownBase` currently assumes the trigger is not itself a text
input — its `keydown.space` handler toggles the panel. That must not swallow a space typed
into the field. Check `dropdown-base.ts`'s key handling before subclassing, and override
rather than duplicate.

**Done when:** typing filters, arrows move `aria-activedescendant` without moving DOM focus,
Enter picks, Escape closes and restores the selected label, and a server-backed showcase demo
with `filterLocal=false` works against a fake delayed source.

---

## Iteration 4 — `gog-datepicker`

The largest by a wide margin; its own iteration for that reason.

```html
<gog-datepicker [(value)]="date" label="Date of birth" [max]="today" />

<gog-datepicker selectionMode="range" [(value)]="range" />

<gog-datepicker selectionMode="range" [showTime]="true" hourFormat="24" [(value)]="range" />
```

### Data shape

```ts
export interface GogDateRange {
  start: Date | null;
  end: Date | null;
}

type GogDatepickerValue = Date | GogDateRange | null;
```

Native `Date`, no date library and no `DateAdapter` abstraction. Material needs an adapter
because it supports Moment/Luxon/date-fns backends; this library has zero runtime
dependencies and `"sideEffects": false`, and pulling one in for a single component would be
the largest dependency decision the package has ever made. `Intl.DateTimeFormat` covers
formatting and localisation, ships in every supported browser, and is SSR-safe.

**`locale` and `firstDayOfWeek` are inputs with `Intl`-derived defaults**, and both belong in
`GOG_CONFIG.datepicker` — an app sets its locale once, not per field. This is precisely the
"realistically repeated on every instance" test from `api-design.instructions.md`.

### Inputs

- Value/selection: `value` (`model`), `selectionMode` (`GogDateSelectionMode`:
  `'single' | 'range'`), `min`, `max`, `disabledDates` (a predicate `(d: Date) => boolean`, not
  an array — an array cannot express "weekends"), `defaultMonth`.
- Time: `showTime`, `hourFormat` (`GogHourFormat`: `'12' | '24'`), `minuteStep`,
  `showSeconds`.
- Presentation: `format` (display format for the field), `placeholder`, `label`, `size`,
  `disabled`, `fullWidth`, `clearable`, `floatLabel`, `errorMessage`, `errorDisplay`,
  `appendToBody`, `inline` (renders the calendar without a field — the "always visible"
  mode), `showTodayButton`, `showClearButton`, `numberOfMonths` (1 or 2; two is what makes a
  range picker usable).
- Text input: `allowTextInput` (default `true`) with `parse` fallback — typed dates are
  parsed against `format`, and an unparseable value is a validation error rather than a
  silent reset.

That is past the ~15-input line `api-design.instructions.md` warns about, and deliberately so:
this is three widgets (date, range, time) behind one selector because the user asked for one
component. The mitigation is that **the calendar is a separate inner component**
(`gog-calendar`, exported) — the field is the wrapper, the calendar is usable standalone and
carries the selection inputs, so neither piece alone is unreadable. `inline` mode is literally
just the calendar rendered without the field.

### Structure

```
components/datepicker/
  datepicker.component.{ts,html,scss,spec.ts}   the field + panel
  calendar/calendar.component.{ts,html,scss,spec.ts}   month grid, standalone-usable
  date-utils.ts                                  pure helpers, unit-tested directly
```

`date-utils.ts` holds every date calculation as a pure function — `startOfDay`, `addMonths`,
`buildMonthGrid`, `isSameDay`, `clampToRange`, `isInRange`. Kept out of the component so the
arithmetic is testable without a fixture, and so a range calculation is written once rather
than once per mode.

### The parts that actually bite

- **Timezone/DST.** All comparisons go through `startOfDay` on local time; never compare
  `Date` objects directly, and never round-trip through `toISOString()` (that shifts to UTC
  and moves the date across the boundary for anyone east or west of it). This is the single
  most common defect in a datepicker and the reason the helpers are pure and separately
  tested.
- **Panel reuse.** The panel is positioned with `dropdown-position.ts` and, when
  `appendToBody`, attached via `GogDropdownOverlay` so it copies `data-theme` from a scoped
  subtree — mandated by `styling.instructions.md`, and a `--portal` block must redeclare every
  token the calendar reads.
- **Keyboard**, per the ARIA grid pattern: arrows move by day, `PageUp`/`PageDown` by month
  (`Shift` + them by year), `Home`/`End` to week bounds, Enter/Space select, Escape closes and
  returns focus to the field. The month grid is a `role="grid"`, not a list of buttons.
- **A month grid is not roving focus.** It is two-dimensional, so it does not reuse
  `roving-focus.ts` — that helper stays one-dimensional rather than being generalised into
  something neither caller wants.
- Scrollable areas (the year picker) wrap in `gog-scroll`, per the styling contract.

**Done when:** `date-utils.spec.ts` covers DST boundaries and month-length edges (Feb 29,
31→30 day clamping when changing month), the range mode highlights correctly while hovering
mid-selection, time changes preserve the selected day, and the panel is verified in the
browser in both inline and append-to-body modes.

---

## Cross-cutting definition of done

Per `gleks-ui-library.instructions.md` step 1–8, for every component above:

1. `lib/components/<name>/` with external template and styles, OnPush, `gog` selector prefix.
2. Exported from `src/public-api.ts` — including every directive, context interface and type.
3. Tokens declared in `styles/theme.css` in the **correct block** (literal → `:root`;
   contains `var(` → `:root, [data-theme]`), no literal fallbacks in component SCSS,
   `npm run check:tokens` green. `npm run generate:tokens` regenerates `GogTokenName` and the
   README table.
4. WCAG AA: `:focus-visible` on everything interactive, correct ARIA roles,
   `prefers-reduced-motion` honoured by every animation.
5. Vitest specs covering input defaults, class mapping, output emission, disabled state and
   a11y attributes.
6. `ng build @gleks/ui` clean.
7. A showcase page per component, route registered, verified live in the browser — the
   layout-dependent ones (tabs overflow, datepicker panel, badge positioning) **cannot** be
   verified in jsdom.
8. `CHANGELOG.md` under the existing `## [21.3.0] - planned` heading, `### Added`.

And rule 9: the agent never publishes and never touches the version.

## Deliberately not in this iteration

- **Month/year-only picker modes** (`selectionMode="month"`) — additive later, no cheaper now.
- **Multiple-date selection** (a set of unrelated days). Range covers the asked-for case.
- **Vertical tabs with the panel beside the list** — `orientation` is planned in the API, but
  the polished side-by-side layout is a second pass.
- **`gogBadge` on arbitrary text spans** — supported, but the offset tokens are tuned for
  buttons and icons; anything else may need per-instance token overrides.
- `gleks-ui-lab` documentation, per the standing rule: it tracks the published package, so it
  gets these only after the user cuts the release.
