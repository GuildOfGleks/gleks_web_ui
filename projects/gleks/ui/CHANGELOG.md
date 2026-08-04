# Changelog

All notable changes to `@guildofgleks/ui` are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project has not yet
reached 1.0, so breaking changes may land in minor versions.

## [21.2.4] - planned
- new scroll component.

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
