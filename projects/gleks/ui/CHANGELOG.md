# Changelog

All notable changes to `@guildofgleks/ui` are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project has not yet
reached 1.0, so breaking changes may land in minor versions.

## [21.3.1] - planned

### Added

- **`gog-autocomplete`: `openOnFocus`.** Focusing the field now opens the panel immediately with
  the full option list, ignoring `minLength` — the common "browse everything, then narrow it
  down" pattern a plain type-ahead can't offer. On by default; turn it off (or set
  `GOG_CONFIG.autocomplete.openOnFocus = false`) to keep the previous behaviour of nothing
  showing until enough has been typed. The list stays unfiltered even when the field already
  displays a previously-selected label, and normal filtering resumes on the first keystroke.
- **`gog-autocomplete`: `gogLoadMore`.** Fires once the panel is scrolled to the end of the
  option list — the signal to fetch and append another page, instead of handing a huge or
  server-backed source over up front (500,000 rows loaded 20 at a time, not all at once).
  Forwarded from the panel's own `gog-scroll`.
- **`gog-tabs`: `scrollActiveIntoView`.** With an overflowing header row, selecting a tab —
  by click, the arrow keys, or a consumer setting `activeIndex` directly — now scrolls the
  header so the active tab stays in view, centered where there's room so its neighbours on
  both sides stay visible too. The same "show what's around the current position" idea
  `gog-paginator` already uses for pages. On by default; instant on first render, smooth (or
  instant under `prefers-reduced-motion`) after. Turn it off to own the scroll position
  yourself.
- **`gog-tabs`: `showScrollTrack`; `gog-scroll`: `showTrack`.** With `scrollActiveIntoView`
  driving the header's scroll position, its own draggable thumb/track next to the active-tab
  underline read as two conflicting position indicators for the same thing — confusing rather
  than helpful, per feedback on the first cut of `scrollActiveIntoView`. `gog-tabs` now hides
  the track by default while `scrollActiveIntoView` is on, and shows it by default once that's
  off (the only way left to reach an off-screen tab by mouse); either can be pinned explicitly
  with `showScrollTrack`, regardless of the other. Native scrolling — wheel, touch, keyboard,
  and any programmatic `scrollTo`/`scrollIntoView` — is unaffected either way; only the visual
  affordance is gone. The underlying toggle lives on `gog-scroll` itself as `showTrack`
  (instance input, or app-wide via `GOG_CONFIG.scroll.showTrack`), so any other panel built on
  it gets the same option.
- **`gog-textarea`: `resize`.** Which direction(s) the field's own drag handle resizes it in —
  `'vertical'` (the default, matching a plain `<textarea>`), `'horizontal'`, `'both'`, or
  `'none'` to remove it entirely. Settable app-wide via `GOG_CONFIG.textarea.resize`. The
  handle itself is also restyled: the browser's native glyph is barely visible at a glance, so
  it's blanked out (`::-webkit-resizer`, where that's even stylable — Firefox never exposed a
  hook for its own) and replaced with two short diagonal strokes in the field's own border
  colour, sized and positioned to sit inside the border rather than past it. A `ResizeObserver`
  on the field keeps the grip glued to its actual corner as it's dragged narrower/shorter than
  its container (`'horizontal'`/`'both'`) — it's anchored to the container, not the field
  itself, since a `<textarea>` can't reliably host `::after`. The drag stays entirely native;
  only the glyph and its tracking are new.
- **`gog-inputfield`: number spin buttons.** A `type="number"` field now gets the library's own
  increment/decrement buttons instead of the browser's native ones, which render inconsistently
  across Chromium/Firefox/Safari and were never themed. Flush against the field's own border as
  one grouped stepper (a divider on each side), not floating loose in the icon gutter. Steps by
  `step` (default `1`), clamps to `min`/`max`, and disables the button at whichever boundary is
  reached. Arrow-key stepping on the focused field is untouched — that's native
  `<input type="number">` behaviour, unrelated to which glyphs are visible. `showSpinButtons`
  turns them off entirely (native glyphs never come back — off means no stepper UI at all);
  settable app-wide via `GOG_CONFIG.inputfield.showSpinButtons`.
- **`gog-icon`: `copy`.** A new glyph for the common "copy this field's value" trailing-action
  pattern (see the inputfield showcase page for a full example built on `gogInputAddonEnd`).

### Fixed

- **`gog-scroll`: thumb too small to reliably click, especially at `size="thin"`.** The
  thumb's own visible box is exactly as wide as `size` says — that part is unchanged — but its
  clickable/draggable _region_ now extends a few pixels past every edge
  (`--gog-scroll-thumb-hit-padding`, bigger on `thin`, where the visible thumb was hardest to
  land a cursor on), so a near-miss click still grabs the thumb instead of falling through to
  the track, which pages the view rather than dragging. Purely an invisible hit-area change —
  no new input, no behaviour change for the mouse wheel, which already worked fine.
