import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  TemplateRef,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'gog-checkbox',
  imports: [IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent {
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly disabled = input(false);
  readonly checkIconTemplate = input<TemplateRef<unknown> | null>(null);

  /** Two-way bindable checked state: `[(checked)]="signal"`. */
  readonly checked = model<boolean>(false);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onCheckedChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: boolean): void {
    this.checked.set(val ?? false);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onCheckedChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onInputChange(event: Event): void {
    if (this.isDisabled()) return;
    const input = event.target as HTMLInputElement;
    const next = input.checked;
    this.checked.set(next);
    this.onCheckedChange(next);
    this.onTouched();
  }

  onBlur(): void {
    if (this.isDisabled()) return;
    this.onTouched();
  }
}
