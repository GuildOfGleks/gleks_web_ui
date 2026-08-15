import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  template: `<gog-datepicker label="Date of birth" [max]="today" [(value)]="birthday" />`,
})
export class DatepickerOverviewExample {
  protected readonly today = new Date();
  protected readonly birthday = signal<GogDatepickerValue>(null);
}
