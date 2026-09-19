import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const MULTISELECT_SCOPE_CONFIG = {
  control: { size: 'lg' },
  dropdown: { filter: true, filterPosition: 'bottom' },
  labels: { selectAll: 'All of them', clearAll: 'None' },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-multiselect-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(MULTISELECT_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectConfigScope {}
