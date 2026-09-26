import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const PANEL_SCOPE_CONFIG = { labels: { togglePanel: 'Abschnitt umschalten' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-panel-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(PANEL_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelConfigScope {}
