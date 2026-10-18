import {
  type GogSchedulerItem,
  dayPieces,
  fitRows,
  weekBars,
  weekRows,
  isSpanning,
  lastDayOf,
  shiftAnchor,
  timedPieces,
  visibleRange,
  visibleWeeks,
} from './scheduler-layout';

/** A wall-clock date: local fields, so the specs hold in any runner zone. */
const at = (day: number, hour = 0, minute = 0) => new Date(2026, 5, day, hour, minute);

let nextIndex = 0;
function item(start: Date, end: Date, allDay = false, title = ''): GogSchedulerItem<string> {
  const index = nextIndex++;
  return {
    event: title || `#${index}`,
    index,
    title,
    start,
    end,
    allDay,
    variant: 'accent',
    sourceStart: start,
    sourceEnd: end,
  };
}

describe('scheduler layout', () => {
  beforeEach(() => (nextIndex = 0));

  describe('which days an item touches', () => {
    it('treats the end as exclusive, so midnight does not reach the next day', () => {
      expect(lastDayOf(item(at(3), at(6), true))).toEqual(at(5));
      expect(lastDayOf(item(at(3), at(5, 23, 59), true))).toEqual(at(5));
    });

    it('keeps a zero-length item on its start day', () => {
      expect(lastDayOf(item(at(3, 9), at(3, 9)))).toEqual(at(3));
    });

    it('spans when all-day or a day long or more', () => {
      expect(isSpanning(item(at(3), at(3), true))).toBe(true);
      expect(isSpanning(item(at(3, 9), at(4, 9)))).toBe(true);
      expect(isSpanning(item(at(3, 22), at(4, 2)))).toBe(false);
    });
  });

  describe('dayPieces', () => {
    it('lists spanning items first, then timed ones by start', () => {
      const late = item(at(3, 15), at(3, 16), false, 'late');
      const early = item(at(3, 9), at(3, 10), false, 'early');
      const allDay = item(at(3), at(4), true, 'all day');
      expect(dayPieces([late, early, allDay], at(3)).map((p) => p.item.title)).toEqual([
        'all day',
        'early',
        'late',
      ]);
    });

    it('marks the pieces of a multi-day item that continue', () => {
      const trip = item(at(3), at(6), true);
      const [first] = dayPieces([trip], at(3));
      const [middle] = dayPieces([trip], at(4));
      const [last] = dayPieces([trip], at(5));
      expect([first.continuesBefore, first.continuesAfter]).toEqual([false, true]);
      expect([middle.continuesBefore, middle.continuesAfter]).toEqual([true, true]);
      expect([last.continuesBefore, last.continuesAfter]).toEqual([true, false]);
      expect(dayPieces([trip], at(6))).toEqual([]);
    });

    it('keeps only spanning items for the all-day row', () => {
      const timed = item(at(3, 9), at(3, 10));
      const allDay = item(at(3), at(4), true);
      expect(dayPieces([timed, allDay], at(3), true).map((p) => p.item)).toEqual([allDay]);
    });
  });

  describe('timedPieces', () => {
    it('places an item in minutes of the day', () => {
      const [piece] = timedPieces([item(at(3, 9, 30), at(3, 11))], at(3), 0, 1440, 30);
      expect([piece.startMinute, piece.endMinute, piece.lane, piece.lanes]).toEqual([
        570, 660, 0, 1,
      ]);
    });

    it('splits overlapping items into lanes and leaves the others full width', () => {
      const a = item(at(3, 9), at(3, 11));
      const b = item(at(3, 10), at(3, 12));
      const c = item(at(3, 11), at(3, 12));
      const d = item(at(3, 14), at(3, 15));
      const pieces = timedPieces([a, b, c, d], at(3), 0, 1440, 30);
      const byItem = new Map(pieces.map((p) => [p.item, p]));
      expect([byItem.get(a)!.lane, byItem.get(b)!.lane, byItem.get(c)!.lane]).toEqual([0, 1, 0]);
      expect([byItem.get(a)!.lanes, byItem.get(b)!.lanes, byItem.get(c)!.lanes]).toEqual([2, 2, 2]);
      expect([byItem.get(d)!.lane, byItem.get(d)!.lanes]).toEqual([0, 1]);
    });

    it('lays a short item out as one slot long, so the next in its lane is not drawn over it', () => {
      const short = item(at(3, 9), at(3, 9, 5));
      const next = item(at(3, 9, 10), at(3, 10));
      const pieces = timedPieces([short, next], at(3), 0, 1440, 30);
      expect(pieces.map((p) => p.lanes)).toEqual([2, 2]);
    });

    it('clips an item that crosses midnight to each day', () => {
      const late = item(at(3, 22), at(4, 2));
      const [before] = timedPieces([late], at(3), 0, 1440, 30);
      const [after] = timedPieces([late], at(4), 0, 1440, 30);
      expect([before.startMinute, before.endMinute, before.continuesAfter]).toEqual([
        1320,
        1440,
        true,
      ]);
      expect([after.startMinute, after.endMinute, after.continuesBefore]).toEqual([0, 120, true]);
    });

    it('clips to the drawn hours and drops what falls outside them', () => {
      const morning = item(at(3, 6), at(3, 9));
      const early = item(at(3, 6), at(3, 8));
      const pieces = timedPieces([morning, early], at(3), 8 * 60, 18 * 60, 30);
      expect(pieces.map((p) => [p.item, p.startMinute, p.endMinute])).toEqual([
        [morning, 480, 540],
      ]);
    });

    it('leaves spanning items to the all-day row', () => {
      expect(timedPieces([item(at(3), at(4), true)], at(3), 0, 1440, 30)).toEqual([]);
    });
  });

  describe('weekRows', () => {
    // Monday 15 to Sunday 21 June 2026.
    const week = Array.from({ length: 7 }, (_, i) => at(15 + i));
    const titles = (rows: ReturnType<typeof weekRows<string>>) =>
      rows.map((day) => day.map((piece) => (piece ? piece.item.title : '·')));

    it('keeps a bar in one row on every day it covers, and holds that row open elsewhere', () => {
      const meeting = item(at(16, 9), at(16, 10), false, 'meeting');
      const trip = item(at(17), at(20), true, 'trip');
      const holiday = item(at(16), at(18), true, 'holiday');
      expect(titles(weekRows([meeting, trip, holiday], week, true))).toEqual([
        [],
        ['holiday', 'meeting'],
        ['holiday', 'trip'],
        ['·', 'trip'],
        ['·', 'trip'],
        [],
        [],
      ]);
    });

    it('lets a timed item fill a row a bar left open', () => {
      const long = item(at(15), at(18), true, 'long');
      const short = item(at(17), at(18), true, 'short');
      const late = item(at(15, 18), at(15, 19), false, 'late');
      const early = item(at(18, 9), at(18, 10), false, 'early');
      const rows = titles(weekRows([long, short, late, early], week, true));
      expect(rows[0]).toEqual(['long', 'late']);
      expect(rows[2]).toEqual(['long', 'short']);
      expect(rows[3]).toEqual(['early']);
    });

    it('leaves timed items out of the all-day row', () => {
      expect(titles(weekRows([item(at(15, 9), at(15, 10))], week, false))[0]).toEqual([]);
    });
  });

  describe('fitRows', () => {
    const piece = (title: string) => ({
      item: item(at(3), at(4), true, title),
      continuesBefore: false,
      continuesAfter: false,
    });

    it('keeps every row that fits', () => {
      const rows = [piece('a'), null, piece('b')];
      expect(fitRows(rows, 3)).toEqual({ shown: rows, more: 0 });
    });

    it('keeps limit − 1 rows and counts the events left, not the spacers', () => {
      const rows = [piece('a'), null, piece('b'), piece('c')];
      const { shown, more } = fitRows(rows, 3);
      expect(shown).toEqual([rows[0], null]);
      expect(more).toBe(2);
    });
  });

  describe('periods', () => {
    it('draws six weeks for a month, starting on the configured weekday', () => {
      const weeks = visibleWeeks('month', at(15), 1);
      expect(weeks.length).toBe(6);
      // 1 June 2026 is a Monday.
      expect(weeks[0][0]).toEqual(at(1));
    });

    it('draws the week around the anchor', () => {
      // 17 June 2026 is a Wednesday; the Sunday-first week starts on the 14th.
      const [week] = visibleWeeks('week', at(17, 15), 0);
      expect(week[0]).toEqual(at(14));
      expect(week.length).toBe(7);
      expect(visibleRange('week', at(17), 0)).toEqual({ start: at(14), end: at(21) });
    });

    it('draws one day for a day', () => {
      expect(visibleRange('day', at(17, 15), 1)).toEqual({ start: at(17), end: at(18) });
    });

    it('steps by the period', () => {
      expect(shiftAnchor('month', at(30), 1)).toEqual(new Date(2026, 6, 30));
      expect(shiftAnchor('week', at(17), -1)).toEqual(at(10));
      expect(shiftAnchor('day', at(17), 1)).toEqual(at(18));
    });
  });
});

