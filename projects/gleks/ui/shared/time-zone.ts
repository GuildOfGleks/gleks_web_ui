import { isDevMode } from '@angular/core';

/**
 * Converting between an instant and the wall-clock time it reads as in an IANA time zone, for
 * `GOG_CONFIG.datepicker.timeZone`.
 *
 * A `Date` is an instant with no zone; its `getHours()`/`getDate()` read it in the browser's own.
 * The calendar's arithmetic (`date-utils.ts`) is written against those local fields and stays
 * that way. A zone is applied only at the component's boundary: an instant coming in becomes a
 * "wall" `Date` whose local fields spell the zone's clock, and a wall `Date` going out becomes the
 * instant that clock means in the zone. Nothing inside the calendar has to know a zone exists.
 *
 * `Intl.DateTimeFormat` is the only source of zone data — no tz database ships with the package.
 */

const formatters = new Map<string, Intl.DateTimeFormat>();
const warnedZones = new Set<string>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

interface WallFields {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallFieldsAt(instant: number, timeZone: string): WallFields {
  const fields: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(instant)) {
    if (part.type !== 'literal') fields[part.type] = Number(part.value);
  }
  return {
    year: fields['year'],
    month: fields['month'] - 1,
    day: fields['day'],
    hour: fields['hour'],
    minute: fields['minute'],
    second: fields['second'],
  };
}

function utcOf(fields: WallFields, milliseconds: number): number {
  const utc = new Date(0);
  utc.setUTCFullYear(fields.year, fields.month, fields.day);
  utc.setUTCHours(fields.hour, fields.minute, fields.second, milliseconds);
  return utc.getTime();
}

/** The zone's offset from UTC at `instant`, in milliseconds (east positive). */
function offsetAt(instant: number, timeZone: string): number {
  const wholeSecond = Math.floor(instant / 1000) * 1000;
  return utcOf(wallFieldsAt(wholeSecond, timeZone), 0) - wholeSecond;
}

/**
 * `timeZone` if the engine knows it, otherwise `null` — the browser's own zone — with one warning
 * in dev mode. A typo in a config key should not take every date field down with a `RangeError`.
 */
export function gogResolveTimeZone(timeZone: string | null | undefined): string | null {
  if (!timeZone) return null;
  try {
    formatterFor(timeZone);
    return timeZone;
  } catch {
    if (isDevMode() && !warnedZones.has(timeZone)) {
      warnedZones.add(timeZone);
      console.warn(
        `[gog-datepicker] Unknown time zone "${timeZone}"; gog-datepicker and gog-calendar use the browser's own zone instead.`,
      );
    }
    return null;
  }
}

/**
 * The wall-clock time `date` reads as in `timeZone`, as a `Date` whose **local** fields carry it:
 * `gogToZonedTime(d, 'Asia/Tokyo').getHours()` is the hour in Tokyo. The result is for reading
 * fields, not an instant to store — `gogFromZonedTime` turns it back.
 *
 * `timeZone` is an IANA name (`'Europe/Berlin'`, `'UTC'`).
 */
export function gogToZonedTime(date: Date, timeZone: string): Date {
  const fields = wallFieldsAt(Math.floor(date.getTime() / 1000) * 1000, timeZone);
  return new Date(
    fields.year,
    fields.month,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
    date.getMilliseconds(),
  );
}

/**
 * The instant at which the clock in `timeZone` reads `wall`'s **local** fields — the inverse of
 * `gogToZonedTime`.
 *
 * Two wall times have no single answer, and both are resolved the way `Temporal`'s
 * `'compatible'` disambiguation does: a time the zone skips when its clocks go forward lands that
 * far later (02:30 on a spring-forward night is 03:30), and a time it passes twice when they go
 * back is the earlier of the two.
 */
export function gogFromZonedTime(wall: Date, timeZone: string): Date {
  const fields: WallFields = {
    year: wall.getFullYear(),
    month: wall.getMonth(),
    day: wall.getDate(),
    hour: wall.getHours(),
    minute: wall.getMinutes(),
    second: wall.getSeconds(),
  };
  const asUtc = utcOf(fields, 0);
  const day = 24 * 60 * 60 * 1000;
  // A zone changes its offset at most once in any two days, so the offsets a day either side are
  // the only two candidates.
  const before = offsetAt(asUtc - day, timeZone);
  const after = offsetAt(asUtc + day, timeZone);

  const matches = [...new Set([before, after])]
    .map((offset) => asUtc - offset)
    .filter((instant) => sameFields(wallFieldsAt(instant, timeZone), fields))
    .sort((a, b) => a - b);

  // No match is the skipped hour: read it with the offset in force before the jump.
  const instant = matches[0] ?? asUtc - before;
  return new Date(instant + wall.getMilliseconds());
}

function sameFields(a: WallFields, b: WallFields): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute &&
    a.second === b.second
  );
}
