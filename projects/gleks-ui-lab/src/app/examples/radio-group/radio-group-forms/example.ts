import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadioGroupComponent, GogRadioOption, ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RadioGroupComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupFormsExample {
  protected readonly plans: readonly GogRadioOption[] = [
    { id: 'free', label: 'Free' },
    { id: 'pro', label: 'Pro' },
    { id: 'enterprise', label: 'Enterprise', disabled: true },
  ];
  protected readonly control = new FormControl<string | number | null>(null, Validators.required);

  protected toggleDisabled(): void {
    if (this.control.disabled) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }
}
