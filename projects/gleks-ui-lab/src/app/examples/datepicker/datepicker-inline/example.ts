import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerInlineExample {
  protected readonly date = signal<GogDatepickerValue>(null);

  /** A Date in single mode, a { start, end } pair in range mode. */
  protected show(value: GogDatepickerValue): string {
    if (value instanceof Date) return value.toLocaleString('en-GB');
    if (value) {
      const start = value.start?.toLocaleDateString('en-GB') ?? '…';
      const end = value.end?.toLocaleDateString('en-GB') ?? '…';
      return `${start} – ${end}`;
    }
    return 'null';
  }
}
