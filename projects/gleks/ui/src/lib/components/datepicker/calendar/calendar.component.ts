import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';

import { IconComponent } from '../../icon/icon.component';
import { GogDateSelectionMode, GogHourFormat, GogSize } from '../../../shared/types';
import {
  type GogDateRange,
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  copyTimeOnto,
  isAfterDay,
  isBeforeDay,
  isInRange,
  isSameDay,
  isSameMonth,
  isWithinBounds,
  localeFirstDayOfWeek,
  monthNames,
  startOfDay,
  weekdayNames,
  withTime,
} from '../date-utils';

/** What `gog-calendar` and `gog-datepicker` carry, depending on `selectionMode`. */
export type GogDatepickerValue = Date | GogDateRange | null;

/** One rendered day cell. Precomputed so the template stays free of logic. */
export interface GogCalendarDay {
  date: Date;
  label: string;
  outside: boolean;
  today: boolean;
  disabled: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
}

const DEFAULT_LOCALE = 'en-US';

/**
 * The month grid behind `gog-datepicker`, usable on its own for an always-visible calendar.
 *
 * ```html
 * <gog-calendar [(value)]="date" [min]="today" />
 * <gog-calendar selectionMode="range" [(value)]="range" [numberOfMonths]="2" />
 * ```
 *
 * Split out from the field deliberately: `gog-datepicker` is three widgets (a date, a range
 * and a time) behind one selector, and keeping the grid separate is what stops either half
 * from becoming unreadable. It is also exactly what `inline` mode renders.
 */
