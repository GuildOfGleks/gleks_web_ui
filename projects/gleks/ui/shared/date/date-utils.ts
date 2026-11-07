/**
 * Every date calculation `gog-datepicker` and `gog-calendar` do, as pure functions.
 *
 * Kept out of the components so the arithmetic is testable without a fixture, and so a range
 * calculation is written once rather than once per selection mode.
 *
 * **Everything here works in local time.** Nothing round-trips through `toISOString()` or
 * compares `Date` objects directly: an ISO round trip converts to UTC, which moves the date
 * across midnight for anyone east or west of Greenwich, and two `Date`s for "the same day"
 * are almost never equal because they carry different times. Comparisons go through
 * `startOfDay` and `isSameDay` instead. This is the single most common defect in a datepicker.
 */

/** A start/end pair. `end` is null while a range is half-picked. */
export interface GogDateRange {
  start: Date | null;
  end: Date | null;
}

/** Midnight local time on the same calendar day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whether two dates fall on the same calendar day, ignoring the time of day. */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Whether two dates fall in the same calendar month. */
export function isSameMonth(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/** Days in a given month. `month` is 0-based, as `Date` uses it. */
export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Adds whole months, **clamping the day** to the target month's length: 31 January plus one
 * month is 28 February, not 3 March. `Date.setMonth` does the latter, which is why this is
 * not a one-liner.
 */
export function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const targetYear = year + Math.floor(month / 12);
  const targetMonth = ((month % 12) + 12) % 12;
  const day = Math.min(date.getDate(), daysInMonth(targetYear, targetMonth));

  return new Date(
    targetYear,
    targetMonth,
    day,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  );
}

export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

/** Day-granularity comparison: `a` is strictly before `b`'s day. */
export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** Day-granularity comparison: `a` is strictly after `b`'s day. */
export function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** Whether `date`'s day falls within `[min, max]`, either bound optional. */
export function isWithinBounds(date: Date, min: Date | null, max: Date | null): boolean {
  if (min && isBeforeDay(date, min)) return false;
  if (max && isAfterDay(date, max)) return false;
  return true;
}

/** Whether `date`'s day falls inside a range, inclusive of both ends. */
export function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const [from, to] = isAfterDay(start, end) ? [end, start] : [start, end];
  return !isBeforeDay(date, from) && !isAfterDay(date, to);
}

/** Pulls `date` inside `[min, max]`, keeping its time of day. */
export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min && isBeforeDay(date, min)) return copyTimeOnto(min, date);
  if (max && isAfterDay(date, max)) return copyTimeOnto(max, date);
  return date;
}

/** A new date on `day`'s calendar day carrying `time`'s clock. */
export function copyTimeOnto(day: Date, time: Date): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
  );
}

/** A new date on the same day with the clock replaced. */
export function withTime(date: Date, hours: number, minutes: number, seconds = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds);
}

/**
 * The six-week grid a month is drawn on, always 6×7 so the calendar's height never changes as
 * you page through months — a grid that grows and shrinks pushes the rest of the page around
 * and moves the button you were about to click.
 *
 * `firstDayOfWeek` is 0 (Sunday) to 6 (Saturday). Leading and trailing cells come from the
 * neighbouring months, as every calendar does.
 */
export function buildMonthGrid(year: number, month: number, firstDayOfWeek: number): Date[][] {
  const first = new Date(year, month, 1);
  const shift = (first.getDay() - firstDayOfWeek + 7) % 7;
  const gridStart = addDays(first, -shift);

  const weeks: Date[][] = [];
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(addDays(gridStart, week * 7 + day));
    }
    weeks.push(days);
  }
  return weeks;
}

/** Weekday names in `locale`, rotated so `firstDayOfWeek` comes first. */
export function weekdayNames(
  locale: string,
  firstDayOfWeek: number,
  style: 'short' | 'narrow' | 'long' = 'short',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: style });
  // 2024-01-07 was a Sunday, so index 0 lines up with `Date.getDay()` 0.
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(addDays(sunday, (i + firstDayOfWeek) % 7)),
  );
}

/** Month names in `locale`. */
export function monthNames(locale: string, style: 'long' | 'short' = 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: style });
  return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2024, month, 1)));
}

