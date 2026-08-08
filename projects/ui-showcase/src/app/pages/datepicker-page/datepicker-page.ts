import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CalendarComponent,
  DatepickerComponent,
  GogDateRange,
  GogSize,
  formatDate,
} from '@guildofgleks/ui';

const TODAY = new Date();

@Component({
  selector: 'app-datepicker-page',
  imports: [CalendarComponent, DatepickerComponent, ReactiveFormsModule],
  templateUrl: './datepicker-page.html',
  styleUrl: './datepicker-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly today = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  protected readonly monthStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  protected readonly monthEnd = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0);

  /** A year out, so the "Today" button has nothing it is allowed to pick. */
  protected readonly nextYear = new Date(TODAY.getFullYear() + 1, TODAY.getMonth(), 1);

  protected readonly date = signal<Date | null>(null);
  protected readonly footerDate = signal<Date | null>(null);
  protected readonly range = signal<GogDateRange | null>(null);
  protected readonly withTime = signal<Date | null>(null);
  protected readonly inlineDate = signal<Date | null>(null);
  protected readonly formDate = new FormControl<Date | null>(this.today);

  /** Weekends are unpickable — a predicate, which an array of dates could not express. */
  protected readonly noWeekends = (date: Date): boolean =>
    date.getDay() === 0 || date.getDay() === 6;

  protected show(value: Date | null): string {
    return value ? formatDate(value, 'dd.MM.yyyy') : '—';
  }

  protected showRange(value: GogDateRange | null): string {
    if (!value?.start) return '—';
    const start = formatDate(value.start, 'dd.MM.yyyy');
    return value.end ? `${start} — ${formatDate(value.end, 'dd.MM.yyyy')}` : `${start} — …`;
  }

  protected showDateTime(value: Date | null): string {
    return value ? formatDate(value, 'dd.MM.yyyy HH:mm') : '—';
  }
}