@Component({
  selector: 'gog-calendar',
  imports: [IconComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class CalendarComponent {
  /** Two-way bindable selection: a `Date` in `'single'` mode, a `GogDateRange` in `'range'`. */
  readonly value = model<GogDatepickerValue>(null);
  readonly selectionMode = input<GogDateSelectionMode>('single');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  /**
   * Extra exclusions, as a predicate rather than a list: an array cannot express "weekends"
   * or "public holidays" without the consumer materialising every date in range first.
   */
  readonly disabledDates = input<((date: Date) => boolean) | null>(null);
  /** BCP-47 tag driving the month and weekday names. */
  readonly locale = input(DEFAULT_LOCALE);
  /** 0 = Sunday … 6 = Saturday. Unset, it comes from the locale. */
  readonly firstDayOfWeek = input<number | null>(null);
  /** Which month to open on when there is no selection yet. */
  readonly defaultMonth = input<Date | null>(null);
  /** How many months to show side by side. Two is what makes a range picker usable. */
  readonly numberOfMonths = input(1);
  readonly showTime = input(false);
  readonly hourFormat = input<GogHourFormat>('24');
  readonly minuteStep = input(1);
  readonly showSeconds = input(false);
  /**
   * The "Today" button, which **selects** today's date — the view follows, because the
   * selection is what the calendar opens on.
   *
   * Kept separate from `showThisMonthButton` on purpose: one button that both selected and
   * navigated read as "jump to today" to anyone who pressed it after paging away, and there is
   * no wording that makes a single control unambiguous about which of the two it does.
   */
  readonly showTodayButton = input(true);
  /**
   * The "This month" button, which only moves the *view* back to the current month and leaves
   * the selection alone. Off by default — it is for browsing far from today without committing
   * to anything, which is the rarer of the two needs.
   */
  readonly showThisMonthButton = input(false);
  readonly size = input<GogSize>('md');
  readonly todayLabel = input('Today');
  readonly thisMonthLabel = input('This month');
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  readonly previousYearLabel = input('Previous year');
  readonly nextYearLabel = input('Next year');

  /** Emitted when a selection is *complete* — a day in single mode, both ends of a range. */
  readonly gogDateSelect = output<GogDatepickerValue>();

  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** First of the leftmost visible month. */
  private readonly viewMonth = signal<Date>(startOfDay(new Date()));
  /** The cell the keyboard is on, and the only one carrying `tabindex="0"`. */
  protected readonly focusedDate = signal<Date>(startOfDay(new Date()));
  /** Drives the range preview while the second end is still being chosen. */
  protected readonly hoverDate = signal<Date | null>(null);
  /** Whether a focus move should also pull the DOM focus over — only after a keypress. */
  private pendingFocus = false;

  protected readonly resolvedFirstDayOfWeek = computed(
    () => this.firstDayOfWeek() ?? localeFirstDayOfWeek(this.locale()),
  );
  protected readonly weekdays = computed(() =>
    weekdayNames(this.locale(), this.resolvedFirstDayOfWeek()),
  );
  private readonly months = computed(() => monthNames(this.locale()));

  private readonly range = computed<GogDateRange>(() => {
    const current = this.value();
    if (this.selectionMode() !== 'range' || current === null || current instanceof Date) {
      return { start: null, end: null };
    }
    return current;
  });
  private readonly singleDate = computed<Date | null>(() => {
    const current = this.value();
    return current instanceof Date ? current : null;
  });

  /** Start/end as currently *displayed*, including the end the pointer is hovering over. */
  private readonly previewRange = computed<GogDateRange>(() => {
    const { start, end } = this.range();
    if (start && !end && this.hoverDate()) {
      return { start, end: this.hoverDate() };
    }
    return { start, end };
  });

  /** One entry per visible month; each is a 6×7 grid. */
  protected readonly monthViews = computed(() => {
    const count = Math.max(1, this.numberOfMonths());
    return Array.from({ length: count }, (_, offset) => {
      const month = addMonths(this.viewMonth(), offset);
      return {
        label: `${this.months()[month.getMonth()]} ${month.getFullYear()}`,
        weeks: this.buildWeeks(month),
      };
    });
  });

  protected readonly hostClasses = computed(() =>
    [
      'gog-calendar',
      `gog-calendar--${this.size()}`,
      this.selectionMode() === 'range' ? 'gog-calendar--range' : null,
      this.numberOfMonths() > 1 ? 'gog-calendar--multi' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );

  /**
   * Whether today can actually be picked — `min`, `max` or `disabledDates` may rule it out, and
   * a "Today" button that silently does nothing is worse than one that is visibly unavailable.
   * The signal reads inside `isDayDisabled` are what make this follow those inputs.
   */
  protected readonly isTodaySelectable = computed(
    () => !this.isDayDisabled(startOfDay(new Date())),
  );

  // ── Time section ──────────────────────────────────────────────────────────────
  protected readonly timeSource = computed<Date | null>(() =>
    this.selectionMode() === 'range' ? this.range().start : this.singleDate(),
  );
  protected readonly hours = computed(() => {
    const date = this.timeSource();
    const raw = date ? date.getHours() : 0;
    if (this.hourFormat() === '24') return raw;
    return raw % 12 === 0 ? 12 : raw % 12;
  });
  protected readonly minutes = computed(() => this.timeSource()?.getMinutes() ?? 0);
  protected readonly seconds = computed(() => this.timeSource()?.getSeconds() ?? 0);
  protected readonly isPm = computed(() => (this.timeSource()?.getHours() ?? 0) >= 12);
  protected readonly maxHour = computed(() => (this.hourFormat() === '24' ? 23 : 12));
  protected readonly minHour = computed(() => (this.hourFormat() === '24' ? 0 : 1));

  constructor() {
    // Open on the selection when there is one, otherwise on `defaultMonth`.
    //
    // `viewMonth` is read **untracked**, and that is the whole point: tracking it would make
    // this effect re-run on every page, see that the month no longer matches the anchor, and
    // snap straight back — the next/previous buttons and PageUp/PageDown would all appear to
    // do nothing. It must react to the anchor changing, never to the view changing.
    effect(() => {
      const anchor = this.selectionAnchor() ?? this.defaultMonth();
      if (!anchor) return;

      untracked(() => {
        const day = startOfDay(anchor);
        this.focusedDate.set(day);
        if (!isSameMonth(day, this.viewMonth())) {
          this.viewMonth.set(day);
        }
      });
    });
  }

  /** Steps the view by whole months or years. */
  protected shiftView(months: number): void {
    this.viewMonth.set(addMonths(this.viewMonth(), months));
  }

  protected shiftViewYears(years: number): void {
    this.viewMonth.set(addYears(this.viewMonth(), years));
  }

  protected onDayClick(day: GogCalendarDay): void {
    if (day.disabled) return;
    this.select(day.date);
  }

  protected onDayHover(day: GogCalendarDay): void {
    if (this.selectionMode() !== 'range') return;
    this.hoverDate.set(day.disabled ? null : day.date);
  }

  protected onGridLeave(): void {
    this.hoverDate.set(null);
  }

  /**
   * Selects today. The view needs no separate nudge: the selection is the anchor the calendar
   * opens on, so moving it there moves the month too.
   */
  protected selectToday(): void {
    const today = startOfDay(new Date());
    if (this.isDayDisabled(today)) return;

    this.select(today);
    this.focusedDate.set(today);
  }

  /** Moves the view back to the current month, leaving the selection untouched. */
  protected goToThisMonth(): void {
    const today = startOfDay(new Date());
    this.viewMonth.set(today);
    this.focusedDate.set(today);
    this.pendingFocus = true;
    this.applyPendingFocus();
  }

  /**
   * The ARIA grid pattern's keyboard contract: arrows by day, PageUp/PageDown by month,
   * Shift + those by year, Home/End to the ends of the week. Movement is clamped into
   * `[min, max]` so the caret cannot wander into a region nothing can be picked from.
   */
  protected onGridKeydown(event: KeyboardEvent): void {
    const current = this.focusedDate();
    // Assigned by every branch that does not return, so no initializer is needed.
    let next: Date;

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, -1);
        break;
      case 'ArrowRight':
        next = addDays(current, 1);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'Home':
        next = addDays(current, -weekdayOffset(current, this.resolvedFirstDayOfWeek()));
        break;
      case 'End':
        next = addDays(current, 6 - weekdayOffset(current, this.resolvedFirstDayOfWeek()));
        break;
      case 'PageUp':
        next = event.shiftKey ? addYears(current, -1) : addMonths(current, -1);
        break;
      case 'PageDown':
        next = event.shiftKey ? addYears(current, 1) : addMonths(current, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDayDisabled(current)) this.select(current);
        return;
      default:
        return;
    }

    event.preventDefault();
    const clamped = clampDate(next, this.min(), this.max());
    this.focusedDate.set(clamped);
    if (!isSameMonth(clamped, this.viewMonth())) {
      this.viewMonth.set(startOfDay(clamped));
    }
    this.pendingFocus = true;
    this.applyPendingFocus();
  }

  // ── Time controls ─────────────────────────────────────────────────────────────

  protected onHourInput(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw)) return;

    const hours24 =
      this.hourFormat() === '24' ? raw : ((raw % 12) + (this.isPm() ? 12 : 0) + 24) % 24;
    this.applyTime(hours24, this.minutes(), this.seconds());
  }

  protected onMinuteInput(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw)) return;
    this.applyTime(this.timeSource()?.getHours() ?? 0, raw, this.seconds());
  }

  protected onSecondInput(event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw)) return;
    this.applyTime(this.timeSource()?.getHours() ?? 0, this.minutes(), raw);
  }

  protected toggleMeridiem(): void {
    const hours = this.timeSource()?.getHours() ?? 0;
    this.applyTime((hours + 12) % 24, this.minutes(), this.seconds());
  }

  // ── Internals ─────────────────────────────────────────────────────────────────

  private selectionAnchor(): Date | null {
    return this.selectionMode() === 'range' ? this.range().start : this.singleDate();
  }

  private isDayDisabled(date: Date): boolean {
    if (!isWithinBounds(date, this.min(), this.max())) return true;
    return this.disabledDates()?.(date) ?? false;
  }

  private buildWeeks(month: Date): GogCalendarDay[][] {
    const today = new Date();
    const { start, end } = this.previewRange();
    const selected = this.singleDate();
    const isRange = this.selectionMode() === 'range';

    return buildMonthGrid(month.getFullYear(), month.getMonth(), this.resolvedFirstDayOfWeek()).map(
      (week) =>
        week.map((date) => ({
          date,
          label: String(date.getDate()),
          outside: !isSameMonth(date, month),
          today: isSameDay(date, today),
          disabled: this.isDayDisabled(date),
          selected: isRange
            ? isSameDay(date, start) || isSameDay(date, end)
            : isSameDay(date, selected),
          rangeStart: isRange && isSameDay(date, orderedStart(start, end)),
          rangeEnd: isRange && isSameDay(date, orderedEnd(start, end)),
          inRange: isRange && isInRange(date, start, end),
        })),
    );
  }

  private select(date: Date): void {
    if (this.selectionMode() === 'single') {
      const time = this.singleDate();
      // Picking a different day must not reset a time the user already set.
      const next = time ? copyTimeOnto(date, time) : date;
      this.commit(next);
      return;
    }

    const { start, end } = this.range();
    // A fresh pair whenever there is no open range: either nothing is picked yet, or the
    // previous range is complete and this click starts a new one.
    if (!start || end) {
      this.commit({ start: date, end: null }, false);
      return;
    }

    // Second click before the first: treat it as the new start rather than an invalid range.
    const ordered = isBeforeDay(date, start) ? { start: date, end: start } : { start, end: date };
    this.hoverDate.set(null);
    this.commit(ordered);
  }

  private commit(next: GogDatepickerValue, complete = true): void {
    this.value.set(next);
    if (complete) {
      this.gogDateSelect.emit(next);
    }
  }

  private applyTime(hours: number, minutes: number, seconds: number): void {
    const base = this.timeSource() ?? startOfDay(new Date());
    const updated = withTime(
      base,
      clampNumber(hours, 0, 23),
      clampNumber(minutes, 0, 59),
      clampNumber(seconds, 0, 59),
    );

    if (this.selectionMode() === 'single') {
      this.commit(updated);
      return;
    }

    const { start, end } = this.range();
    this.commit({ start: start ? updated : null, end }, false);
  }

  /**
   * Moves the DOM focus onto the newly focused cell, but only after a key or button press —
   * never in response to the selection changing, which would steal focus from whatever the
   * consumer is doing elsewhere on the page.
   */
  private applyPendingFocus(): void {
    if (!this.pendingFocus) return;
    this.pendingFocus = false;

    queueMicrotask(() => {
      this.elRef.nativeElement
        .querySelector<HTMLElement>('.gog-calendar__day[tabindex="0"]')
        ?.focus();
    });
  }

  protected isFocusedDay(date: Date): boolean {
    return isSameDay(date, this.focusedDate());
  }
}

/** How far into the week `date` sits, given which weekday the week starts on. */
function weekdayOffset(date: Date, firstDayOfWeek: number): number {
  return (date.getDay() - firstDayOfWeek + 7) % 7;
}

function orderedStart(start: Date | null, end: Date | null): Date | null {
  if (!start || !end) return start;
  return isAfterDay(start, end) ? end : start;
}

function orderedEnd(start: Date | null, end: Date | null): Date | null {
  if (!start || !end) return end;
  return isAfterDay(start, end) ? start : end;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}
