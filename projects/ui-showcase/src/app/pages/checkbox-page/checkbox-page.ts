import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, CheckboxComponent, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-checkbox-page',
  imports: [ButtonComponent, CheckboxComponent, IconComponent, ReactiveFormsModule],
  templateUrl: './checkbox-page.html',
  styleUrl: './checkbox-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPage {
  protected readonly acceptTerms = signal(true);
  protected readonly subscribeNewsletter = signal(false);
  protected readonly triState = signal(false);
  protected readonly disabledChecked = signal(true);
  protected readonly starred = signal(true);

  protected readonly summary = computed(() =>
    `Terms: ${this.acceptTerms() ? 'accepted' : 'declined'} · Newsletter: ${
      this.subscribeNewsletter() ? 'subscribed' : 'not subscribed'
    }`,
  );

  /** Required checkbox driven entirely through `ControlValueAccessor` — no `[(checked)]`. */
  protected readonly requiredControl = new FormControl<boolean>(false, {
    nonNullable: true,
    validators: Validators.requiredTrue,
  });

  private readonly requiredValue = toSignal(this.requiredControl.valueChanges, {
    initialValue: this.requiredControl.value,
  });
  private readonly requiredStatus = toSignal(this.requiredControl.statusChanges, {
    initialValue: this.requiredControl.status,
  });

  protected readonly requiredSummary = computed(() => {
    const checked = this.requiredValue();
    const status = this.requiredStatus();
    const state = status === 'DISABLED' ? 'disabled' : status === 'INVALID' ? 'invalid (must be checked)' : 'valid';
    return `Form control: ${checked ? 'checked' : 'not checked'} · ${state}`;
  });

  protected toggleFormDisabled(): void {
    if (this.requiredControl.disabled) {
      this.requiredControl.enable();
    } else {
      this.requiredControl.disable();
    }
  }
}
