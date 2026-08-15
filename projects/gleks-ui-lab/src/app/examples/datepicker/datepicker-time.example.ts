import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  template: `
    <gog-datepicker
      label="Meeting"
      format="dd.MM.yyyy HH:mm"
      [showTime]="true"
      [minuteStep]="15"
      [(value)]="meeting"
    />
  `,
})
export class DatepickerTimeExample {
  protected readonly meeting = signal<GogDatepickerValue>(null);
}
