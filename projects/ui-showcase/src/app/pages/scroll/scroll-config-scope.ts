import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const SCROLL_SCOPE_CONFIG = { scroll: { size: 'thin', autoHide: false } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-scroll-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(SCROLL_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollConfigScope {}
