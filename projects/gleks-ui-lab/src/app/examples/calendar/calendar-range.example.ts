import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  template: ` <gog-calendar selectionMode="range" [numberOfMonths]="2" [(value)]="range" /> `,
})
export class CalendarRangeExample {
  // In range mode the value is a { start, end } pair.
  protected readonly range = signal<GogDatepickerValue>(null);
}
