/*
 * `@guildofgleks/ui/date` -- the date helpers and their types. Opt-in; the root re-exports all of it
 * (docs/component-entry-points.md). The code lives in the internal `@guildofgleks/ui/shared`;
 * this list is what of it is public.
 */
/*
 * Named, not wholesale, though nothing is dropped: `AGENTS.md` advertises `formatDate`,
 * `parseDate` and "a family of date-math helpers", so this whole set is supported on purpose.
 *
 * The list is here for what an `export *` cannot do -- make the next addition a decision. A
 * helper added to `date-utils.ts` used to become public API the moment it was written, with
 * nobody choosing that and no diff showing it. Adding a line here is the choosing.
 */
export {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  copyTimeOnto,
  daysInMonth,
  formatDate,
  gogFromZonedTime,
  gogToZonedTime,
  isAfterDay,
  isBeforeDay,
  isInRange,
  isSameDay,
  isSameMonth,
  isWithinBounds,
  localeFirstDayOfWeek,
  monthNames,
  parseDate,
  startOfDay,
  weekdayNames,
  withTime,
} from '@guildofgleks/ui/shared';
export type { GogDateRange, GogDateSelectionMode, GogHourFormat } from '@guildofgleks/ui/shared';
