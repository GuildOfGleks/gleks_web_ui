import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RadioGroupComponent, GogRadioOption } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupLayoutExample {
  protected readonly plans: readonly GogRadioOption[] = [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'enterprise', label: 'Enterprise', disabled: true },
  ];
}
