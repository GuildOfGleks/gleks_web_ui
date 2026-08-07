import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  input,
  model,
  TemplateRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GOG_CONFIG } from '../../shared/config';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogFloatLabelVariant, GogSize } from '../../shared/types';
import { IconComponent, type GogIconName } from '../icon/icon.component';

const DEFAULT_FLOAT_LABEL_VARIANT: GogFloatLabelVariant = 'none';

@Component({
  selector: 'gog-inputfield',
  imports: [IconComponent],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Drives the :host(.gog-host--auto-width) rule in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Inverted from gog-button's
    // full-width class: this field is full width by default, so the class only appears
    // once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class InputfieldComponent implements ControlValueAccessor, DoCheck {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input<'text' | 'password' | 'email' | 'number' | 'date'>('text');
  /** Defaults to 'current-password' for password fields, 'off' otherwise */
  readonly autocomplete = input('');
  /** Only applied when `type="number"`. */
  readonly min = input<number | null>(null);
  /** Only applied when `type="number"`. */
  readonly max = input<number | null>(null);
  /** Only applied when `type="number"`. */
  readonly step = input<number | null>(null);
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  readonly errorDisplay = input<GogErrorDisplay>('manual');
  readonly name = input('');
  readonly inputId = input('');
  readonly disabled = input(false);
  readonly size = input<GogSize>('md');
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the field to fit its content instead.
   */
  readonly fullWidth = input(true);
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
  /** aria-label for the reveal-password button, shown when `type` is `'password'` */
  readonly showPasswordLabel = input('Show password');
  /** aria-label for the hide-password button, shown once the password is revealed */
  readonly hidePasswordLabel = input('Hide password');
  /** Unset, falls back to `GOG_CONFIG.floatLabel.variant`, then to `'none'` (off). */
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.showPlaceholder`, then to `false`. */
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);

  /**
   * Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`.
   * Always a string, including for `type="number"` — that field's `formControl`/
   * `formControlName` value is a `number` (or `null` when empty); the string here is only
   * the raw text shown in the native input.
   */
  readonly value = model<string>('');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.errorDisplay,
    this.ngControl,
  );
  private readonly passwordVisible = signal(false);
  /** Set from `(focus)`/`(blur)` on the `<input>` — see `onFocus`/`onBlur`. */
  protected readonly isFocused = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly isPasswordField = computed(() => this.type() === 'password');
  protected readonly isNumberField = computed(() => this.type() === 'number');
  protected readonly effectiveType = computed(() =>
    this.isPasswordField() && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly effectiveAutocomplete = computed(
    () => this.autocomplete() || (this.type() === 'password' ? 'current-password' : 'off'),
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  protected readonly resolvedFloatLabel = computed(
    () => this.floatLabel() ?? this.globalConfig.floatLabel?.variant ?? DEFAULT_FLOAT_LABEL_VARIANT,
  );
  protected readonly resolvedFloatLabelShowPlaceholder = computed(
    () =>
      this.floatLabelShowPlaceholder() ?? this.globalConfig.floatLabel?.showPlaceholder ?? false,
  );
  protected readonly isFloatLabelActive = computed(() => this.resolvedFloatLabel() !== 'none');
  protected readonly hasFloatValue = computed(() => this.value() !== '');
  protected readonly isFloatLabelFloated = computed(() => this.isFocused() || this.hasFloatValue());
  /**
   * The field's own `placeholder`. While a float label is active the resting label already
   * sits where this would, so it's suppressed unless the consumer opted into
   * `floatLabelShowPlaceholder` — and even then, only once the label has floated out of
   * the way.
   */
  protected readonly effectivePlaceholder = computed(() => {
    if (!this.isFloatLabelActive()) return this.placeholder();
    if (!this.resolvedFloatLabelShowPlaceholder()) return '';
    return this.isFloatLabelFloated() ? this.placeholder() : '';
  });

  protected readonly hasIconStart = computed(
    () => !!this.iconStartTemplate() || !!this.iconStart(),
  );
  protected readonly hasIconStartAction = computed(() => !!this.iconStartFn());

  /** For password fields the trailing icon is always the built-in show/hide toggle. */
  protected readonly effectiveIconEnd = computed<GogIconName | ''>(() =>
    this.isPasswordField() ? (this.passwordVisible() ? 'eye-off' : 'eye') : this.iconEnd(),
  );
  protected readonly effectiveIconEndLabel = computed(() =>
    this.isPasswordField()
      ? this.passwordVisible()
        ? this.hidePasswordLabel()
        : this.showPasswordLabel()
      : this.iconEndLabel(),
  );
  protected readonly hasIconEnd = computed(
    () => !!this.iconEndTemplate() || !!this.effectiveIconEnd(),
  );
  protected readonly hasIconEndAction = computed(
    () => this.isPasswordField() || !!this.iconEndFn(),
  );

  /** `number` for a `type="number"` field (`null` when empty), `string` otherwise. */
  private _onChange: (val: string | number | null) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR keeps `this.ngControl`
    // available for `hasError` — providing NG_VALUE_ACCESSOR on the component while also
    // injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(val: string | number | null): void {
    this.value.set(val === null || val === undefined ? '' : String(val));
  }

  registerOnChange(fn: (val: string | number | null) => void): void {
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
    if (this.isPasswordField()) {
      this.passwordVisible.update((visible) => !visible);
      return;
    }
    this.iconEndFn()?.();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);

    if (this.isNumberField()) {
      this._onChange(input.value === '' ? null : input.valueAsNumber);
      return;
    }

    this._onChange(input.value);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this._onTouched();
  }
}
