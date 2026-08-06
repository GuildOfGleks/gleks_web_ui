# Changelog

All notable changes to `@guildofgleks/ui` are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project has not yet
reached 1.0, so breaking changes may land in minor versions.

## [21.2.5] - planned

### Added

- `gog-collapsible`'s `collapseOnFocusOut` input (`boolean`, default `false`): closes the
  panel once focus leaves both the trigger and the content — e.g. Tabbing past the last
  focusable element inside, or a click landing elsewhere on the page. Off by default, since
  plenty of consumers (an FAQ list, a settings section read top to bottom) want the panel to
  stay open regardless of where focus goes next.

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
