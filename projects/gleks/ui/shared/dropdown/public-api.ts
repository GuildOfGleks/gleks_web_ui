/*
 * `@guildofgleks/ui/shared/dropdown` -- internal: the base classes `gog-select`,
 * `gog-multiselect` and `gog-autocomplete` are built on.
 *
 * Split from `@guildofgleks/ui/shared` for the reason `shared/date` gives: an app shell imports
 * `shared` eagerly, so anything a lazy page used from it landed in the initial chunk
 * (docs/component-entry-points.md, iteration 2b). The overlay and positioning helpers stay in
 * `shared` -- the tooltip, menu and popover use them too.
 *
 * Internal; the public subset is `@guildofgleks/ui/dropdown`'s named list.
 */
export * from './dropdown-base';
export * from './filterable-dropdown-base';
