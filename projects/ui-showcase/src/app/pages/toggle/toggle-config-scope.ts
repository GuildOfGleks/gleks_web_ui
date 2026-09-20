import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const TOGGLE_SCOPE_CONFIG = { control: { size: 'lg' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-toggle-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(TOGGLE_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleConfigScope {}
