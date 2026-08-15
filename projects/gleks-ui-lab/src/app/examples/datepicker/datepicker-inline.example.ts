import { Component, signal } from '@angular/core';
import { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  template: `<gog-datepicker [inline]="true" [(value)]="inlineDate" />`,
})
export class DatepickerInlineExample {
  protected readonly inlineDate = signal<GogDatepickerValue>(null);
}
