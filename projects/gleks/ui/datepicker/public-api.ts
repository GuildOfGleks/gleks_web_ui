/*
 * `@guildofgleks/ui/datepicker` -- `gog-datepicker` and `gog-calendar`. The date helpers and `GogDateRange` stay in the root.
 *
 * Its own entry point since 21.13.0, and since 21.14.0 the only place these are exported from: the
 * root stopped re-exporting them, which is what lets a lazy route that uses them keep them out of
 * an app's initial bundle. A root that re-exports a module drags it into every app that imports
 * anything from the root (docs/entry-points.md, Part 2, finding 2).
 *
 * The code here imports the rest of the library from `@guildofgleks/ui` and never the reverse --
 * `check:layering` rule D.
 */
export { CalendarComponent } from './calendar/calendar.component';
export type { GogCalendarDay, GogDatepickerValue } from './calendar/calendar.component';
export { DatepickerComponent } from './datepicker.component';