- **`gog-autocomplete`: option rows spilling out of the panel.** The panel's `.gog-scroll` was
  never actually constrained to `--gog-autocomplete-panel-max-height` — a classic flexbox trap
  where a `max-height`-only container doesn't give its flex-grow children a definite size to
  shrink into, so the option list rendered at full content height and visibly overflowed past
  the panel's own border into whatever sat below it. Most visible with `appendToBody` and a
  longer list (typing narrowed it back under the cap, masking the issue until the panel was
  reopened with more matches, which also made it look like "the panel closes on its own" — it
  hadn't; the list had just spilled out from under it). Fixed by giving the panel the same
  `display: flex` + `flex: 1; min-height: 0` chain `gog-select` and `gog-multiselect` already
  use, plus a defensive `overflow: hidden`.

## [21.3.0] - 08.08.2026

### Added

- **Eight new components**, the Angular Material set this library was missing:

  - **`gog-datepicker`** — a date field with a calendar panel: single date, `selectionMode="range"`
    (with `numberOfMonths` for a two-month view), and an optional clock via `showTime` /
    `hourFormat` / `minuteStep` / `showSeconds`. `min`, `max` and a `disabledDates` **predicate**
    (an array cannot express "weekends"), `inline` for an always-visible calendar, `allowTextInput`
    with parsing, plus the usual `clearable` / `floatLabel` / `errorMessage` / `appendToBody`.

    The panel's footer carries **two separate actions**, never one: `showTodayButton` (on by
    default) _selects_ today, and `showThisMonthButton` (off by default) only moves the view back
    to the current month. A single button doing both is ambiguous — after paging away, the same
    label reads as "take me back" to one person and "set it to today" to another. "Today" is
    disabled when `min`/`max` or `disabledDates` rule today out, rather than silently doing
    nothing. Wording via `todayLabel` / `thisMonthLabel`.

    Native `Date`, **no date library and no adapter abstraction** — the package keeps its zero
    runtime dependencies. `Intl` supplies month and weekday names; the display format is a token
    pattern (`dd.MM.yyyy`, `yyyy-MM-dd`, …) used for _both_ rendering and parsing, so what is
    written can always be read back. `31.02.2026` is rejected rather than silently becoming
    3 March. `locale`, `firstDayOfWeek` and `format` are also settable app-wide through
    `GOG_CONFIG.datepicker`.

  - **`gog-calendar`** — the month grid behind it, exported and usable on its own. Follows the
    ARIA grid pattern: arrows by day, `PageUp`/`PageDown` by month, `Shift` + those by year,
    `Home`/`End` to the week's ends, and one tab stop across all 42 cells. Always six weeks, so
    the calendar's height never changes as you page through months.
  - **`gog-autocomplete`** — a text field that suggests options as you type, on the same
    `GogDropdownBase` as `gog-select` and taking the same `optionLabel` / `optionValue` /
    `optionDisabled` accessors. The trigger is a real `<input>`, which is what makes it a separate
    control rather than a mode of `gog-select`: focus never leaves the field and the highlighted
    row is pointed at with `aria-activedescendant`. `gogSearch` is debounced (`searchDebounce`,
    300 ms) for a server-backed source, and `[filterLocal]="false"` stops that server's answer
    being filtered a second time. Plus `minLength`, `loading`, `emptyMessage` and
    `forceSelection`.
  - **`gog-tabs` / `gog-tab`** — a tablist over projected children, each tab declaring its own
    `label`, `iconName` and `disabled`. Content written inside a tab renders eagerly and is
    merely hidden while inactive, so scroll position and half-typed input survive a switch; an
    `<ng-template gogTabContent>` is instead built on first activation and kept alive after.
    Which you get is decided by whether that template is present. `gogTabHeader` replaces the
    header button entirely. Overflowing headers scroll inside a `<gog-scroll>`, not a native
    `overflow-x`.
  - **`gog-button-toggle-group`** — a row of buttons where one, or with `multiple` several, can
    be picked. Options-driven with the same accessors as the dropdowns, plus `optionIcon` and a
    `gogButtonToggleOption` slot. Single and multiple are genuinely different widgets to
    assistive tech and are exposed as such: `role="radiogroup"`/`aria-checked` with arrows that
    move _and_ select, versus `role="group"`/`aria-pressed` with arrows that only move.
    `appearance` picks between one segmented control and discrete buttons.
  - **`gog-toggle`** — an on/off switch. A native `<input type="checkbox">` carrying
    `role="switch"`, so it announces as "switch, on" rather than "checkbox, checked" while the
    platform keeps owning the keyboard and forms. `onLabel` / `offLabel` render _inside_ the
    track — the one thing a checkbox cannot do — and both stay in the DOM so the track's width
    cannot jump as it flips. Shares `gog-checkbox`'s size scale.
  - **`gog-progressbar`** — determinate, indeterminate and buffer modes, five sizes and the
    semantic colour set. `value` and `buffer` are clamped to 0–100 rather than trusted.
    Indeterminate reports **no** `aria-valuenow` at all, which is what marks it indeterminate,
    and its animation is replaced by a static stripe under `prefers-reduced-motion`.
  - **`gogBadge`** — a count or dot pinned to another element's corner. A directive, so it
    decorates a button, icon or avatar without wrapping it. `badgePosition`, `badgeVariant`,
    `badgeDot`, `badgeMax` (`99+` beyond it), `badgeHidden` and `badgeAriaLabel`. It renders
    **nothing at all** for `0`, `null` or `''` — a badge reading "0" is the defining bug of this
    component class, so it is not reachable.
  - **`gog-divider`** — a rule between two regions, horizontal or vertical, solid/dashed/dotted,
    with an optional projected label running through it and an `inset` variant for lists. No
    `hasLabel` input: the two forms are told apart by whether anything was actually projected.

