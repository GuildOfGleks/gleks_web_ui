import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  PLATFORM_ID,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import {
  ButtonComponent,
  ButtonToggleGroupComponent,
  ContextMenuComponent,
  GogContextMenuContentDirective,
  GogContextMenuTriggerDirective,
  GogMenuItemDirective,
  IconComponent,
  PopoverComponent,
  ScrollComponent,
} from '@guildofgleks/ui';
import {
  GOG_CONFIG,
  type GogOptionAccessor,
  type GogSchedulerMoreAction,
  type GogSchedulerView,
  type GogSeverity,
  addDays,
  configurableBooleanAttribute,
  copyTimeOnto,
  gogFromZonedTime,
  gogResolveTimeZone,
  gogToZonedTime,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  localeFirstDayOfWeek,
  readOption,
  resolveConfigured,
  startOfDay,
  weekdayNames,
} from '@guildofgleks/ui/shared';

import {
  type GogSchedulerEventContext,
  GogSchedulerEventDirective,
} from './scheduler-event.directive';
import {
  type GogSchedulerDayPiece,
  type GogSchedulerItem,
  type GogSchedulerTimedPiece,
  dayPieces,
  fitRows,
  shiftAnchor,
  timedPieces,
  visibleRange,
  visibleWeeks,
  weekRows,
  weekdayOffset,
} from './scheduler-layout';

/** What `gogEventClick` carries: the consumer's event and the instants it was read as. */
export interface GogSchedulerEventClick<T> {
  event: T;
  start: Date;
  end: Date;
  allDay: boolean;
}

/** An empty stretch of time that was pressed — a slot of the hour grid, or a whole day. */
export interface GogSchedulerSlot {
  start: Date;
  /** Exclusive. */
  end: Date;
  allDay: boolean;
}

/**
 * A move or a new end chosen from the context menu: the event and where it would go. The scheduler
 * does not change `events` — apply it, or don't.
 */
export interface GogSchedulerEventChange<T> {
  event: T;
  /** `'move'` keeps the length; `'resize'` keeps the start and moves the end. */
  change: 'move' | 'resize';
  start: Date;
  /** Exclusive. */
  end: Date;
  allDay: boolean;
  previousStart: Date;
  previousEnd: Date;
}

/** What is drawn, `[start, end)` as instants — the period to load events for. */
export interface GogSchedulerRange {
  start: Date;
  end: Date;
  view: GogSchedulerView;
}

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_MONTH_EVENT_LIMIT = 3;
const DEFAULT_MORE_ACTION: GogSchedulerMoreAction = 'popover';
const DEFAULT_READONLY = true;
const VIEWS: readonly GogSchedulerView[] = ['month', 'week', 'day'];
const SEVERITIES: readonly GogSeverity[] = ['accent', 'success', 'danger', 'warning', 'info'];
const MINUTE = 60 * 1000;

const DEFAULT_LABELS = {
  today: 'Today',
  previousPeriod: (view: GogSchedulerView) => `Previous ${view}`,
  nextPeriod: (view: GogSchedulerView) => `Next ${view}`,
  schedulerViews: 'View',
  monthView: 'Month',
  weekView: 'Week',
  dayView: 'Day',
  allDay: 'All day',
  moreEvents: (count: number) => `+${count} more`,
  eventActions: 'Event actions',
  newEvent: 'New event',
  moveEvent: 'Move',
  resizeEvent: 'Change end',
  deleteEvent: 'Delete',
  movingEvent: (title: string) => `Moving "${title}": choose a new start`,
  resizingEvent: (title: string) => `Changing the end of "${title}": choose where it ends`,
  cancel: 'Cancel',
};

/** What the context menu was opened on. */
type MenuTarget<T> =
  | { kind: 'event'; event: EventView<T> }
  | { kind: 'slot'; day: Date; minute: number }
  | { kind: 'day'; day: Date };

/** A move or a new end waiting for the place it goes, chosen from the context menu. */
interface Pending<T> {
  change: 'move' | 'resize';
  item: GogSchedulerItem<T>;
}

/** One event as a view draws it: where it sits, what it is called, and what its template gets. */
interface EventView<T> {
  /** Unique within the view: an event drawn on three days is three buttons. */
  key: string;
  item: GogSchedulerItem<T>;
  day: Date;
  name: string;
  /** The time range, for the hour grid; `''` for an all-day event. */
  time: string;
  /** Only the start time, for a month cell's one line; `''` for an all-day event. */
  startTime: string;
  context: GogSchedulerEventContext<T>;
  continuesBefore: boolean;
  continuesAfter: boolean;
  /**
   * Whether the title is drawn. A bar across several days draws it once at its start, and again
   * at the start of each week row it reaches; its other pieces are the bar alone.
   */
  showLabel: boolean;
  /** Timed pieces only: offset and length in slots, and the lane geometry in percent. */
  top: number;
  height: number;
  inset: number;
  width: number;
}