/**
 * The first day of the week for a locale, from `Intl.Locale.prototype.getWeekInfo` where the
 * engine has it, falling back to Monday.
 *
 * `getWeekInfo` reports 1–7 with 1 = Monday and 7 = Sunday; `Date.getDay()` uses 0 = Sunday.
 * Converting between the two is exactly the kind of off-by-one that silently shifts a whole
 * calendar by a day, which is why it happens here once.
 */
export function localeFirstDayOfWeek(locale: string): number {
  interface WeekInfo {
    firstDay: number;
  }
  type LocaleWithWeekInfo = Intl.Locale & {
    getWeekInfo?: () => WeekInfo;
    weekInfo?: WeekInfo;
  };

  try {
    const resolved = new Intl.Locale(locale) as LocaleWithWeekInfo;
    const info = resolved.getWeekInfo?.() ?? resolved.weekInfo;
    if (info && typeof info.firstDay === 'number') {
      return info.firstDay % 7;
    }
  } catch {
    // An invalid locale tag shouldn't take the calendar down with it.
  }
  return 1;
}

const PAD2 = (value: number): string => String(value).padStart(2, '0');

/**
 * Formats a date against a token pattern.
 *
 * Supported tokens: `yyyy`, `MM`, `dd`, `HH` (24h), `hh` (12h), `mm`, `ss`, `a` (AM/PM).
 * Anything else is copied through literally.
 *
 * Deliberately **not** `Intl.DateTimeFormat`: this pattern is also what `parseDate` reads, and
 * a formatter whose output cannot be parsed back is how a typed date silently becomes a
 * different one. `Intl` is still used for month and weekday *names*, which are never parsed.
 */
export function formatDate(date: Date, pattern: string): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()).padStart(4, '0'),
    MM: PAD2(date.getMonth() + 1),
    dd: PAD2(date.getDate()),
    HH: PAD2(hours24),
    hh: PAD2(hours12),
    mm: PAD2(date.getMinutes()),
    ss: PAD2(date.getSeconds()),
    a: hours24 < 12 ? 'AM' : 'PM',
  };

  return pattern.replace(/yyyy|MM|dd|HH|hh|mm|ss|a/g, (token) => replacements[token]);
}

/**
 * Reads a date back out of text written in `pattern`. Returns `null` when the text doesn't
 * match, or matches but isn't a real date (`31.02.2026`).
 *
 * The out-of-range check matters: `new Date(2026, 1, 31)` happily rolls over to 3 March, so a
 * typo would be accepted as a different date rather than rejected.
 */
export function parseDate(text: string, pattern: string): Date | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const order: string[] = [];
  const source = pattern.replace(/yyyy|MM|dd|HH|hh|mm|ss|a|./g, (token) => {
    switch (token) {
      case 'yyyy':
        order.push(token);
        return '(\\d{4})';
      case 'MM':
      case 'dd':
      case 'HH':
      case 'hh':
      case 'mm':
      case 'ss':
        order.push(token);
        return '(\\d{1,2})';
      case 'a':
        order.push(token);
        return '([AaPp][Mm])';
      default:
        return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  });

  const match = new RegExp(`^${source}$`).exec(trimmed);
  if (!match) return null;

  const parts: Record<string, number> = { yyyy: 1970, MM: 1, dd: 1, HH: 0, mm: 0, ss: 0 };
  let meridiem: 'am' | 'pm' | null = null;

  order.forEach((token, index) => {
    const raw = match[index + 1];
    if (token === 'a') {
      meridiem = raw.toLowerCase() as 'am' | 'pm';
    } else {
      parts[token] = Number(raw);
    }
  });

  if (order.includes('hh') && meridiem) {
    const base = parts['hh'] % 12;
    parts['HH'] = meridiem === 'pm' ? base + 12 : base;
  } else if (order.includes('hh')) {
    parts['HH'] = parts['hh'];
  }

  const year = parts['yyyy'];
  const month = parts['MM'] - 1;
  const day = parts['dd'];

  if (month < 0 || month > 11) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (parts['HH'] > 23 || parts['mm'] > 59 || parts['ss'] > 59) return null;

  return new Date(year, month, day, parts['HH'], parts['mm'], parts['ss']);
}
