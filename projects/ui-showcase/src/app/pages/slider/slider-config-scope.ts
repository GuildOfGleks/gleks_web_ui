import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const SLIDER_SCOPE_CONFIG = { control: { errorDisplay: 'auto' } } as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-slider-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(SLIDER_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderConfigScope {}
