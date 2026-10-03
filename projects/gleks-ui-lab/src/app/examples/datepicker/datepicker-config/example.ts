import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';
import { DatepickerComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [DatepickerComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own fields. The week
  // starts on Sunday although de-DE would choose Monday: firstDayOfWeek overrides the locale.
  providers: [
    provideGogConfig({
      control: { size: 'lg' },
      datepicker: { locale: 'de-DE', firstDayOfWeek: 0, format: 'yyyy-MM-dd' },
      labels: { today: 'Heute', openCalendar: 'Kalender öffnen' },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerConfigExample {
  protected readonly today = new Date();
}