- `GogOrientation` — one shared `'horizontal' | 'vertical'` type. `GogSliderOrientation` is now
  an alias of it, so nothing changes for existing code.
- `roving-focus.ts` gained an `orientation` (so a horizontal tablist leaves `ArrowDown` to the
  page) and an optional predicate for skipping disabled items. Both default to the previous
  behaviour, so `gog-select`, `gog-multiselect` and `gog-accordion` are unaffected.
- Four icons: `calendar`, `clock`, `chevron-left`, `chevron-right`.
- `.gog-visually-hidden` in `styles/utilities.css`.

- `GogFloatLabelState` (exported) — the shared float-label state behind `gog-inputfield`,
  `gog-textarea`, `gog-select` and `gog-multiselect`, previously three near-identical copies of
  the same five `computed()`s. A plain composition class in the mould of `GogErrorState`, so it
  serves the two components that share no base class as well as `GogDropdownBase`, which is one.
  Each control still supplies its own "has content" signal, since that genuinely differs
  (non-empty string / non-null selection / non-empty selection array).
- `resolveConfigured(instanceValue, configuredValue, fallback)` (exported) — the library's
  input → `GOG_CONFIG` → built-in default precedence rule in one place, instead of the `??`
  chain hand-written at each configurable input.
- `GOG_CONFIG` now covers the settings an app otherwise repeats on every instance:
  `control.size` and `control.errorDisplay` (the latter is what makes `errorDisplay="auto"` an
  app-wide decision for a Reactive Forms app rather than per-field boilerplate),
  `dropdown.appendToBody`, `dropdown.direction`, and `toast.position` / `toast.duration`.
  `control.size` deliberately covers only the interactive form controls — `gog-table`,
  `gog-accordion` and `gog-paginator` keep their own density defaults, as do `gog-spinner`,
  `gog-skeleton`, `gog-tag` and `gog-chip`. All stay per-instance overridable.

- **A built-in clear button** on `gog-inputfield`, `gog-textarea`, `gog-select` and
  `gog-multiselect`, via a `clearable` input (plus `clearAriaLabel`). It appears only once the
  control has something to clear and disappears again when empty, so it adds no permanent
  chrome — and it removes the need for a fake `"— not selected —"` option just to let someone
  undo a choice. Also settable app-wide through `GOG_CONFIG.control.clearable`. Defaults to
  `false`, except `gog-multiselect`, which already had a clear button and keeps it. On a
  password field the built-in reveal toggle keeps the trailing slot.
- `filterPosition` on `gog-select` / `gog-multiselect` (`'top'` | `'bottom'`, plus
  `GOG_CONFIG.dropdown.filterPosition`) sticks the search box to either end of the panel, and it
  now carries a divider on the side facing the list so it reads as chrome rather than a row. The
  name matches `gog-multiselect`'s existing `controlsPosition` rather than inventing a second
  vocabulary for the same idea.
- **Filtering in `gog-select` and `gog-multiselect`** — `filter` puts a search box at the top of
  the panel, matching case-insensitively on the resolved `optionLabel`. `filterMatch` swaps that
  for your own predicate, `filterPlaceholder` and `filterEmptyMessage` cover the wording, and
  `GOG_CONFIG.dropdown.filter` turns it on app-wide. The query resets when the panel closes, and
  `gog-multiselect`'s "select all" deliberately takes only the _visible_ options so it means what
  it says while a filter is active.
- `styles/presets/one-dark.css` and `styles/presets/one-light.css` — the Atom/JetBrains One
  palettes, with the syntax hues mapped onto the library's semantic roles (blue is the accent,
  green/red/yellow/cyan become success/danger/warning/info).

- **The token catalogue is generated, not hand-copied.** `npm run generate:tokens` derives
  `GogTokenName` (a union of every `--gog-*` the library declares or documents), the
  `GOG_TOKEN_GROUPS` runtime metadata, and the README's theming table straight from
  `theme.css`. `npm run check:tokens` fails when they are out of date, so a stylesheet edit
  cannot silently leave the docs behind. `GOG_TOKEN_GROUPS` is exported so a theme editor can
  enumerate real tokens instead of keeping its own copy.
- `styles/presets/slate.css` — a second, importable preset (`data-theme="slate"`, cool/indigo).
  It declares palette tokens only and still restyles everything, which is the theming contract
  demonstrated rather than described.

