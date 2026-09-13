/*
 * `@guildofgleks/ui/table` -- `gog-table`, `gog-column` and their templates and types.
 *
 * Its own entry point since 21.13.0, and since 21.14.0 the only place these are exported from: the
 * root stopped re-exporting them, which is what lets a lazy route that uses them keep them out of
 * an app's initial bundle. A root that re-exports a module drags it into every app that imports
 * anything from the root (docs/entry-points.md, Part 2, finding 2).
 *
 * The code here imports the rest of the library from `@guildofgleks/ui` and never the reverse --
 * `check:layering` rule D.
 */
export {
  defaultCompare,
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
} from './column';
export type { GogColumnBodyContext, GogColumnHeaderContext } from './column';
export { TableComponent } from './table.component';
export type {
  GogTableRowClickEvent,
  GogTableSelectionMode,
  GogTableSortEvent,
  SortDirection,
} from './table.component';
