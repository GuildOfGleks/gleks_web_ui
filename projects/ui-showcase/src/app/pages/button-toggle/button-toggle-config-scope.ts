import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const BUTTON_TOGGLE_SCOPE_CONFIG = {
  control: { size: 'lg' },
  ripple: { enabled: true },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-button-toggle-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(BUTTON_TOGGLE_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleConfigScope {}
