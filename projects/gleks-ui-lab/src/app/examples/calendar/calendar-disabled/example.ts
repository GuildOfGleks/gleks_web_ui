import { Component, signal } from '@angular/core';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CalendarComponent],
})
export class CalendarDisabledExample {
  protected readonly workday = signal<GogDatepickerValue>(null);

  // A predicate, not an array — "weekends" has no finite list.
  protected readonly weekends = (date: Date): boolean => {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };
}