interface MonthCell<T> {
  date: Date;
  key: number;
  label: string;
  name: string;
  outside: boolean;
  today: boolean;
  /** One per row; `null` holds a row open for a bar drawn on another day of the week. */
  rows: (EventView<T> | null)[];
  /** Events the cell has no room for; "+N more" lists them, or opens the day. */
  more: number;
}

interface DayColumn<T> {
  date: Date;
  key: number;
  weekday: string;
  label: string;
  name: string;
  today: boolean;
  /** The all-day row, packed across the week as the month grid is; `null` holds a row open. */
  allDay: (EventView<T> | null)[];
  timed: EventView<T>[];
  slots: { minute: number; name: string }[];
}

type FocusKind = 'day' | 'header' | 'allday' | 'slot' | 'event' | 'more';

/**
 * A month, week or day of events.
 *
 * ```html
 * <gog-scheduler
 *   [events]="bookings()"
 *   eventStart="from" eventEnd="to" eventTitle="room"
 *   [(view)]="view" [(date)]="date"
 *   (gogRangeChange)="load($event)"
 *   (gogEventClick)="open($event.event)"
 *   (gogSlotClick)="create($event)"
 * />
 * ```
 *
 * **It draws events; it does not own them.** `events` is the consumer's own array, read through
 * accessors like `gog-select`'s options, and every change goes back out as an output — the app
 * decides what a press on an empty slot means. `gogRangeChange` fires with the period drawn, on
 * first render and after every navigation, which is the moment to load that period's events.
 *
 * **Keyboard.** The focused day carries the tab stops: its cell or slot, its events, and in the
 * week view its header and all-day cell. Arrows move the day (and, in the hour grid, the slot),
 * Home/End go to the ends of the week (or the day's first and last slot), PageUp/PageDown change
 * the period — and moving past what is drawn moves the view with it.
 *
 * **Editing.** With `readonly` off, a right-click — or the ContextMenu key, or Shift+F10 — opens
 * a `gog-context-menu`: "New event" on a slot or a day, and Move, Change end and Delete on an event.
 * Move and Change end then wait for the place: the next slot or day pressed, by pointer or Enter,
 * is where it goes, and Escape cancels. Each comes out as an output; `events` is never changed.
 *
 * Its `locale`, `firstDayOfWeek` and `timeZone` fall back to `GOG_CONFIG.datepicker`'s, the
 * app's calendar settings. With a `timeZone`, every `Date` in and out is still an instant: events
 * are drawn on that zone's clock, and a pressed slot is the moment that clock time means there.
 */
@Component({
  selector: 'gog-scheduler',
  imports: [
    ButtonComponent,
    ButtonToggleGroupComponent,
    ContextMenuComponent,
    GogContextMenuContentDirective,
    GogContextMenuTriggerDirective,
    GogMenuItemDirective,
    IconComponent,
    NgTemplateOutlet,
    PopoverComponent,
    ScrollComponent,
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-scheduler',
    '[class.gog-scheduler--month]': "view() === 'month'",
    '[class.gog-scheduler--week]': "view() === 'week'",
    '[class.gog-scheduler--day]': "view() === 'day'",
    role: 'region',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabel() ? null : titleId',
    '[class.gog-scheduler--picking]': 'pending() !== null',
    '(keydown.escape)': 'cancelPending()',
  },
})
export class SchedulerComponent<T = unknown> {
  private static nextUid = 0;
  protected readonly uid = ++SchedulerComponent.nextUid;
  protected readonly titleId = `gog-scheduler-${this.uid}-title`;

  /** The consumer's events, read through the five accessors below. */
  readonly events = input<readonly T[]>([]);
  /** A `Date`, an ISO string or a timestamp. An event whose start cannot be read is skipped. */
  readonly eventStart =
    input<GogOptionAccessor<T, Date | string | number | null | undefined>>('start');
  /**
   * Exclusive. Missing or before the start, a timed event lasts one `slotDuration` and an all-day
   * one its start day.
   */
  readonly eventEnd = input<GogOptionAccessor<T, Date | string | number | null | undefined>>('end');
  readonly eventTitle = input<GogOptionAccessor<T, string | null | undefined>>('title');
  readonly eventAllDay = input<GogOptionAccessor<T, boolean | null | undefined>>('allDay');
  /** Its colour, as a severity; anything else is `'accent'`. */
  readonly eventVariant = input<GogOptionAccessor<T, GogSeverity | null | undefined>>('variant');

  /** Which period is drawn. Two-way, so a view switch the reader makes reaches the app. */
  readonly view = model<GogSchedulerView>('month');
  /** The views the toolbar offers. One or none hides the switch. */
  readonly views = input<readonly GogSchedulerView[]>(VIEWS);
  /** Any instant inside the period to draw. Unset, today. Two-way: navigation writes it. */
  readonly date = model<Date | null>(null);

