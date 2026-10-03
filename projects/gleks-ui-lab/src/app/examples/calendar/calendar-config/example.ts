import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';
import { CalendarComponent } from '@guildofgleks/ui/datepicker';

@Component({
  selector: 'app-example',
  imports: [CalendarComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own calendars.
  providers: [
    provideGogConfig({
      datepicker: { locale: 'fr-FR', firstDayOfWeek: 1 },
      labels: { today: "Aujourd'hui" },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarConfigExample {}
