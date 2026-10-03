import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RadioGroupComponent, GogRadioOption, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own groups.
  providers: [provideGogConfig({ control: { size: 'lg' } })],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupConfigExample {
  protected readonly plans: readonly GogRadioOption[] = [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'enterprise', label: 'Enterprise', disabled: true },
  ];
}
