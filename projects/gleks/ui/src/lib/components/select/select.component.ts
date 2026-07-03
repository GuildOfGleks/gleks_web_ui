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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface GogSelectOption {
  id: string | number;
  name: string;
  disabled?: boolean;
}

@Component({
  selector: 'gog-select',
  imports: [IconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  private static nextId = 0;

  protected readonly inputId = `gog-select-${++SelectComponent.nextId}`;

  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Select...');
  readonly options = input<GogSelectOption[]>([]);
  readonly errorMessage = input('');
  readonly dropdownZIndex = input<number | null>(null);
  readonly appendToBody = input(false);
  readonly disabled = input(false);
  readonly chevronTemplate = input<TemplateRef<unknown> | null>(null);

  /** Two-way bindable selected value: `[(value)]="signal"`. */
  readonly value = model<string | number | null>(null);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly selectedValue = computed(() => (this.value() === null ? '' : String(this.value())));
  protected readonly hasError = computed(() => !!this.errorMessage() && this.value() === null);
  protected readonly errorId = computed(() => (this.hasError() ? `${this.inputId}-error` : null));

  private onChange: (val: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | number | null): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: (val: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const rawValue = target.value;
    const next = this.options().find((option) => String(option.id) === rawValue)?.id ?? null;

    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }
}
