import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputfieldComponent } from '@guildofgleks/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-inputfield-page',
  imports: [InputfieldComponent, ReactiveFormsModule],
  templateUrl: './inputfield-page.html',
  styleUrl: './inputfield-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldPage {
  protected readonly name = signal('Ada Lovelace');
  protected readonly email = signal('');
  protected readonly emailError = computed(() => {
    const value = this.email();
    if (!value) return '';
    return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address.';
  });

  protected readonly password = signal('');
  protected readonly search = signal('gleks');

  protected readonly disabledValue = signal('Cannot edit this');

  /** Drives the `errorDisplay="auto"` demo — timing comes entirely from the control. */
  protected readonly usernameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  private readonly usernameValue = toSignal(this.usernameControl.valueChanges, {
    initialValue: this.usernameControl.value,
  });

  protected readonly usernameErrorMessage = computed(() => {
    // Re-read on every value change, not statusChanges — status stays 'INVALID' across the
    // required -> minlength transition (e.g. "" -> "ab"), so statusChanges never re-emits
    // there and the message would go stale if it were the only trigger.
    this.usernameValue();
    if (this.usernameControl.hasError('required')) return 'Username is required.';
    if (this.usernameControl.hasError('minlength'))
      return 'Username must be at least 3 characters.';
    return '';
  });

  protected clearSearch(): void {
    this.search.set('');
  }
}
