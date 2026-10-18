/**
 * Everything `gog-scheduler` computes about where an event goes, as pure functions over "wall"
 * dates — `Date`s whose local fields spell the clock the scheduler is drawn in (see
 * `@guildofgleks/ui/shared`'s `time-zone.ts`). The component converts at its boundary and hands
 * these only wall dates, so nothing here knows about time zones.
 *
 * Positions are in **minutes of the day** rather than milliseconds, for the same reason the grid is:
 * a wall day can be 23 or 25 hours long in the browser's own zone, and an hour row has to be an
 * hour of the clock, not an hour of elapsed time.
 */

import {
  addDays,
  addMonths,
  buildMonthGrid,
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@guildofgleks/ui/shared';
import type { GogSchedulerView, GogSeverity } from '@guildofgleks/ui/shared';

/** One consumer event, read through the accessors and placed on the wall clock. */
export interface GogSchedulerItem<T> {
  /** The consumer's own object, untouched. */
  event: T;
  /** Position in `events`, so two otherwise equal items keep a stable order and `track` key. */
  index: number;
  title: string;
  start: Date;
  /** Exclusive, and never before `start`. */
  end: Date;
  allDay: boolean;
  variant: GogSeverity;
  /** The instants the consumer gave, which is what the scheduler hands back out. */
  sourceStart: Date;
  sourceEnd: Date;
}

/** A piece of an item on one day, for the month grid and the all-day row. */
export interface GogSchedulerDayPiece<T> {
  item: GogSchedulerItem<T>;
  /** The item began on an earlier day, or continues onto a later one. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/** A piece of a timed item inside one day column, in minutes of the day. */
export interface GogSchedulerTimedPiece<T> {
  item: GogSchedulerItem<T>;
  /** Clipped to the visible hours. */
  startMinute: number;
  endMinute: number;
  /** Which of `lanes` side-by-side columns it takes, among the items it overlaps. */
  lane: number;
  lanes: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

const MINUTES_PER_DAY = 24 * 60;
const MS_PER_DAY = MINUTES_PER_DAY * 60 * 1000;

/** The first day an item touches. */
export function firstDayOf(item: GogSchedulerItem<unknown>): Date {
  return startOfDay(item.start);
}

/**
 * The last day an item touches. `end` is exclusive, so an item ending exactly at midnight does not
 * reach into the next day — an all-day event from the 3rd to the 5th is written either as
 * `end: <5th, 23:59>` or as `end: <6th, 00:00>`, and both mean the same three days.
 */
export function lastDayOf(item: GogSchedulerItem<unknown>): Date {
  if (item.end.getTime() <= item.start.getTime()) return startOfDay(item.start);
  return startOfDay(new Date(item.end.getTime() - 1));
}

/**
 * Whether an item belongs in the month grid's bars and the week view's all-day row rather than in
 * the hour grid: all-day items, and timed ones a day long or more. A 30-hour shift drawn as a
 * column taller than the grid tells the reader less than a bar across two days.
 */
export function isSpanning(item: GogSchedulerItem<unknown>): boolean {
  return item.allDay || item.end.getTime() - item.start.getTime() >= MS_PER_DAY;
}

export function touchesDay(item: GogSchedulerItem<unknown>, day: Date): boolean {
  return !isBeforeDay(day, firstDayOf(item)) && !isAfterDay(day, lastDayOf(item));
}

/**
 * The order a day's items are listed in: spanning ones first (longest first, so a bar across the
 * week sits above a one-day one), then timed ones by start, then by position in `events`.
 */
export function compareItems(a: GogSchedulerItem<unknown>, b: GogSchedulerItem<unknown>): number {
  const spanA = isSpanning(a);
  const spanB = isSpanning(b);
  if (spanA !== spanB) return spanA ? -1 : 1;
  const byStart = a.start.getTime() - b.start.getTime();
  if (byStart !== 0) return byStart;
  const byLength = b.end.getTime() - b.start.getTime() - (a.end.getTime() - a.start.getTime());
  if (byLength !== 0) return byLength;
  return a.index - b.index;
}

/** Every item that touches `day`, in display order. `onlySpanning` keeps the all-day row's. */
export function dayPieces<T>(
  items: readonly GogSchedulerItem<T>[],
  day: Date,
  onlySpanning = false,
): GogSchedulerDayPiece<T>[] {
  return items
    .filter((item) => (!onlySpanning || isSpanning(item)) && touchesDay(item, day))
    .sort(compareItems)
    .map((item) => ({
      item,
      continuesBefore: isBeforeDay(firstDayOf(item), day),
      continuesAfter: isAfterDay(lastDayOf(item), day),
    }));
}

/** Minutes since midnight of `day` at which `date` falls, clamped to that day. */
function minuteOfDay(date: Date, day: Date): number {
  if (isBeforeDay(date, day)) return 0;
  if (isAfterDay(date, day)) return MINUTES_PER_DAY;
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

/**
 * The timed items of one day column, clipped to `[startMinute, endMinute)` and laid out in lanes:
 * items that overlap share the column's width, and an item that overlaps nothing takes all of it.
 *
 * An item shorter than `minDuration` is laid out as if it were that long, because that is how tall
 * it is drawn — laid out at its real length, the next item in its lane would be drawn on top of it.
 */
export function timedPieces<T>(
  items: readonly GogSchedulerItem<T>[],
  day: Date,
  startMinute: number,
  endMinute: number,
  minDuration: number,
): GogSchedulerTimedPiece<T>[] {
  const pieces = items
    .filter((item) => !isSpanning(item) && touchesDay(item, day))
    .map((item) => {
      const from = minuteOfDay(item.start, day);
      const to = item.end.getTime() <= item.start.getTime() ? from : minuteOfDay(item.end, day);
      return { item, from, to };
    })
    // Inside the visible hours: it starts before they end, and it ends after they start — or it is
    // an instant (no length) at or after their start.
    .filter(
      ({ from, to }) =>
        from < endMinute && (to > startMinute || (to === from && from >= startMinute)),
    )
    .map(({ item, from, to }) => ({
      item,
      startMinute: Math.max(from, startMinute),
      endMinute: Math.min(to, endMinute),
      lane: 0,
      lanes: 1,
      continuesBefore: isBeforeDay(item.start, day),
      continuesAfter: isAfterDay(lastDayOf(item), day),
    }))
    .sort(
      (a, b) =>
        a.startMinute - b.startMinute ||
        b.endMinute - b.startMinute - (a.endMinute - a.startMinute) ||
        a.item.index - b.item.index,
    );

  // Clusters of transitively overlapping pieces; within one, each piece takes the first lane free
  // by its start, and every piece in the cluster is as wide as the cluster has lanes.
  let cluster: GogSchedulerTimedPiece<T>[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;
  const close = () => {
    for (const piece of cluster) piece.lanes = laneEnds.length;
    cluster = [];
    laneEnds = [];
  };

  for (const piece of pieces) {
    const drawnEnd = Math.max(piece.endMinute, piece.startMinute + minDuration);
    if (piece.startMinute >= clusterEnd) close();
    let lane = laneEnds.findIndex((end) => end <= piece.startMinute);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(drawnEnd);
    } else {
      laneEnds[lane] = drawnEnd;
    }
    piece.lane = lane;
    cluster.push(piece);
    clusterEnd = Math.max(clusterEnd, drawnEnd);
  }
  close();

  return pieces;
}

/** How far into the week `date` sits, given which weekday the week starts on. */
export function weekdayOffset(date: Date, firstDayOfWeek: number): number {
  return (date.getDay() - firstDayOfWeek + 7) % 7;
}

/** The days a view draws, as weeks: six for a month, one for a week or a day. */
export function visibleWeeks(
  view: GogSchedulerView,
  anchor: Date,
  firstDayOfWeek: number,
): Date[][] {
  const day = startOfDay(anchor);
  if (view === 'month') return buildMonthGrid(day.getFullYear(), day.getMonth(), firstDayOfWeek);
  if (view === 'day') return [[day]];
  const first = addDays(day, -weekdayOffset(day, firstDayOfWeek));
  return [Array.from({ length: 7 }, (_, i) => addDays(first, i))];
}

/** `[start, end)` of what a view draws, as wall dates at midnight. */
export function visibleRange(
  view: GogSchedulerView,
  anchor: Date,
  firstDayOfWeek: number,
): { start: Date; end: Date } {
  const weeks = visibleWeeks(view, anchor, firstDayOfWeek);
  const last = weeks[weeks.length - 1];
  return { start: weeks[0][0], end: addDays(last[last.length - 1], 1) };
}

/** The anchor one period earlier (`-1`) or later (`1`). */
export function shiftAnchor(view: GogSchedulerView, anchor: Date, step: number): Date {
  if (view === 'month') return addMonths(startOfDay(anchor), step);
  return addDays(startOfDay(anchor), step * (view === 'week' ? 7 : 1));
}

/**
 * Each day's rows for one week — the month grid's week row, or the week view's all-day row.
 *
 * **A spanning item keeps one row on every day it covers**, so its pieces line up into one bar
 * across the week; it takes the lowest row free on all of those days, longest and earliest first.
 * With `includeTimed`, timed items then fill each day's free rows from the top, in start order.
 * `null` is a row held open for a bar on another day, so the next row stays aligned.
 */
export function weekRows<T>(
  items: readonly GogSchedulerItem<T>[],
  week: readonly Date[],
  includeTimed: boolean,
): (GogSchedulerDayPiece<T> | null)[][] {
  const rows: (GogSchedulerDayPiece<T> | null)[][] = week.map(() => []);
  const pieceOn = (item: GogSchedulerItem<T>, day: Date): GogSchedulerDayPiece<T> => ({
    item,
    continuesBefore: isBeforeDay(firstDayOf(item), day),
    continuesAfter: isAfterDay(lastDayOf(item), day),
  });

  const spanning = items
    .filter((item) => isSpanning(item) && week.some((day) => touchesDay(item, day)))
    .sort(compareItems);
  for (const item of spanning) {
    const covered = week.flatMap((day, i) => (touchesDay(item, day) ? [i] : []));
    let row = 0;
    while (covered.some((i) => rows[i][row])) row++;
    for (const i of covered) rows[i][row] = pieceOn(item, week[i]);
  }

  if (includeTimed) {
    week.forEach((day, i) => {
      const timed = items
        .filter((item) => !isSpanning(item) && touchesDay(item, day))
        .sort(compareItems);
      let row = 0;
      for (const item of timed) {
        while (rows[i][row]) row++;
        rows[i][row] = pieceOn(item, day);
      }
    });
  }

  // Holes left by `rows[i][row] = …` become explicit spacers; nothing trails the last piece.
  return rows.map((day) => Array.from({ length: day.length }, (_, row) => day[row] ?? null));
}

/**
 * The rows a month cell draws when it has room for `limit`: all of them if they fit, otherwise the
 * first `limit - 1` and a count of the events left out, which "+N more" reports.
 */
export function fitRows<T>(
  rows: readonly (GogSchedulerDayPiece<T> | null)[],
  limit: number,
): { shown: (GogSchedulerDayPiece<T> | null)[]; more: number } {
  if (rows.length <= limit) return { shown: [...rows], more: 0 };
  const shown = rows.slice(0, Math.max(0, limit - 1));
  const hidden = rows.slice(shown.length).filter((row) => row !== null).length;
  return { shown, more: hidden };
}

/** One bar of a week row: an item drawn once across the consecutive days it shows on. */
export interface GogSchedulerBar<T> {
  item: GogSchedulerItem<T>;
  /** First column, 0-based, and how many columns it spans. */
  column: number;
  span: number;
  /** Its row in the week, 0-based. */
  row: number;
  /** The item began before the bar's first day, or goes on after its last. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * `weekRows`' pieces joined into bars: the same item on consecutive days in the same row is one bar.
 * A row hidden on a day (`visible[i]` rows are shown there) breaks the bar, so a bar never runs
 * under a day's "+N more".
 */
export function weekBars<T>(
  rows: readonly (readonly (GogSchedulerDayPiece<T> | null)[])[],
  visible: readonly number[],
): GogSchedulerBar<T>[] {
  const bars: GogSchedulerBar<T>[] = [];
  const height = Math.max(0, ...rows.map((day) => day.length));
  for (let row = 0; row < height; row++) {
    let open: GogSchedulerBar<T> | null = null;
    rows.forEach((day, column) => {
      const piece = row < visible[column] ? (day[row] ?? null) : null;
      if (open && piece && piece.item === open.item) {
        open.span++;
        open.continuesAfter = piece.continuesAfter;
        return;
      }
      open = piece
        ? {
            item: piece.item,
            column,
            span: 1,
            row,
            continuesBefore: piece.continuesBefore,
            continuesAfter: piece.continuesAfter,
          }
        : null;
      if (open) bars.push(open);
    });
  }
  return bars;
}
