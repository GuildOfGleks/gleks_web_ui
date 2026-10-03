import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

/** Monday of the week `date` falls in. */
function startOfWeek(date: Date): Date {
  const day = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
}

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarBoundsExample {
  protected readonly weekStart = startOfWeek(new Date());
  protected readonly weekEnd = new Date(
    this.weekStart.getFullYear(),
    this.weekStart.getMonth(),
    this.weekStart.getDate() + 6,
  );
  protected readonly workday = signal<GogDatepickerValue>(null);

  protected readonly weekends = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

  /** A Date in single mode, a { start, end } pair in range mode. */
  protected show(value: GogDatepickerValue): string {
    if (value instanceof Date) return value.toLocaleDateString('en-GB');
    if (value) {
      const start = value.start?.toLocaleDateString('en-GB') ?? '…';
      const end = value.end?.toLocaleDateString('en-GB') ?? '…';
      return `${start} – ${end}`;
    }
    return 'null';
  }
}