  /** The first and last hour the week and day views draw, on the scheduler's clock. */
  readonly dayStartHour = input(0);
  readonly dayEndHour = input(24);
  /** Minutes per row of the hour grid, and the length of a pressed slot. */
  readonly slotDuration = input(30);
  /** Where the hour grid is scrolled to when a week or day view opens. */
  readonly scrollToHour = input(8);
  /**
   * Rows a month cell draws, "+N more" included when its day has more: with `3`, a day of five
   * events shows two and "+3 more". The cell is as tall as the rows. Unset,
   * `GOG_CONFIG.scheduler.monthEventLimit`, then `3`.
   */
  readonly monthEventLimit = input<number | undefined>(undefined);
  /**
   * What "+N more" opens: `'popover'` lists the day's events beside the cell, `'day'` switches to
   * the day view. Unset, `GOG_CONFIG.scheduler.moreEventsAction`, then `'popover'`.
   */
  readonly moreEventsAction = input<GogSchedulerMoreAction | undefined>(undefined);
  /**
   * On (the default), the scheduler draws events and reports presses. Off, it also opens a context
   * menu to create, move, extend and delete events. Unset, `GOG_CONFIG.scheduler.readonly`.
   */
  readonly readonly = input<boolean | undefined, unknown>(undefined, {
    transform: configurableBooleanAttribute,
  });

  /** Unset, falls back to `GOG_CONFIG.datepicker.locale`, then to `'en-US'`. */
  readonly locale = input<string | undefined>(undefined);
  /** 0 = Sunday … 6 = Saturday. Unset, `GOG_CONFIG.datepicker.firstDayOfWeek`, then the locale's. */
  readonly firstDayOfWeek = input<number | undefined>(undefined);
  /** IANA zone the scheduler is drawn in. Unset, `GOG_CONFIG.datepicker.timeZone`, then the browser's. */
  readonly timeZone = input<string | undefined>(undefined);
  /** Names the region. Unset, the toolbar's title ("October 2026") does. */
  readonly ariaLabel = input('');

  /** An event was pressed. */
  readonly gogEventClick = output<GogSchedulerEventClick<T>>();
  /** An empty slot of the hour grid, or a day, was pressed. */
  readonly gogSlotClick = output<GogSchedulerSlot>();
  /** The period drawn changed — and once on first render. Load its events here. */
  readonly gogRangeChange = output<GogSchedulerRange>();
  /** Editable only: "New event" was chosen on a slot or a day. */
  readonly gogEventCreate = output<GogSchedulerSlot>();
  /** Editable only: "Delete" was chosen on an event. */
  readonly gogEventDelete = output<GogSchedulerEventClick<T>>();
  /** Editable only: a move or a new end was chosen, and the place it goes was pressed. */
  readonly gogEventChange = output<GogSchedulerEventChange<T>>();

  protected readonly eventTemplate = contentChild(GogSchedulerEventDirective);
  private readonly hourScroll = viewChild(ScrollComponent);
  private readonly morePopover = viewChild.required(PopoverComponent);

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly resolvedLocale = computed(() =>
    resolveConfigured(this.locale(), this.globalConfig.datepicker?.locale, DEFAULT_LOCALE),
  );
  protected readonly resolvedFirstDayOfWeek = computed(
    () =>
      this.firstDayOfWeek() ??
      this.globalConfig.datepicker?.firstDayOfWeek ??
      localeFirstDayOfWeek(this.resolvedLocale()),
  );
  private readonly resolvedTimeZone = computed(() =>
    gogResolveTimeZone(this.timeZone() ?? this.globalConfig.datepicker?.timeZone),
  );

