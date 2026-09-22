import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const ALERT_SCOPE_CONFIG = { labels: { closeAlert: 'Nachricht schließen' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-alert-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(ALERT_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertConfigScope {}
