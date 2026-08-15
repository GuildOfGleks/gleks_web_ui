import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [DatepickerComponent],
})
export class DatepickerInlineExample {
  protected readonly inlineDate = signal<GogDatepickerValue>(null);
}
