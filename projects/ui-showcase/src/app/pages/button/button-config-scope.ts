import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const BUTTON_SCOPE_CONFIG = {
  control: { size: 'lg' },
  button: { debounce: 1000 },
  ripple: { enabled: true },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-button-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(BUTTON_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonConfigScope {}