- **`gog-select` and `gog-multiselect` take your own objects.** `optionLabel`, `optionValue` and
  `optionDisabled` accept a property path (dot-paths included, `'profile.fullName'`) or a
  function, so a real DTO goes straight in — no mapping into `{ id, name }` first, and no losing
  the original object on the way back out. Set `[optionValue]="null"` and the control emits the
  **option object itself** instead of an id. Both controls are now generic over their option and
  value types, inferred from the bindings.

  Defaults are `'name'` / `'id'` / `'disabled'`, so **existing code is unaffected** — the whole
  21.2.x select/multiselect spec suite passes unchanged. `GogDropdownOption` is no longer a
  requirement, just the shape those default accessors expect.

- `gogDropdownOption` — a projected template for one option row, with
  `{ $implicit: option, selected, disabled, label }` as its context.
- `getByPath`, `readOption`, `isSameOptionValue` and the `GogOptionAccessor<TOption, TResult>`
  type are exported; `gog-table` now shares the same `getByPath` rather than keeping its own copy.

- **One slot mechanism across the library.** Custom markup is now projected as content and
  picked up with `contentChild`, instead of a `TemplateRef` input per slot. New directives:
  `gogColumnBody` / `gogColumnHeader` (per column, replacing the string-keyed
  `<ng-template template="…" type="…">`), `gogCheckboxIcon`, `gogTagIcon`,
  `gogMultiselectClearIcon`, `gogDropdownChevron`, and `gogInputAddonStart` /
  `gogInputAddonEnd`. A projected slot always wins over the deprecated input it replaces, so a
  codebase can migrate one call site at a time.
- `GogColumn` with the `gog-column` selector — the library's last unprefixed element name.
- `gog-inputfield` addon slots take arbitrary markup, including a real `<button>` with its own
  `aria-label` and `(click)`. This replaces six inputs (`icon{Start,End}{Template,Fn,Label}`)
  with two slots. On `type="password"` the built-in reveal toggle keeps the trailing slot, so a
  projected addon can never displace the only control that shows the value.

### Fixed

- **An auto-width dropdown clipped its own options.** With `[fullWidth]="false"` the trigger
  sizes to the _current_ selection, and the panel copied that width — so picking a short option
  cut the longer ones off the list. The relationship is now inverted: the panel sizes to its own
  content with the trigger's width as a **floor**, capped by
  `--gog-{select,multiselect}-panel-max-width`. New `minWidth` input (any CSS length) plus
  `--gog-{select,multiselect}-min-width` (120px) so an auto-width trigger cannot collapse to its
  own chrome either.
- **`gog-multiselect` now collapses a long selection into `+N`.** The trigger shows what fits on
  one line and a count for the rest, with the full list in a tooltip. Measured with
  `canvas.measureText` rather than by rendering candidates, and re-measured from a
  `ResizeObserver` on the value element, since the space available changes when the _container_
  resizes — something Angular never renders for.
- **`gog-select`'s chevron sat 42px from the trigger's right edge.**
  `--gog-select-chevron-inset` was applied as the trigger's `padding-right` while the chevron
  itself was a flex child _inside_ that padding, so the inset was counted twice. It now lands on
  `--gog-control-icon-offset` (10px), the same line as `gog-inputfield`'s icons and
  `gog-multiselect`'s arrow, which were at 10px and 16px — the three controls did not line up in
  a form. The token keeps its name and now means what it says.