describe('weekBars', () => {
  const week = Array.from({ length: 7 }, (_, i) => new Date(2026, 5, 15 + i));
  let index = 0;
  const make = (
    start: Date,
    end: Date,
    allDay: boolean,
    title: string,
  ): GogSchedulerItem<string> => ({
    event: title,
    index: index++,
    title,
    start,
    end,
    allDay,
    variant: 'accent',
    sourceStart: start,
    sourceEnd: end,
  });
  const bars = (items: GogSchedulerItem<string>[], visible = [9, 9, 9, 9, 9, 9, 9]) =>
    weekBars(weekRows(items, week, true), visible).map(
      (bar) => `${bar.item.title}@${bar.row}:${bar.column}+${bar.span}`,
    );

  it('draws a multi-day item as one bar across its days', () => {
    const trip = make(new Date(2026, 5, 16), new Date(2026, 5, 19), true, 'trip');
    const meeting = make(new Date(2026, 5, 17, 9), new Date(2026, 5, 17, 10), false, 'meeting');
    expect(bars([trip, meeting])).toEqual(['trip@0:1+3', 'meeting@1:2+1']);
  });

  it('breaks a bar where its row is hidden behind "+N more"', () => {
    const trip = make(new Date(2026, 5, 15), new Date(2026, 5, 18), true, 'trip');
    const blocker = make(new Date(2026, 5, 15), new Date(2026, 5, 22), true, 'week');
    expect(bars([trip, blocker], [9, 1, 9, 9, 9, 9, 9])).toEqual([
      'week@0:0+7',
      'trip@1:0+1',
      'trip@1:2+1',
    ]);
  });

  it('marks a bar that runs on past the week', () => {
    const long = make(new Date(2026, 5, 10), new Date(2026, 5, 25), true, 'long');
    const [bar] = weekBars(weekRows([long], week, true), [9, 9, 9, 9, 9, 9, 9]);
    expect([bar.column, bar.span, bar.continuesBefore, bar.continuesAfter]).toEqual([
      0,
      7,
      true,
      true,
    ]);
  });
});
