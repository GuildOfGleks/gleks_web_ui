import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CalendarComponent],
})
export class CalendarOverviewExample {
  protected readonly day = signal<GogDatepickerValue>(new Date());
}
