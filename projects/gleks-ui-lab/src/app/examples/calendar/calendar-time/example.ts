import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarTimeExample {
  protected readonly meeting = signal<GogDatepickerValue>(null);
  protected readonly alarm = signal<GogDatepickerValue>(null);

  /** In single mode the value is a Date, carrying the picked time. */
  protected show(value: GogDatepickerValue): string {
    return value instanceof Date ? value.toLocaleString('en-GB') : 'null';
  }
}
