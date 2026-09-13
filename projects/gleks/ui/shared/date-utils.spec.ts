import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  copyTimeOnto,
  daysInMonth,
  formatDate,
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
} from './date-utils';

describe('startOfDay', () => {
  it('drops the time but keeps the calendar day', () => {
    const start = startOfDay(new Date(2026, 1, 14, 23, 47, 12));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(1);
    expect(start.getDate()).toBe(14);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it('stays on the same local day late in the evening', () => {
    // The bug this guards: an ISO round trip would move 23:47 to the *next* UTC day for
    // anyone west of Greenwich, and to the previous one going the other way.
    const start = startOfDay(new Date(2026, 0, 1, 23, 59, 59));
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(0);
  });
});

describe('isSameDay', () => {
  it('ignores the time of day', () => {
    expect(isSameDay(new Date(2026, 5, 3, 1, 0), new Date(2026, 5, 3, 23, 59))).toBe(true);
  });

  it('separates adjacent days', () => {
    expect(isSameDay(new Date(2026, 5, 3, 23, 59), new Date(2026, 5, 4, 0, 0))).toBe(false);
  });

  it('is false when either side is null', () => {
    expect(isSameDay(null, new Date())).toBe(false);
    expect(isSameDay(new Date(), null)).toBe(false);
  });

  it('separates the same day in different years', () => {
    expect(isSameDay(new Date(2025, 5, 3), new Date(2026, 5, 3))).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('matches on year and month only', () => {
    expect(isSameMonth(new Date(2026, 5, 1), new Date(2026, 5, 30))).toBe(true);
    expect(isSameMonth(new Date(2026, 5, 30), new Date(2026, 6, 1))).toBe(false);
    expect(isSameMonth(new Date(2025, 5, 1), new Date(2026, 5, 1))).toBe(false);
  });
});

describe('daysInMonth', () => {
  it('knows the short months', () => {
    expect(daysInMonth(2026, 0)).toBe(31);
    expect(daysInMonth(2026, 3)).toBe(30);
  });

  it('handles February in a common and a leap year', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2024, 1)).toBe(29);
  });

  it('handles the century leap-year rule', () => {
    expect(daysInMonth(1900, 1)).toBe(28);
    expect(daysInMonth(2000, 1)).toBe(29);
  });
});

describe('addMonths', () => {
  it('clamps the day to the target month rather than rolling over', () => {
    // Date.setMonth would give 3 March here, which is the classic month-stepping bug.
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('clamps into a leap February', () => {
    const result = addMonths(new Date(2024, 0, 31), 1);
    expect(result.getDate()).toBe(29);
  });

  it('clamps 31 to 30 for a short month', () => {
    const result = addMonths(new Date(2026, 4, 31), 1);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(30);
  });

  it('crosses the year boundary in both directions', () => {
    expect(addMonths(new Date(2026, 11, 15), 1).getFullYear()).toBe(2027);
    expect(addMonths(new Date(2026, 11, 15), 1).getMonth()).toBe(0);
    expect(addMonths(new Date(2026, 0, 15), -1).getFullYear()).toBe(2025);
    expect(addMonths(new Date(2026, 0, 15), -1).getMonth()).toBe(11);
  });

  it('keeps the time of day', () => {
    const result = addMonths(new Date(2026, 0, 15, 13, 45, 30), 2);
    expect(result.getHours()).toBe(13);
    expect(result.getMinutes()).toBe(45);
    expect(result.getSeconds()).toBe(30);
  });

  it('steps a whole year backwards', () => {
    const result = addMonths(new Date(2026, 2, 10), -14);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
  });
});

describe('addYears', () => {
  it('clamps 29 February onto a common year', () => {
    const result = addYears(new Date(2024, 1, 29), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });
});

describe('addDays', () => {
  it('crosses a month boundary', () => {
    const result = addDays(new Date(2026, 0, 30), 3);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
  });

  it('goes backwards', () => {
    const result = addDays(new Date(2026, 0, 1), -1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
  });
});

describe('day comparisons', () => {
  it('compare by day, not by timestamp', () => {
    const morning = new Date(2026, 5, 3, 8);
    const evening = new Date(2026, 5, 3, 20);
    expect(isBeforeDay(morning, evening)).toBe(false);
    expect(isAfterDay(evening, morning)).toBe(false);
  });

  it('order across days', () => {
    expect(isBeforeDay(new Date(2026, 5, 3, 23), new Date(2026, 5, 4, 1))).toBe(true);
    expect(isAfterDay(new Date(2026, 5, 4, 1), new Date(2026, 5, 3, 23))).toBe(true);
  });
});

describe('isWithinBounds', () => {
  const min = new Date(2026, 5, 10);
  const max = new Date(2026, 5, 20);

  it('is inclusive of both bounds', () => {
    expect(isWithinBounds(new Date(2026, 5, 10, 23), min, max)).toBe(true);
    expect(isWithinBounds(new Date(2026, 5, 20, 0, 1), min, max)).toBe(true);
  });

  it('rejects outside', () => {
    expect(isWithinBounds(new Date(2026, 5, 9), min, max)).toBe(false);
    expect(isWithinBounds(new Date(2026, 5, 21), min, max)).toBe(false);
  });

  it('treats a missing bound as open', () => {
    expect(isWithinBounds(new Date(1990, 0, 1), null, max)).toBe(true);
    expect(isWithinBounds(new Date(2090, 0, 1), min, null)).toBe(true);
  });
});

describe('isInRange', () => {
  const start = new Date(2026, 5, 10);
  const end = new Date(2026, 5, 15);

  it('includes both ends', () => {
    expect(isInRange(start, start, end)).toBe(true);
    expect(isInRange(end, start, end)).toBe(true);
  });

  it('includes the middle and excludes outside', () => {
    expect(isInRange(new Date(2026, 5, 12), start, end)).toBe(true);
    expect(isInRange(new Date(2026, 5, 16), start, end)).toBe(false);
  });

  it('works while the range is being dragged backwards', () => {
    // Hovering before the anchor: start/end arrive reversed, and the highlight must still
    // show rather than vanish.
    expect(isInRange(new Date(2026, 5, 12), end, start)).toBe(true);
  });

  it('is false while the range is half-picked', () => {
    expect(isInRange(new Date(2026, 5, 12), start, null)).toBe(false);
  });
});

describe('clampDate', () => {
  const min = new Date(2026, 5, 10);
  const max = new Date(2026, 5, 20);

  it('pulls a date inside the bounds', () => {
    expect(isSameDay(clampDate(new Date(2026, 5, 1), min, max), min)).toBe(true);
    expect(isSameDay(clampDate(new Date(2026, 5, 25), min, max), max)).toBe(true);
  });

  it('leaves an in-range date alone', () => {
    const inside = new Date(2026, 5, 15, 9, 30);
    expect(clampDate(inside, min, max)).toBe(inside);
  });

  it('keeps the original time of day when clamping', () => {
    const clamped = clampDate(new Date(2026, 5, 1, 17, 45), min, max);
    expect(clamped.getHours()).toBe(17);
    expect(clamped.getMinutes()).toBe(45);
  });
});

describe('copyTimeOnto / withTime', () => {
  it('moves a clock onto another day', () => {
    const result = copyTimeOnto(new Date(2026, 5, 20), new Date(2026, 0, 1, 14, 30, 5));
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(20);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(5);
  });

  it('replaces the clock in place', () => {
    const result = withTime(new Date(2026, 5, 20, 9, 0), 23, 15);
    expect(result.getDate()).toBe(20);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(15);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('buildMonthGrid', () => {
  it('always returns six weeks of seven days', () => {
    for (let month = 0; month < 12; month++) {
      const grid = buildMonthGrid(2026, month, 1);
      expect(grid.length).toBe(6);
      expect(grid.every((week) => week.length === 7)).toBe(true);
    }
  });

  it('starts the grid on the requested weekday', () => {
    const mondayFirst = buildMonthGrid(2026, 1, 1);
    expect(mondayFirst[0][0].getDay()).toBe(1);

    const sundayFirst = buildMonthGrid(2026, 1, 0);
    expect(sundayFirst[0][0].getDay()).toBe(0);
  });

  it('contains every day of the month exactly once', () => {
    const grid = buildMonthGrid(2026, 1, 1).flat();
    const inMonth = grid.filter((date) => date.getMonth() === 1);
    expect(inMonth.length).toBe(28);
    expect(new Set(inMonth.map((date) => date.getDate())).size).toBe(28);
  });

  it('pads with the neighbouring months', () => {
    // February 2026 starts on a Sunday, so a Monday-first grid opens with six January days.
    const grid = buildMonthGrid(2026, 1, 1);
    expect(grid[0][0].getMonth()).toBe(0);
    expect(grid[5][6].getMonth()).not.toBe(1);
  });

  it('handles a month that starts exactly on the first weekday', () => {
    // June 2026 starts on a Monday: with Monday first there is no leading padding at all,
    // and the grid must not silently skip a week.
    const grid = buildMonthGrid(2026, 5, 1);
    expect(grid[0][0].getDate()).toBe(1);
    expect(grid[0][0].getMonth()).toBe(5);
  });
});

describe('weekdayNames / monthNames', () => {
  it('rotates weekdays to the requested first day', () => {
    const sundayFirst = weekdayNames('en-US', 0, 'long');
    expect(sundayFirst[0]).toBe('Sunday');

    const mondayFirst = weekdayNames('en-US', 1, 'long');
    expect(mondayFirst[0]).toBe('Monday');
    expect(mondayFirst[6]).toBe('Sunday');
  });

  it('returns twelve month names', () => {
    const names = monthNames('en-US');
    expect(names.length).toBe(12);
    expect(names[0]).toBe('January');
    expect(names[11]).toBe('December');
  });

  it('localises', () => {
    expect(monthNames('de-DE')[0].toLowerCase()).toContain('januar');
  });
});

describe('localeFirstDayOfWeek', () => {
  it('returns a weekday index in Date.getDay() terms', () => {
    const day = localeFirstDayOfWeek('en-US');
    expect(day).toBeGreaterThanOrEqual(0);
    expect(day).toBeLessThanOrEqual(6);
  });

  it('falls back instead of throwing on a broken tag', () => {
    expect(() => localeFirstDayOfWeek('not a locale')).not.toThrow();
  });
});

describe('formatDate', () => {
  const date = new Date(2026, 1, 3, 9, 5, 7);

  it('pads day and month', () => {
    expect(formatDate(date, 'dd.MM.yyyy')).toBe('03.02.2026');
  });

  it('supports the common orders', () => {
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-02-03');
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('02/03/2026');
  });

  it('formats a 24-hour clock', () => {
    expect(formatDate(date, 'dd.MM.yyyy HH:mm')).toBe('03.02.2026 09:05');
    expect(formatDate(date, 'HH:mm:ss')).toBe('09:05:07');
  });

  it('formats a 12-hour clock with a meridiem', () => {
    expect(formatDate(new Date(2026, 1, 3, 13, 5), 'hh:mm a')).toBe('01:05 PM');
    expect(formatDate(new Date(2026, 1, 3, 0, 5), 'hh:mm a')).toBe('12:05 AM');
    expect(formatDate(new Date(2026, 1, 3, 12, 5), 'hh:mm a')).toBe('12:05 PM');
  });

  it('copies unknown characters through', () => {
    expect(formatDate(date, 'dd | MM')).toBe('03 | 02');
  });
});

describe('parseDate', () => {
  it('reads back what formatDate wrote', () => {
    const original = new Date(2026, 1, 3, 14, 30, 0);
    for (const pattern of ['dd.MM.yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd.MM.yyyy HH:mm']) {
      const parsed = parseDate(formatDate(original, pattern), pattern);
      expect(isSameDay(parsed, original)).toBe(true);
    }
  });

  it('accepts unpadded numbers', () => {
    const parsed = parseDate('3.2.2026', 'dd.MM.yyyy');
    expect(parsed?.getDate()).toBe(3);
    expect(parsed?.getMonth()).toBe(1);
  });

  it('rejects a day that does not exist in that month', () => {
    // new Date(2026, 1, 31) silently rolls over to 3 March, so a typo would be accepted as a
    // different date instead of rejected.
    expect(parseDate('31.02.2026', 'dd.MM.yyyy')).toBeNull();
    expect(parseDate('31.04.2026', 'dd.MM.yyyy')).toBeNull();
  });

  it('accepts 29 February in a leap year and rejects it otherwise', () => {
    expect(parseDate('29.02.2024', 'dd.MM.yyyy')).not.toBeNull();
    expect(parseDate('29.02.2026', 'dd.MM.yyyy')).toBeNull();
  });

  it('rejects an out-of-range month or time', () => {
    expect(parseDate('01.13.2026', 'dd.MM.yyyy')).toBeNull();
    expect(parseDate('01.01.2026 25:00', 'dd.MM.yyyy HH:mm')).toBeNull();
    expect(parseDate('01.01.2026 10:75', 'dd.MM.yyyy HH:mm')).toBeNull();
  });

  it('rejects text that does not match the pattern', () => {
    expect(parseDate('not a date', 'dd.MM.yyyy')).toBeNull();
    expect(parseDate('2026-01-01', 'dd.MM.yyyy')).toBeNull();
    expect(parseDate('', 'dd.MM.yyyy')).toBeNull();
  });

  it('reads a 12-hour clock with its meridiem', () => {
    expect(parseDate('01.01.2026 01:05 PM', 'dd.MM.yyyy hh:mm a')?.getHours()).toBe(13);
    expect(parseDate('01.01.2026 12:05 AM', 'dd.MM.yyyy hh:mm a')?.getHours()).toBe(0);
    expect(parseDate('01.01.2026 12:05 PM', 'dd.MM.yyyy hh:mm a')?.getHours()).toBe(12);
  });

  it('does not treat pattern punctuation as a regex', () => {
    // A '.' in the pattern is a literal dot, not "any character".
    expect(parseDate('01x01x2026', 'dd.MM.yyyy')).toBeNull();
  });
});
