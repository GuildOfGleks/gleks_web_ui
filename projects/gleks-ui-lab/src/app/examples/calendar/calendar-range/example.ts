import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CalendarComponent],
})
export class CalendarRangeExample {
  // In range mode the value is a { start, end } pair.
  protected readonly range = signal<GogDatepickerValue>(null);
}