- **`gog-textarea`'s clear button sat inside the scrollbar.** It was inset 8px from the border
  box while a scrolling textarea's scrollbar is ~19px wide, so once the content overflowed the
  button was half-covered and competed with the thumb for clicks. It is now offset by the
  measured scrollbar width (`--gog-textarea-scrollbar-width`, written from
  `offsetWidth - clientWidth`; `scrollbar-gutter: stable` was rejected because it reserves the
  gutter even when the field isn't scrolling).
- **`gog-textarea`'s clear glyph was 30% too small** — 13.4px against the library's 19.2px,
  because it reused the dropdowns' 0.7 ratio, which suits their dense trigger and not a large
  multi-line box. New `--gog-textarea-clear-icon-ratio` defaults to a full-size glyph.
- Nine specs in `scroll.component.spec.ts` awaited a single animation frame after dispatching a
  scroll, while `ScrollComponent` coalesces measurement into its own frame — if that frame fired
  during `whenStable()`, the effect scheduled a second one _after_ the test's, and the assertion
  ran before the measurement. Intermittent by construction; replaced with a `settleMeasure()`
  helper that covers both orderings.

### Changed

- The clear button now takes the **outermost** trailing position on `gog-select` and
  `gog-multiselect`, with the chevron/arrow shifting inward when it appears. Previously
  `gog-multiselect` had them the other way round. Keeps the trigger width stable and keeps the
  destructive control off the very edge.
- Float-label fields are less tall: `--gog-field-float-label-reserve` 18px → 14px and
  `--gog-field-float-label-in-top` 8px → 6px, taking an `md` field from 63px to 59px (a plain one
  is 45px). Both are tokens, so the old numbers are one declaration away.

### Deprecated

Each of these keeps working unchanged and is **removed in 21.5.0**; the `@deprecated` tag on
every symbol carries the same date and removal version, so `grep -rn "@deprecated since"` lists
the full set at any time.

- `<column>` → `<gog-column>`, and the `Column` export → `GogColumn`.
- All `--gog-ms-*` tokens → `--gog-multiselect-*`. Both spellings work for the whole window:
  the `--gog-ms-*` name stays the _declared_ one and the new name derives from it, so an
  existing override of either still reaches the component. Verified in a browser both ways.
- `<ng-template template="field" type="body|header">` inside `gog-table` → a `gogColumnBody` /
  `gogColumnHeader` template declared inside the column itself. The old form matched columns by
  a string the compiler cannot check, so a typo silently fell back to the default cell.
- `gog-checkbox`'s `checkIconTemplate` → `gogCheckboxIcon`.
- `gog-tag`'s `iconTemplate` → `gogTagIcon`.
- `gog-multiselect`'s `clearIconTemplate` → `gogMultiselectClearIcon`.
- `gog-select` / `gog-multiselect` `chevronTemplate` → `gogDropdownChevron`.
- `gog-inputfield`'s `iconStartTemplate`, `iconEndTemplate`, `iconStartFn`, `iconEndFn`,
  `iconStartLabel`, `iconEndLabel` → `gogInputAddonStart` / `gogInputAddonEnd`. `iconStart` and
  `iconEnd` (a bare icon name) stay — that is the genuinely common case.

### Changed

- **`provideGogConfig(...)` now merges with the config from the parent injector instead of
  replacing it.** Previously a nested call — in a route's or a component's `providers` —
  silently dropped every key it did not restate, so a route setting only `{ tooltip: … }` lost
  the app-wide `button.debounce` with no error anywhere. Merging is one level deep, per
  component key, nearest provider winning field by field. If you were working around the old
  behaviour by repeating the whole config at each level, those repeats are now redundant but
  harmless.

- Float label geometry is now themeable through `theme.css` instead of being hardcoded in the
  component stylesheets. `--gog-{input,select,ms}-float-label-{reserve,in-top,over-gap,over-reserve}`
  previously existed only as literal fallbacks (`18px`, `8px`, `1.4em`) inside four component
  `.scss` files, so they were overridable but not discoverable, and `theme.css` did not describe
  the components' full surface. They are now declared component tokens deriving from a new
  shared `--gog-field-float-label-{reserve,in-top,over-gap,over-reserve}` scale, so one
  declaration retunes every field at once while a single control can still be overridden.
  No visual change — the defaults are identical. `--gog-{input,select,ms}-float-label-on-bg`
  stays an instance-layer (undeclared) token as before.

### Added

- Float label support for `gog-inputfield`, `gog-select`, `gog-multiselect` and
  `gog-textarea`: a `floatLabel` input (`GogFloatLabelVariant`: `'none'` default, or
  `'in'`/`'on'`/`'over'`, modeled on PrimeNG's own variant names) that rests the label inside
  the field like a placeholder and floats it up on focus or once the field has content —
  `'in'` stays fully inside the border, `'on'` ends up centered on the top border line (with
  a background patch masking it), `'over'` floats fully above the field, outside the border.
  A `floatLabelShowPlaceholder` input (`boolean`, default `false`) reveals the field's own
  `placeholder` once the label has floated out of the way; left off, the placeholder stays
  hidden the whole time a float label is active since the resting label already occupies that
  space. Both are also settable app-wide via the new `GOG_CONFIG.floatLabel` (`variant` /
  `showPlaceholder`), with the usual per-instance input taking priority. Implemented as a
  style variant on each component (not a directive, unlike `gogTooltip`) since each control
  already owns its label and has a different notion of "has content" (`value`,
  `selectedOption`, selection length) that a directive sitting outside the component couldn't
  see. New `--gog-{input,select,ms}-float-label-{in-top,on-bg,over-gap,over-reserve}` tokens.
- `gog-slider`'s new `orientation` input (`'horizontal'` default / `'vertical'`) — the
  developer picks per instance, no global default, since it's a layout decision rather than a
  house style. The vertical variant is the same native `<input type="range">` rotated via
  `writing-mode: vertical-lr` + `direction: rtl` (not a custom drag implementation), so
  dragging, touch and keyboard (Up/Down as well as Left/Right) all keep working exactly as they
  do horizontally; value increases upward, matching a volume-fader convention. New
  `--gog-slider-vertical-length` token (default `160px`) sizes its length, the vertical
  counterpart to `--gog-slider-auto-width`. `fullWidth` is ignored when vertical, since a
  vertical slider's width is its thickness, not its length.
- `gog-radio-group`: a new options-driven radio control (`GogRadioOption[]`), the radio
  counterpart to `gog-checkbox`. Renders native `<input type="radio">`s sharing one
  auto-generated (or explicit `name`) group name, so mutual exclusivity and arrow-key/Home/End
  navigation between options come from the browser for free — no roving-focus code needed.
  `ControlValueAccessor`-based, works with `formControl`/`formControlName`. `label`,
  `ariaLabel`, `name`, `size`, `disabled` (group-level, plus per-option `disabled`),
  `orientation` (`'vertical'` default / `'horizontal'`), `errorMessage`, `errorDisplay` and
  `fullWidth` inputs; `[(value)]` two-way bindable. Reuses the `--gog-control-checkbox-*`
  size scale via the shared checkable-control config, plus new `--gog-radio-*` tokens in
  `theme.css`.
- `gog-collapsible`'s `collapseOnFocusOut` input (`boolean`, default `false`): closes the
  panel once focus leaves both the trigger and the content — e.g. Tabbing past the last
  focusable element inside, or a click landing elsewhere on the page. Off by default, since
  plenty of consumers (an FAQ list, a settings section read top to bottom) want the panel to
  stay open regardless of where focus goes next.
- `gogTooltip`: a new directive, not a component — drop it on any element, a `gog-*`
  component's own host tag or a plain native one (`<button gogTooltip="Save changes">`,
  `<gog-chip [gogTooltip]="hint">`), to add a hover/focus tooltip without that element
  needing to know anything about it. Content is a plain string or a `TemplateRef` for richer
  markup. `gogTooltipPosition` (`GogTooltipPosition`: `'auto'` default, or an explicit
  `'top'`/`'bottom'`/`'left'`/`'right'` that flips to its opposite if it has no room),
  `gogTooltipShowDelay` (default `300`ms), `gogTooltipHideDelay` (default `100`ms) and
  `gogTooltipDisabled` inputs; the first three also read `GOG_CONFIG.tooltip` for an
  app-wide default the same way `gog-scroll`/`gog-button` already do, with an instance's own
  input always winning. Shown on both mouse hover and keyboard focus (`focusin`/`focusout`,
  not `focus`/`blur`, so it stays replay-safe under SSR event replay), dismissible with
  Escape, and hoverable — moving the pointer from the trigger onto the bubble itself (e.g. to
  read more of a long one, or scroll one taller than `--gog-tooltip-max-height`) cancels the
  pending hide instead of racing it — per WCAG 2.1 SC 1.4.13. The bubble is appended to
  `document.body` (so it's never clipped by an ancestor's `overflow: hidden`) via a new
  internal `GogTooltipOverlay`, built on `ViewContainerRef.createComponent` + relocating the
  node rather than `GogDropdownOverlay`'s `TemplateRef` approach, since a directive has no
  template of its own to attach from. Visually it's the same "floating panel" recipe as
  `gog-dialog`'s panel and `gog-select`'s dropdown (`--gog-surface-color` background, plain
  `--gog-border-color` border, `--gog-panel-shadow`), not a bespoke inverted bubble, so it
  reads as part of a themed app rather than a generic dark tooltip dropped on top of it.
  Content wraps to `--gog-tooltip-max-width` (`280px`) and is capped at
  `--gog-tooltip-max-height` (`220px`) through an internal `gog-scroll` — content under the
  cap renders at exactly its own height, content over it scrolls, using the same themeable
  scrollbar every other overflowing panel in this library uses instead of a native one (see
  `styling.instructions.md`'s new "Scrollable content" section for that convention).
  `gogTooltipClass` applies a class straight to the bubble, for restyling (or resizing) one
  instance — needed because the bubble sits outside any scoped ancestor's stylesheet once
  appended to `document.body`, the same "Panels rendered outside the component subtree"
  limitation `gog-select`'s `[appendToBody]` panel already has, so the class has to come from
  an unscoped (global) stylesheet. New `--gog-tooltip-*` tokens in `theme.css`; `gog-dialog`'s
  panel now also raises `--gog-tooltip-z` (mirroring the existing `--gog-dropdown-z` bump) so
  a tooltip triggered inside a dialog stacks above it.

### Changed

- `gog-slider`'s track now paints a border (new `--gog-slider-track-border-width`/`-style`/
  `-color` tokens, transparent by default — same opt-in convention as `--gog-btn-primary-border`)
  and its fill is bound via `background` instead of `background-color`, so
  `--gog-slider-fill-bg` also accepts a gradient (e.g. `linear-gradient(...)`), not just a
  solid color. The thumb ("handle") was already fully customizable via its existing
  `--gog-slider-thumb-*` tokens (size, background, border, radius, glow) — no change there.

### Fixed

- `gog-slider`'s track background (`--gog-slider-track-bg`) no longer reuses
  `--gog-accent-dim` — it sat on the same hue ramp as the fill (`--gog-accent-color`), so at
  the track's 4px height the two read as one blob instead of a recessed groove with an
  accent fill on top. Now `color-mix(in srgb, var(--gog-text-color) 30%, var(--gog-border-color))`:
  a desaturated, theme-adaptive gray that darkens toward black in the light theme and
  lightens toward parchment in the dark theme (`--gog-text-color` sits at whichever end of
  that range per theme), so it's always distinct from the accent-colored fill and legible
  against its own theme's surface.

## [21.2.4] - 2026-08-05

### Added

- `gog-collapsible`: a headless expand/collapse primitive — inline, not a portal (unlike
  `gog-select`/`gog-multiselect`'s panel). Owns no markup: project any element as the
  trigger via `gogCollapsibleTrigger` and any element as the panel via
  `gogCollapsibleContent`; `[(open)]` is two-way bindable, `disabled` blocks toggling.
  New `--gog-collapsible-*` tokens in `theme.css`; the trigger/content CSS classes live in
  `utilities.css` since the projected content sits outside the component's own view.
- `gog-textarea`: a multi-line counterpart to `gog-inputfield`, sharing its
  `--gog-input-*` tokens. `ControlValueAccessor`-based, works with
  `formControl`/`formControlName`. `label`, `placeholder`, `errorMessage`,
  `errorDisplay`, `disabled`, `size`, `fullWidth` and `rows` inputs.
- `gog-inputfield`'s `type` input now also accepts `'number'` and `'date'`,
  plus new `min`/`max`/`step` inputs (applied only for `type="number"`). For a
  `number` field the value written to/read from an attached
  `formControl`/`formControlName` is a `number` (`null` when the field is
  empty) rather than a string — `[(value)]` stays a string either way, since
  it mirrors the native input's raw text.
- `gog-scroll`: a drop-in replacement for a native `overflow: auto` region.
  Content keeps scrolling natively (wheel, touch, keyboard, focus-into-view);
  only the browser's own scrollbar chrome is hidden and replaced with a
  themeable, draggable overlay thumb. `axis` (`vertical`/`horizontal`/`both`),
  `size` (`normal`/`thin`), `autoHide`/`hideDelay`, `reachThreshold` with
  `gogReachStart`/`gogReachEnd` outputs, a `gogScroll` metrics output, and
  `scrollTo`/`scrollToTop`/`scrollToBottom`/`scrollToLeft`/`scrollToRight`
  public methods. New `--gog-scroll-*` tokens in `theme.css`.
- `gog-scroll`'s `overscrollBehavior` input (`'auto'` | `'contain'` | `'none'`,
  mirrors the CSS property of the same name): what happens when a scroll
  gesture reaches this instance's edge. Defaults to `'auto'` — chains to the
  next scrollable ancestor, same as an un-customized `overflow: auto` div, so
  scrolling to the end of a `gog-scroll`'d section and continuing the same
  gesture now keeps scrolling the page instead of stopping dead. `gog-select`/
  `gog-multiselect`'s option panel and `gog-dialog`'s body now set
  `overscrollBehavior="contain"` explicitly, preserving their existing
  (correct, overlay-appropriate) behavior now that the component-wide default
  has changed to chain-through.
- `GOG_CONFIG`/`GogGlobalConfig`/`provideGogConfig(...)`: one injection token
  for app-wide defaults across the library's component inputs, instead of a
  separate token per component per setting. Call `provideGogConfig({ scroll:
{...}, button: {...} })` once in your app's providers (or a route's/
  component's own `providers` for a subtree-scoped override); any instance
  that doesn't set the input itself falls back to the configured value, then
  to the component's own hardcoded default. `gog-scroll`'s `size`, `autoHide`,
  `hideDelay` and `overscrollBehavior` and `gog-button`'s `debounce` are the
  first inputs wired up to it — see the "Global configuration" section in
  `gleks-ui-library.instructions.md` for how to add more. This only covers
  inputs read in TypeScript that can't already be a CSS token; visual
  defaults remain the `--gog-*` custom properties in `theme.css`.

### Changed

- `gog-checkbox` now registers its `ControlValueAccessor` by self-injecting
  `NgControl` in the constructor, matching every other form control in the
  library, instead of the `NG_VALUE_ACCESSOR`/`forwardRef` provider pattern.
  No behavior change — `formControl`/`formControlName` usage is unaffected.
- `gog-scroll`'s `size`, `autoHide`, `hideDelay` and `overscrollBehavior` inputs and
  `gog-button`'s `debounce` input now default to `undefined` instead of a hardcoded
  value, so they can fall through to `GOG_CONFIG` — read the resolved value (e.g. via
  the rendered DOM) rather than the raw input signal if you need the effective default.
- `gog-select` and `gog-multiselect`: the option panel now scrolls via
  `gog-scroll` instead of native `overflow-y`.
- `gog-dialog`: the body now scrolls via `gog-scroll` instead of native
  `overflow-y`.
- `gog-table`: horizontal scrolling now goes through `gog-scroll` instead of
  native `overflow-x`.

### Fixed

- `gog-scroll` internals used `height: 100%` chains from `:host` down to the
  viewport. A host whose own height comes from being flex-grown inside a
  `max-height`-only ancestor (exactly the select/multiselect dropdown panel
  and dialog body cases above) still failed to resolve a percentage height
  read off it, collapsing back to content size — the panel stopped clipping
  and scrolling. Switched every level to flex-basis chains
  (`flex: 1 1 auto` + `min-height: 0`), which don't have that failure mode.
- `gog-scroll`'s horizontal content wrapper used `width: max-content`, which
  created a circular sizing reference against a `width: 100%` child (e.g.
  `gog-table`'s own `<table>`) and made some browsers fall back to a huge
  sentinel width (~1,000,000px), pushing the table off-screen. Removed —
  children already overflow a normal block parent without it.
- `gog-scroll` set `overscroll-behavior: contain` (both axes) on the
  viewport unconditionally, which also blocked wheel scroll on an axis the
  instance never actually scrolls (e.g. vertical wheel over a horizontal-only
  instance), preventing it from bubbling up to scroll the page. Now set only
  on the axis that's actually acting as a scroll container.
- `gog-scroll` kept a disabled or currently-non-overflowing axis at
  `overflow: hidden`/`auto`, which makes an element a "scroll container" per
  spec regardless of whether it has anything to scroll — becoming the
  containing block for `position: sticky` descendants and a scroll-chaining
  boundary, whether needed or not. This broke `gog-table`'s `stickyHeader`
  and swallowed wheel scroll whenever a `gog-table` (which always wraps its
  own horizontal scroll in a `gog-scroll`) was itself nested inside another
  scrolling container, e.g. a `gog-scroll` capping its height. Both axes are
  now `visible` unless that specific axis is genuinely scrolling.

## [21.2.3] - 2026-08-03

### Added

- `fullWidth` input on `gog-checkbox`, `gog-chip` and `gog-tag`, matching the
  existing `gog-button` behavior: `false` by default (sized to content), `true`
  stretches the component to fill its container.
- `fullWidth` input on `gog-inputfield`, `gog-select`, `gog-multiselect`,
  `gog-table`, `gog-paginator` and `gog-slider`. Inverted from the input above:
  these are already full width of their container by default, so `fullWidth`
  defaults to `true` and set it to `false` to shrink the control to fit its
  content instead (a fixed `--gog-slider-auto-width`, 240px by default, for
  `gog-slider` specifically — its track has no content of its own to size to).
- `gog-accordion`'s `skeletonCount` input: how many skeleton rows to render
  while `loading` is true and `items` is still empty. Defaults to `3`.

### Changed

- `gog-accordion`'s `loading` skeleton now renders with `gog-skeleton` instead
  of a bespoke shimmer implementation. **Breaking:** the
  `--gog-accordion-skeleton-start/-mid/-end/-radius/-height/-width/-duration`
  tokens are gone — restyle the loading state via the shared `--gog-skeleton-*`
  tokens instead.

### Fixed

- `gog-accordion`'s `loading` skeleton now actually renders while `items` is
  empty. It previously rendered one skeleton row per existing item, so the
  most common real-world case — showing loading state before the item list
  has arrived at all — silently rendered nothing. It now falls back to
  `skeletonCount` rows whenever `items` is empty, and still mirrors `items`
  once they exist.
- `gog-accordion`'s chevron no longer force-rotates 180° when a custom
  `gogAccordionChevron` template is supplied. Previously the wrapper always
  rotated on open regardless of what the template rendered, so a template that
  swapped between a `chevron-up`/`chevron-down` icon per `open` state ended up
  double-transformed (both states visually pointing the same way). The rotation
  now only applies to the built-in default chevron; a custom template owns its
  open/closed presentation entirely, including bringing its own animation or
  swapping in a completely different icon.

## [21.2.2] - 2026-07-30

### Added

- `column`'s `comparator` input for custom per-column sort ordering; the default
  comparator now uses `Intl.Collator` for numeric-aware string sorting
  (`"item2" < "item10"`) instead of raw `<`/`>`.
- `gog-table` cell/sort values now resolve dot-path nested fields (e.g.
  `field="address.city"`).
- ESLint (`@angular-eslint`, flat config) across `@gleks/ui` and `ui-showcase`, wired
  into CI alongside `format:check` and a token-consistency check (every
  `var(--gog-*)` read with no fallback must resolve to a declared default).
- `LICENSE` (MIT) and this changelog.

### Changed

- **Breaking:** every previously unprefixed global design token in `theme.css`
  (`--accent-color`, `--text-color`, `--radius`, `--control-*`, `--field-*`,
  `--dropdown-z`, etc.) is now `--gog-*` prefixed, matching the component-token
  convention. Update any consumer theme overrides to the new names.
- **Breaking:** `column`'s `field` input is now a plain `string` (was
  `keyof T & string`) to support nested dot-paths.
- `gog-select`/`gog-multiselect` panel sizing constants (max height, estimated row
  height) are now read from CSS custom properties
  (`--gog-select-panel-max-height`, `--gog-select-option-height`, and the
  multiselect equivalents) instead of hardcoded in TypeScript, so they're themeable.
- `gog-table`'s pagination state now uses `linkedSignal` instead of a manual
  `effect`, resetting to page 1 on sort changes and clamping to `totalPages` on
  data/page-size changes, while still deferring to `gog-paginator`'s own
  self-clamping `page` model.

### Fixed

- An append-to-body dropdown panel now copies the trigger's scoped `data-theme`
  (not just `:root`'s) onto its overlay host, so panels stay themed when opened
  inside a themed subtree.
- `gog-select` now correctly reads its own `--gog-select-option-gap` token for
  panel-height estimation instead of the unused base default, fixing a latent
  under-estimate in the panel's up/down placement math.

## [0.0.1] through 0.2.2

Initial development, published as `0.0.1`: accordion, button, checkbox, chip, dialog,
icon, inputfield, multiselect, paginator, select, skeleton, slider, spinner, table, tag
and toast components, plus the shared theme (`styles/theme.css`) and `ThemeService`.
Versions up to `0.2.2` were developed without per-release changelog entries. `0.2.2` was
published with the wrong version scheme and immediately re-published, with no code
changes, as `21.2.2` — this file tracks changes from `21.2.2` onward.
