import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  template: `<gog-datepicker label="ISO" format="yyyy-MM-dd" [(value)]="isoDate" />`,
})
export class DatepickerFormatExample {
  protected readonly isoDate = signal<GogDatepickerValue>(null);
}
