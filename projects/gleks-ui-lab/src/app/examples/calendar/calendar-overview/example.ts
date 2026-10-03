import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarOverviewExample {
  protected readonly day = signal<GogDatepickerValue>(new Date());

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
