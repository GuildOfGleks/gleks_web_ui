import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CheckboxComponent,
  GogDropdownOption,
  GogFloatLabelVariant,
  GogInputAddonEndDirective,
  IconComponent,
  InputfieldComponent,
  SelectComponent,
} from '@guildofgleks/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-inputfield-page',
  imports: [
    CheckboxComponent,
    GogInputAddonEndDirective,
    IconComponent,
    InputfieldComponent,
    ReactiveFormsModule,
    SelectComponent,
  ],
  templateUrl: './inputfield-page.html',
  styleUrl: './inputfield-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldPage {
  protected readonly floatLabelOptions: GogDropdownOption[] = [
    { id: 'none', name: 'None' },
    { id: 'in', name: 'In' },
    { id: 'on', name: 'On' },
    { id: 'over', name: 'Over' },
  ];
  protected readonly floatLabelVariant = signal<GogFloatLabelVariant>('in');
  protected readonly clearableText = signal('');
  protected readonly clearableWithIcon = signal('Some text');
  protected readonly floatLabelShowPlaceholder = signal(false);
  protected readonly floatLabelValue = signal('');
  protected readonly floatLabelIconValue = signal('');
  protected readonly floatLabelIconEndValue = signal('');
  protected readonly floatLabelBothIconsValue = signal('');
  protected readonly floatLabelPasswordOnValue = signal('');
  protected readonly floatLabelPasswordOffValue = signal('');

  protected setFloatLabelVariant(value: string | number | null): void {
    if (value === null) return;
    this.floatLabelVariant.set(value as GogFloatLabelVariant);
  }

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
