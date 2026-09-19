import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const SELECT_SCOPE_CONFIG = {
  control: { size: 'lg', clearable: true },
  dropdown: { filter: true },
  floatLabel: { variant: 'over' },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-select-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(SELECT_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectConfigScope {}
