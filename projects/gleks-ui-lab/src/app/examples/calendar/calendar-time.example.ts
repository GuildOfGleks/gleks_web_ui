import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  template: `
    <gog-calendar
      [showTime]="true"
      hourFormat="24"
      [minuteStep]="15"
      [showThisMonthButton]="true"
      [(value)]="moment"
    />
  `,
})
export class CalendarTimeExample {
  protected readonly moment = signal<GogDatepickerValue>(null);
}
