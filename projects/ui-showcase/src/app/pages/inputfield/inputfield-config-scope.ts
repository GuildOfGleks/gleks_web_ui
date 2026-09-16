import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const INPUTFIELD_SCOPE_CONFIG = {
  control: { size: 'lg', clearable: true },
  floatLabel: { variant: 'over' },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-inputfield-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(INPUTFIELD_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldConfigScope {}
