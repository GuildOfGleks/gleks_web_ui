import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  template: `
    <gog-datepicker label="Stay" selectionMode="range" [numberOfMonths]="2" [(value)]="stay" />
  `,
})
export class DatepickerRangeExample {
  protected readonly stay = signal<GogDatepickerValue>(null);
}
