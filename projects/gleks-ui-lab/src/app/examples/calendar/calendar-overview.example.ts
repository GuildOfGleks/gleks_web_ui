import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  template: `<gog-calendar [(value)]="day" />`,
})
export class CalendarOverviewExample {
  protected readonly day = signal<GogDatepickerValue>(new Date());
}
