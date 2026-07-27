import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { InputfieldComponent } from '@gleks/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-inputfield-page',
  imports: [InputfieldComponent],
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
  protected readonly showPassword = signal(false);
  protected readonly passwordFieldType = computed(() => (this.showPassword() ? 'text' : 'password'));

  protected readonly disabledValue = signal('Cannot edit this');

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }
}
