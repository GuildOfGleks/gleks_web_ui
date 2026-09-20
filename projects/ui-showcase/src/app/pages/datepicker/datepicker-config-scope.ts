import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const DATEPICKER_SCOPE_CONFIG = {
  control: { size: 'lg' },
  datepicker: { locale: 'de-DE', firstDayOfWeek: 0, format: 'yyyy-MM-dd' },
  labels: { today: 'Heute', openCalendar: 'Kalender öffnen' },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-datepicker-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(DATEPICKER_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerConfigScope {}
