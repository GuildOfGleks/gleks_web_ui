import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const CHIP_SCOPE_CONFIG = { ripple: { enabled: true } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-chip-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(CHIP_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipConfigScope {}
