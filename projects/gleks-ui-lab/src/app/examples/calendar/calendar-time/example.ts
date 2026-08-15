import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CalendarComponent],
})
export class CalendarTimeExample {
  protected readonly moment = signal<GogDatepickerValue>(null);
}
