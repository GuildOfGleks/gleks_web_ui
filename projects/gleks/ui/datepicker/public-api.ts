/*
 * `@guildofgleks/ui/datepicker` -- `gog-datepicker` and `gog-calendar`.
 *
 * **Thin for one release, on purpose** (docs/entry-points.md, phase 1). Everything here is still
 * the root's code, re-exported, so switching an import to this path changes nothing today. The
 * minor after moves the code into this entry point and the root stops exporting it -- and only
 * then does a lazy route that uses it keep it out of the initial bundle, because a root that
 * re-exports a module drags that module into every app that imports anything from the root.
 *
 * Re-exported under the root's own names. Those names carry `@deprecated` tags in the root's
 * source for the ratchet, and the tags do not survive into the published types either way, so
 * there is nothing to route around -- see docs/entry-points.md, Part 2, finding 6.
 */
export { CalendarComponent, DatepickerComponent } from '@guildofgleks/ui';
export type { GogCalendarDay, GogDatepickerValue } from '@guildofgleks/ui';
