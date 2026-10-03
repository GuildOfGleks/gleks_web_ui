import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadioGroupComponent, GogRadioOption, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent, ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupBindingExample {
  protected readonly plans: readonly GogRadioOption[] = [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'enterprise', label: 'Enterprise', disabled: true },
  ];
  protected readonly plan = signal<string | number | null>('pro');
  protected readonly changes = signal(0);
}
