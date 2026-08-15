import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DatepickerComponent],
})
export class DatepickerOverviewExample {
  protected readonly today = new Date();
  protected readonly birthday = signal<GogDatepickerValue>(null);
}
