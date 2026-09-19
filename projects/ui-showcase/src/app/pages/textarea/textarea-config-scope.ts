import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const TEXTAREA_SCOPE_CONFIG = {
  control: { size: 'lg', clearable: true },
  floatLabel: { variant: 'over' },
  textarea: { resize: 'none' },
} as const;

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-textarea-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(TEXTAREA_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaConfigScope {}
