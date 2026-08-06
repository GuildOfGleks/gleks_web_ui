import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, GogRadioOption, RadioGroupComponent } from '@guildofgleks/ui';

const PLAN_OPTIONS: GogRadioOption[] = [
  { id: 'free', label: 'Free' },
  { id: 'pro', label: 'Pro' },
  { id: 'enterprise', label: 'Enterprise', disabled: true },
];

const SIZE_OPTIONS: GogRadioOption[] = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
];

@Component({
  selector: 'app-radio-group-page',
  imports: [ButtonComponent, RadioGroupComponent, ReactiveFormsModule],
  templateUrl: './radio-group-page.html',
  styleUrl: './radio-group-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupPage {
  protected readonly planOptions = PLAN_OPTIONS;
  protected readonly sizeOptions = SIZE_OPTIONS;

  protected readonly plan = signal<string | number | null>('free');
  protected readonly orientationDemo = signal<string | number | null>('md');
  protected readonly disabledGroupValue = signal<string | number | null>('pro');

  protected readonly summary = computed(() => `Selected plan: ${this.plan() ?? 'none'}`);

  /** Required radio group driven entirely through `ControlValueAccessor` — no `[(value)]`. */
  protected readonly requiredControl = new FormControl<string | number | null>(null, {
    validators: Validators.required,
  });

  private readonly requiredValue = toSignal(this.requiredControl.valueChanges, {
    initialValue: this.requiredControl.value,
  });
  private readonly requiredStatus = toSignal(this.requiredControl.statusChanges, {
    initialValue: this.requiredControl.status,
  });

  protected readonly requiredSummary = computed(() => {
    const value = this.requiredValue();
    const status = this.requiredStatus();
    const state = status === 'DISABLED' ? 'disabled' : status === 'INVALID' ? 'invalid' : 'valid';
    return `Form control: ${value ?? 'none'} · ${state}`;
  });

  protected toggleFormDisabled(): void {
    if (this.requiredControl.disabled) {
      this.requiredControl.enable();
    } else {
      this.requiredControl.disable();
    }
  }
}
