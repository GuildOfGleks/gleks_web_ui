import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEventsExample {
  protected readonly day = signal<GogDatepickerValue>(null);
  protected readonly range = signal<GogDatepickerValue>(null);
  protected readonly changes = signal(0);
  protected readonly selects = signal(0);

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
