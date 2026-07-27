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

import { GogSize } from '../../shared/types';
import { IconComponent, type GogIconName } from '../icon/icon.component';

@Component({
  selector: 'gog-inputfield',
  imports: [IconComponent],
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
  /** Default icon name for the leading icon. */
  readonly iconStart = input<GogIconName | ''>('');
  /** Default icon name for the trailing icon. */
  readonly iconEnd = input<GogIconName | ''>('');
  /** Custom leading icon template. */
  readonly iconStartTemplate = input<TemplateRef<unknown> | null>(null);
  /** Custom trailing icon template. */
  readonly iconEndTemplate = input<TemplateRef<unknown> | null>(null);
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

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly effectiveAutocomplete = computed(
   () => this.autocomplete() || (this.type() === 'password' ? 'current-password' : 'off'),
  );
  /**
   * Consumer-controlled: shown for as long as `errorMessage` is non-empty. The
   * consumer decides when to clear it (e.g. `errorMessage="control.invalid && control.touched ? 'msg' : ''"`)
   * rather than the field silently hiding it once something is typed.
   */
  protected readonly hasError = computed(() => !!this.errorMessage());
  protected readonly hasIconStart = computed(() => !!this.iconStartTemplate() || !!this.iconStart());
  protected readonly hasIconEnd = computed(() => !!this.iconEndTemplate() || !!this.iconEnd());
  protected readonly hasIconStartAction = computed(() => !!this.iconStartFn());
  protected readonly hasIconEndAction = computed(() => !!this.iconEndFn());

  private _onChange: (val: string) => void = () => {};
  private _onTouched: () => void = () => {};

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
  }
}
