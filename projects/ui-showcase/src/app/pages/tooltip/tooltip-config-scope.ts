import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const TOOLTIP_SCOPE_CONFIG = { tooltip: { position: 'right', showDelay: 0 } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-tooltip-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(TOOLTIP_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipConfigScope {}
