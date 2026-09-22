import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const RADIO_GROUP_SCOPE_CONFIG = { control: { size: 'lg' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-radio-group-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(RADIO_GROUP_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupConfigScope {}
