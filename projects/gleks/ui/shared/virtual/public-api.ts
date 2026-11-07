/*
 * `@guildofgleks/ui/shared/virtual` -- internal: the fixed-pitch window the three dropdowns use and
 * the measuring window `gog-table` uses.
 *
 * Split from `@guildofgleks/ui/shared` for the reason `shared/date` gives (docs/
 * component-entry-points.md, iteration 2b), and from `shared/dropdown` so a table does not bring
 * the dropdown base with it.
 */
export * from './virtual-window';
export * from './variable-window';
