import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

import { GogSize } from '../../shared/types';

@Component({
  selector: 'gog-inputfield',
  imports: [],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputfieldComponent),
      multi: true,
    },
  ],
})
export class InputfieldComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'password' | 'email'>('text');
  /** Defaults to 'current-password' for password fields, 'off' otherwise */
  readonly autocomplete = input('');
  readonly errorMessage = input('');
  readonly name = input('');
  readonly inputId = input('');
  readonly disabled = input(false);
  readonly size = input<GogSize>('md');
  /** FontAwesome classes for the leading icon, e.g. `"fa-solid fa-envelope"` */
  readonly iconStart = input('');
  /** FontAwesome classes for the trailing icon, e.g. `"fa-solid fa-eye"` */
  readonly iconEnd = input('');
  /** When provided, the start icon becomes a clickable button invoking this fn */
  readonly iconStartFn = input<(() => void) | null>(null);
  /** When provided, the end icon becomes a clickable button invoking this fn */
  readonly iconEndFn = input<(() => void) | null>(null);
  /** aria-label for the start icon button (required when iconStartFn is set) */
  readonly iconStartLabel = input('');
  /** aria-label for the end icon button (required when iconEndFn is set) */
  readonly iconEndLabel = input('');

  /** Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`. */
  readonly value = model<string>('');

  private readonly cvaDisabled = signal(false);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly _touched = signal(false);
  private readonly formStatus: Signal<string> = this.ngControl?.statusChanges
    ? toSignal(this.ngControl.statusChanges, { initialValue: this.ngControl.status ?? 'VALID' })
    : signal('VALID');

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly effectiveAutocomplete = computed(
    () => this.autocomplete() || (this.type() === 'password' ? 'current-password' : 'off'),
  );
  protected readonly hasError = computed(() => {
    if (this.ngControl) {
      return this._touched() && this.formStatus() === 'INVALID';
    }
    return !!this.errorMessage() && !this.value();
  });
  protected readonly hasIconStart = computed(() => !!this.iconStart());
  protected readonly hasIconEnd = computed(() => !!this.iconEnd());
  protected readonly hasIconStartAction = computed(() => !!this.iconStartFn());
  protected readonly hasIconEndAction = computed(() => !!this.iconEndFn());

  private _onChange: (val: string) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onIconStartClick(): void {
    this.iconStartFn()?.();
  }

  protected onIconEndClick(): void {
    this.iconEndFn()?.();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this._onChange(input.value);
  }

  onBlur(): void {
    this._onTouched();
    this._touched.set(true);
  }
}