  protected readonly labels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      today: configured.today ?? DEFAULT_LABELS.today,
      previousPeriod: configured.previousPeriod ?? DEFAULT_LABELS.previousPeriod,
      nextPeriod: configured.nextPeriod ?? DEFAULT_LABELS.nextPeriod,
      schedulerViews: configured.schedulerViews ?? DEFAULT_LABELS.schedulerViews,
      monthView: configured.monthView ?? DEFAULT_LABELS.monthView,
      weekView: configured.weekView ?? DEFAULT_LABELS.weekView,
      dayView: configured.dayView ?? DEFAULT_LABELS.dayView,
      allDay: configured.allDay ?? DEFAULT_LABELS.allDay,
      moreEvents: configured.moreEvents ?? DEFAULT_LABELS.moreEvents,
      eventActions: configured.eventActions ?? DEFAULT_LABELS.eventActions,
      newEvent: configured.newEvent ?? DEFAULT_LABELS.newEvent,
      moveEvent: configured.moveEvent ?? DEFAULT_LABELS.moveEvent,
      resizeEvent: configured.resizeEvent ?? DEFAULT_LABELS.resizeEvent,
      deleteEvent: configured.deleteEvent ?? DEFAULT_LABELS.deleteEvent,
      movingEvent: configured.movingEvent ?? DEFAULT_LABELS.movingEvent,
      resizingEvent: configured.resizingEvent ?? DEFAULT_LABELS.resizingEvent,
      cancel: configured.cancel ?? DEFAULT_LABELS.cancel,
    };
  });

  protected readonly isReadonly = computed(() =>
    resolveConfigured(this.readonly(), this.globalConfig.scheduler?.readonly, DEFAULT_READONLY),
  );
  private readonly resolvedMoreAction = computed(() =>
    resolveConfigured(
      this.moreEventsAction(),
      this.globalConfig.scheduler?.moreEventsAction,
      DEFAULT_MORE_ACTION,
    ),
  );
  protected readonly monthLimit = computed(() =>
    clampInt(
      resolveConfigured(
        this.monthEventLimit(),
        this.globalConfig.scheduler?.monthEventLimit,
        DEFAULT_MONTH_EVENT_LIMIT,
      ),
      1,
      50,
    ),
  );
  /**
   * A month cell's height, from its rows: the day number's row, then `monthLimit` event rows and
   * the gaps between them, inside the cell's padding. Bound inline because the row count is a
   * number the template has and the stylesheet does not.
   */
  protected readonly cellHeight = computed(() => {
    const rows = this.monthLimit();
    return (
      `calc(var(--gog-scheduler-cell-padding) * 3 + var(--gog-scheduler-day-number-size) + ` +
      `var(--gog-scheduler-event-min-height) * ${rows} + var(--gog-scheduler-event-gap) * ${rows - 1})`
    );
  });

  protected readonly viewOptions = computed(() => {
    const labels = this.labels();
    const names = { month: labels.monthView, week: labels.weekView, day: labels.dayView };
    return this.views()
      .filter((view) => VIEWS.includes(view))
      .map((view) => ({ id: view, name: names[view] }));
  });

  // ── The clock ────────────────────────────────────────────────────────────────

  /** The current instant, moved on every minute in the browser so "now" and "today" keep up. */
  private readonly now = signal(new Date());
  protected readonly today = computed(() => startOfDay(this.toWall(this.now())), {
    equal: sameTime,
  });
  /** Midnight of the day the drawn period is anchored on. */
  private readonly anchor = computed(() => startOfDay(this.toWall(this.date()) ?? this.today()), {
    equal: sameTime,
  });

  protected readonly startMinute = computed(() => clampInt(this.dayStartHour(), 0, 23) * 60);
  protected readonly endMinute = computed(() =>
    Math.max(clampInt(this.dayEndHour(), 1, 24) * 60, this.startMinute() + 60),
  );
  protected readonly slotMinutes = computed(() => clampInt(this.slotDuration(), 5, 240));

  private readonly weeks = computed(() =>
    visibleWeeks(this.view(), this.anchor(), this.resolvedFirstDayOfWeek()),
  );
  private readonly range = computed(
    () => visibleRange(this.view(), this.anchor(), this.resolvedFirstDayOfWeek()),
    { equal: (a, b) => sameTime(a.start, b.start) && sameTime(a.end, b.end) },
  );

  // ── Formatting ───────────────────────────────────────────────────────────────
  // Every formatter is handed wall dates and no `timeZone`: a wall date's local fields already spell
  // the scheduler's clock, so formatting it in the browser's zone prints exactly that.

  private readonly formats = computed(() => {
    const locale = this.resolvedLocale();
    return {
      month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      weekRange: new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      longDay: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      dayName: new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
      dayNumber: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      time: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
      slot: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  });

  protected readonly title = computed(() => {
    const formats = this.formats();
    const { start, end } = this.range();
    switch (this.view()) {
      case 'month':
        return formats.month.format(this.anchor());
      case 'week':
        return formats.weekRange.formatRange(start, addDays(end, -1));
      default:
        return formats.longDay.format(start);
    }
  });

  /** The weekday column headers of the month grid. */
  protected readonly weekdays = computed(() => {
    const locale = this.resolvedLocale();
    const first = this.resolvedFirstDayOfWeek();
    const short = weekdayNames(locale, first, 'short');
    const long = weekdayNames(locale, first, 'long');
    return short.map((label, i) => ({ label, name: long[i] }));
  });

  /** The hour labels down the side of the hour grid. */
  protected readonly hours = computed(() => {
    const format = this.formats().time;
    const day = this.anchor();
    const hours: { minute: number; label: string }[] = [];
    for (let minute = this.startMinute(); minute < this.endMinute(); minute += 60) {
      hours.push({ minute, label: format.format(atMinute(day, minute)) });
    }
    return hours;
  });

  // ── Events ───────────────────────────────────────────────────────────────────

  private readonly items = computed<GogSchedulerItem<T>[]>(() => {
    const startAccessor = this.eventStart();
    const endAccessor = this.eventEnd();
    const titleAccessor = this.eventTitle();
    const allDayAccessor = this.eventAllDay();
    const variantAccessor = this.eventVariant();
    const slot = this.slotMinutes() * MINUTE;
    const items: GogSchedulerItem<T>[] = [];

    this.events().forEach((event, index) => {
      const sourceStart = toDate(readOption(event, startAccessor));
      if (!sourceStart) return;
      const allDay = readOption(event, allDayAccessor) === true;
      const readEnd = toDate(readOption(event, endAccessor));
      const sourceEnd =
        readEnd && readEnd.getTime() >= sourceStart.getTime()
          ? readEnd
          : allDay
            ? sourceStart
            : new Date(sourceStart.getTime() + slot);
      const variant = readOption(event, variantAccessor);
      items.push({
        event,
        index,
        title: String(readOption(event, titleAccessor) ?? ''),
        start: this.toWall(sourceStart),
        end: this.toWall(sourceEnd),
        allDay,
        variant: variant && SEVERITIES.includes(variant) ? variant : 'accent',
        sourceStart,
        sourceEnd,
      });
    });
    return items;
  });

  /** The month grid, six weeks of cells. Empty in the other views. */
  protected readonly monthWeeks = computed<MonthCell<T>[][]>(() => {
    if (this.view() !== 'month') return [];
    const items = this.items();
    const anchor = this.anchor();
    const today = this.today();
    const limit = this.monthLimit();
    const formats = this.formats();

    return this.weeks().map((week) => {
      const rows = weekRows(items, week, true);
      return week.map((date, i) => {
        const { shown, more } = fitRows(rows[i], limit);
        return {
          date,
          key: date.getTime(),
          label: formats.dayNumber.format(date),
          name: formats.dayName.format(date),
          outside: !isSameMonth(date, anchor),
          today: isSameDay(date, today),
          rows: shown.map((piece) => (piece ? this.dayEventView(piece, date, i === 0) : null)),
          more,
        };
      });
    });
  });

  /** The week or day view's columns. Empty in the month view. */
  protected readonly columns = computed<DayColumn<T>[]>(() => {
    if (this.view() === 'month') return [];
    const items = this.items();
    const today = this.today();
    const formats = this.formats();
    const from = this.startMinute();
    const to = this.endMinute();
    const step = this.slotMinutes();

    const week = this.weeks()[0];
    const allDayRows = weekRows(items, week, false);
    return week.map((date, i) => {
      const slots: { minute: number; name: string }[] = [];
      for (let minute = from; minute < to; minute += step) {
        slots.push({ minute, name: formats.slot.format(atMinute(date, minute)) });
      }
      return {
        date,
        key: date.getTime(),
        weekday: formats.weekday.format(date),
        label: formats.dayNumber.format(date),
        name: formats.dayName.format(date),
        today: isSameDay(date, today),
        allDay: allDayRows[i].map((piece) =>
          piece ? this.dayEventView(piece, date, i === 0) : null,
        ),
        timed: timedPieces(items, date, from, to, step).map((piece) =>
          this.timedEventView(piece, date),
        ),
        slots,
      };
    });
  });

  /** Where the "now" line sits in the hour grid, in slots from the top, or `null` off the grid. */
  protected readonly nowOffset = computed(() => {
    const wall = this.toWall(this.now());
    const minute = wall.getHours() * 60 + wall.getMinutes();
    if (minute < this.startMinute() || minute >= this.endMinute()) return null;
    return (minute - this.startMinute()) / this.slotMinutes();
  });

  // ── "+N more" ────────────────────────────────────────────────────────────────

  /** The day whose events the popover lists, while it is open. */
  protected readonly moreDay = signal<Date | null>(null);
  protected readonly moreDayName = computed(() => {
    const day = this.moreDay();
    return day ? this.formats().dayName.format(day) : '';
  });
  /** Every event of that day, in the order the cell draws them — a list, so no bars and no gaps. */
  protected readonly moreDayEvents = computed(() => {
    const day = this.moreDay();
    if (!day) return [];
    return dayPieces(this.items(), day).map((piece) =>
      this.eventView(piece.item, day, false, false, true, 0, 0, 0, 100),
    );
  });

  // ── Editing ──────────────────────────────────────────────────────────────────

  /** Never read: types the context menu template's `let-target`. */
  protected readonly menuTargets: readonly MenuTarget<T>[] = [];

  /** A move or a new end chosen from the menu, waiting for the slot or day it goes to. */
  protected readonly pending = signal<Pending<T> | null>(null);
  protected readonly pendingText = computed(() => {
    const pending = this.pending();
    if (!pending) return '';
    const labels = this.labels();
    return pending.change === 'move'
      ? labels.movingEvent(pending.item.title)
      : labels.resizingEvent(pending.item.title);
  });

  /** Every event button drawn, by its key, so a right-click on one can find what it shows. */
  private readonly drawnEvents = computed(() => {
    const drawn = new Map<string, EventView<T>>();
    for (const week of this.monthWeeks()) {
      for (const cell of week) for (const row of cell.rows) if (row) drawn.set(row.key, row);
    }
    for (const column of this.columns()) {
      for (const row of column.allDay) if (row) drawn.set(row.key, row);
      for (const event of column.timed) drawn.set(event.key, event);
    }
    for (const event of this.moreDayEvents()) drawn.set(event.key, event);
    return drawn;
  });

  /**
   * What a right-click landed on, for `gogContextMenuResolve`. An arrow function so the template can
   * hand it over as it is. `null` — a press outside any day — leaves the browser's own menu.
   */
  protected readonly resolveMenuTarget = (element: HTMLElement): MenuTarget<T> | null => {
    const target = element.closest<HTMLElement>('[data-kind]');
    if (!target) return null;
    const kind = target.dataset['kind'];
    if (kind === 'event') {
      const event = this.drawnEvents().get(target.dataset['key'] ?? '');
      return event ? { kind: 'event', event } : null;
    }
    const day = new Date(Number(target.dataset['day']));
    if (kind === 'slot') return { kind: 'slot', day, minute: Number(target.dataset['minute']) };
    return { kind: 'day', day };
  };

  // ── Focus ────────────────────────────────────────────────────────────────────

  private readonly focusedDayState = signal<Date | null>(null);
  private readonly focusedMinuteState = signal<number | null>(null);

  /** The day carrying the tab stops: the one last focused if it is drawn, else today, else the anchor. */
  protected readonly focusedDay = computed(() => {
    const { start, end } = this.range();
    const drawn = (day: Date | null) =>
      day !== null && !isBeforeDay(day, start) && isBeforeDay(day, end);
    const candidates = [this.focusedDayState(), this.today(), this.anchor()];
    return candidates.find(drawn) ?? start;
  });

  /** The slot of the hour grid carrying its tab stop, snapped to a slot inside the drawn hours. */
  protected readonly focusedMinute = computed(() => {
    const from = this.startMinute();
    const step = this.slotMinutes();
    const wanted = this.focusedMinuteState() ?? clampInt(this.scrollToHour(), 0, 23) * 60;
    const last = from + Math.floor((this.endMinute() - from - 1) / step) * step;
    const snapped = from + Math.floor((wanted - from) / step) * step;
    return Math.min(Math.max(snapped, from), last);
  });

  constructor() {
    // The period drawn goes out as instants whenever it moves, and once at first render.
    effect(() => {
      const range = this.range();
      const view = this.view();
      untracked(() =>
        this.gogRangeChange.emit({
          start: this.fromWall(range.start),
          end: this.fromWall(range.end),
          view,
        }),
      );
    });

    // Open an hour grid scrolled to `scrollToHour`, not at midnight.
    effect(() => {
      if (this.view() === 'month') return;
      const minute = clampInt(this.scrollToHour(), 0, 23) * 60;
      afterNextRender(() => this.scrollHourGridTo(minute), { injector: this.injector });
    });

    if (this.isBrowser) {
      const timer = setInterval(() => this.now.set(new Date()), MINUTE);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────────

  protected step(direction: number): void {
    this.moveAnchorTo(shiftAnchor(this.view(), this.anchor(), direction));
  }

  protected goToToday(): void {
    this.moveAnchorTo(this.today());
  }

  protected selectView(view: unknown): void {
    if (typeof view === 'string' && VIEWS.includes(view as GogSchedulerView)) {
      this.view.set(view as GogSchedulerView);
    }
  }

  /** "+N more": the day's events in the popover, or the day view — whichever is configured. */
  protected openMore(day: Date, event: Event): void {
    if (this.resolvedMoreAction() === 'day') {
      this.openDay(day);
      return;
    }
    this.moreDay.set(day);
    this.morePopover().open(event.currentTarget as HTMLElement);
  }

  protected onMoreClosed(): void {
    this.moreDay.set(null);
  }

  /** A day's header in the week view, or "+N more" set to `'day'`: that day, as a day view. */
  protected openDay(day: Date): void {
    this.focusedDayState.set(day);
    this.view.set('day');
    this.moveAnchorTo(day);
  }

  // ── Presses ──────────────────────────────────────────────────────────────────

  protected onEventClick(view: EventView<T>, inPopover = false): void {
    if (inPopover) this.morePopover().close(false);
    // Choosing a place: from the keyboard, Enter on an event picks its day (the pointer passes
    // through events to the slot under them while a place is being chosen).
    if (this.pending()) {
      this.applyPending(view.day, null);
      return;
    }
    this.gogEventClick.emit({
      event: view.item.event,
      start: view.item.sourceStart,
      end: view.item.sourceEnd,
      allDay: view.item.allDay,
    });
  }

  protected onDayClick(day: Date): void {
    if (this.pending()) {
      this.applyPending(day, null);
      return;
    }
    this.gogSlotClick.emit({
      start: this.fromWall(day),
      end: this.fromWall(addDays(day, 1)),
      allDay: true,
    });
  }

  protected onSlotClick(day: Date, minute: number): void {
    if (this.pending()) {
      this.applyPending(day, minute);
      return;
    }
    this.gogSlotClick.emit({
      start: this.fromWall(atMinute(day, minute)),
      end: this.fromWall(atMinute(day, minute + this.slotMinutes())),
      allDay: false,
    });
  }

  // ── The context menu ─────────────────────────────────────────────────────────

  protected createAt(target: MenuTarget<T>): void {
    if (target.kind === 'event') return;
    const allDay = target.kind === 'day';
    const start = allDay ? target.day : atMinute(target.day, target.minute);
    const end = allDay
      ? addDays(target.day, 1)
      : atMinute(target.day, target.minute + this.slotMinutes());
    this.gogEventCreate.emit({ start: this.fromWall(start), end: this.fromWall(end), allDay });
  }

  protected deleteEvent(target: MenuTarget<T>): void {
    if (target.kind !== 'event') return;
    const { item } = target.event;
    this.gogEventDelete.emit({
      event: item.event,
      start: item.sourceStart,
      end: item.sourceEnd,
      allDay: item.allDay,
    });
  }

  /** Move or Change end: from here, the next slot or day pressed is where the event goes. */
  protected startPending(target: MenuTarget<T>, change: 'move' | 'resize'): void {
    if (target.kind !== 'event') return;
    this.pending.set({ change, item: target.event.item });
  }

  protected cancelPending(): void {
    this.pending.set(null);
  }

  protected isPendingItem(item: GogSchedulerItem<T>): boolean {
    return this.pending()?.item === item;
  }

  /**
   * Where a pending change lands, given the slot (`minute`) or the whole day (`minute` null)
   * pressed. A move keeps the event's length — and, dropped on a day, its time of day. A new end
   * keeps the start, and is ignored if it would not come after it.
   */
  private applyPending(day: Date, minute: number | null): void {
    const pending = this.pending();
    if (!pending) return;
    const { item, change } = pending;
    const length = item.end.getTime() - item.start.getTime();
    let start = item.start;
    let end: Date;

    if (change === 'move') {
      if (item.allDay) start = day;
      else start = minute === null ? copyTimeOnto(day, item.start) : atMinute(day, minute);
      end = item.allDay
        ? addDays(start, Math.round(length / (24 * 60 * MINUTE)))
        : new Date(start.getTime() + length);
    } else if (item.allDay || minute === null) {
      end = item.allDay ? addDays(day, 1) : copyTimeOnto(day, item.end);
    } else {
      end = atMinute(day, minute + this.slotMinutes());
    }
    if (change === 'resize' && end.getTime() <= start.getTime()) return;

    this.pending.set(null);
    this.gogEventChange.emit({
      event: item.event,
      change,
      start: this.fromWall(start),
      end: this.fromWall(end),
      allDay: item.allDay,
      previousStart: item.sourceStart,
      previousEnd: item.sourceEnd,
    });
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  /** Whichever element took focus — by Tab or by pointer — carries the tab stops from now on. */
  protected onFocusIn(event: FocusEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-day]');
    if (!target) return;
    this.focusedDayState.set(new Date(Number(target.dataset['day'])));
    if (target.dataset['minute'] !== undefined) {
      this.focusedMinuteState.set(Number(target.dataset['minute']));
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-kind]');
    if (!target) return;
    const kind = target.dataset['kind'] as FocusKind;
    const day = this.focusedDay();
    const rtl = getComputedStyle(this.host).direction === 'rtl';
    const view = this.view();
    const inGrid = kind === 'slot';
    let nextDay = day;
    let nextMinute = this.focusedMinute();

    switch (event.key) {
      case 'ArrowLeft':
        nextDay = addDays(day, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        nextDay = addDays(day, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        if (view === 'month') nextDay = addDays(day, -7);
        else if (inGrid) nextMinute -= this.slotMinutes();
        else return;
        break;
      case 'ArrowDown':
        if (view === 'month') nextDay = addDays(day, 7);
        else if (inGrid) nextMinute += this.slotMinutes();
        else return;
        break;
      case 'Home':
        if (inGrid) nextMinute = this.startMinute();
        else nextDay = addDays(day, -weekdayOffset(day, this.resolvedFirstDayOfWeek()));
        break;
      case 'End':
        if (inGrid) nextMinute = this.endMinute() - 1;
        else nextDay = addDays(day, 6 - weekdayOffset(day, this.resolvedFirstDayOfWeek()));
        break;
      case 'PageUp':
        nextDay = shiftAnchor(view, day, -1);
        break;
      case 'PageDown':
        nextDay = shiftAnchor(view, day, 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    this.focusedDayState.set(nextDay);
    this.focusedMinuteState.set(
      Math.min(Math.max(nextMinute, this.startMinute()), this.endMinute() - 1),
    );
    const { start, end } = this.range();
    if (isBeforeDay(nextDay, start) || !isBeforeDay(nextDay, end)) {
      this.moveAnchorTo(nextDay);
    }
    this.focusKind(
      kind === 'event' || kind === 'more' ? (view === 'month' ? 'day' : 'slot') : kind,
    );
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  protected isFocusedDay(day: Date): boolean {
    return isSameDay(day, this.focusedDay());
  }

  private moveAnchorTo(day: Date): void {
    this.date.set(this.fromWall(day));
  }

  /** After the render the move causes, focus the element of `kind` that now has the tab stop. */
  private focusKind(kind: FocusKind): void {
    afterNextRender(
      () => {
        const host = this.host;
        const element =
          host.querySelector<HTMLElement>(`[data-kind="${kind}"][tabindex="0"]`) ??
          host.querySelector<HTMLElement>(
            `[data-kind="${this.view() === 'month' ? 'day' : 'slot'}"][tabindex="0"]`,
          );
        element?.focus();
      },
      { injector: this.injector },
    );
  }

  private scrollHourGridTo(minute: number): void {
    const slot = this.host.querySelector<HTMLElement>(
      `.gog-scheduler__slot[data-minute="${this.focusedMinuteFor(minute)}"]`,
    );
    if (slot) this.hourScroll()?.scrollTo({ top: slot.offsetTop, behavior: 'instant' });
  }

  /** The slot start at or before `minute`, inside the drawn hours. */
  private focusedMinuteFor(minute: number): number {
    const from = this.startMinute();
    const step = this.slotMinutes();
    return Math.max(from, from + Math.floor((minute - from) / step) * step);
  }

  /** `rowStart`: the day opens a row of the grid, where a continuing bar draws its title again. */
  private dayEventView(piece: GogSchedulerDayPiece<T>, day: Date, rowStart: boolean): EventView<T> {
    return this.eventView(
      piece.item,
      day,
      piece.continuesBefore,
      piece.continuesAfter,
      !piece.continuesBefore || rowStart,
      0,
      0,
      0,
      100,
    );
  }

  private timedEventView(piece: GogSchedulerTimedPiece<T>, day: Date): EventView<T> {
    const step = this.slotMinutes();
    const length = Math.max(piece.endMinute - piece.startMinute, step);
    return this.eventView(
      piece.item,
      day,
      piece.continuesBefore,
      piece.continuesAfter,
      true,
      (piece.startMinute - this.startMinute()) / step,
      length / step,
      (piece.lane / piece.lanes) * 100,
      100 / piece.lanes,
    );
  }

  private eventView(
    item: GogSchedulerItem<T>,
    day: Date,
    continuesBefore: boolean,
    continuesAfter: boolean,
    showLabel: boolean,
    top: number,
    height: number,
    inset: number,
    width: number,
  ): EventView<T> {
    const formats = this.formats();
    const time = item.allDay
      ? ''
      : item.end.getTime() > item.start.getTime()
        ? formats.time.formatRange(item.start, item.end)
        : formats.time.format(item.start);
    const when = item.allDay
      ? `${formatDayRange(formats.dayName, item.start, item.end)}, ${this.labels().allDay}`
      : item.end.getTime() > item.start.getTime()
        ? formats.slot.formatRange(item.start, item.end)
        : formats.slot.format(item.start);
    return {
      key: `${item.index}:${day.getTime()}`,
      item,
      day,
      name: item.title ? `${item.title}, ${when}` : when,
      time,
      startTime: item.allDay ? '' : formats.time.format(item.start),
      context: {
        $implicit: item.event,
        event: item.event,
        title: item.title,
        start: item.sourceStart,
        end: item.sourceEnd,
        allDay: item.allDay,
        time,
        view: this.view(),
      },
      continuesBefore,
      continuesAfter,
      showLabel,
      top,
      height,
      inset,
      width,
    };
  }

  private toWall<D extends Date | null>(date: D): D {
    const zone = this.resolvedTimeZone();
    return (date && zone ? gogToZonedTime(date, zone) : date) as D;
  }

  private fromWall(date: Date): Date {
    const zone = this.resolvedTimeZone();
    return zone ? gogFromZonedTime(date, zone) : date;
  }
}

/** A wall date `minute` minutes after `day`'s midnight on the clock — past 24:00 rolls over. */
function atMinute(day: Date, minute: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute);
}

function sameTime(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

function clampInt(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.min(max, Math.max(min, rounded));
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Monday, October 12" or "October 12 – 14" — the days an all-day event covers. */
function formatDayRange(format: Intl.DateTimeFormat, start: Date, end: Date): string {
  const last = end.getTime() > start.getTime() ? new Date(end.getTime() - 1) : start;
  return isAfterDay(last, start) ? format.formatRange(start, last) : format.format(start);
}
