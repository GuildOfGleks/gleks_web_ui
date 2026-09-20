import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const AUTOCOMPLETE_SCOPE_CONFIG = {
  control: { size: 'lg' },
  autocomplete: { minLength: 2, openOnFocus: false, searchDebounce: 1000 },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-autocomplete-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(AUTOCOMPLETE_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteConfigScope {}
