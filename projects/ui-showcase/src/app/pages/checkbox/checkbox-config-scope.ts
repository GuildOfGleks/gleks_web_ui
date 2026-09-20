import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const CHECKBOX_SCOPE_CONFIG = { control: { size: 'lg' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-checkbox-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(CHECKBOX_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxConfigScope {}
