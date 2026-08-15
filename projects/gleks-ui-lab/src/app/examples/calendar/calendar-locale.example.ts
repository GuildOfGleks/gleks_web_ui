import { Component } from '@angular/core';
import { CalendarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  template: ` <gog-calendar locale="de-DE" [firstDayOfWeek]="1" /> `,
})
export class CalendarLocaleExample {}
