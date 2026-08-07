import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogClearableState } from '../../shared/clearable-state';
import { GogFloatLabelState } from '../../shared/float-label-state';
import { GogFloatLabelVariant, GogSize } from '../../shared/types';
import { IconComponent } from '../icon/icon.component';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';

@Component({
  selector: 'gog-textarea',
  imports: [IconComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Drives the :host(.gog-host--auto-width) rule in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Inverted from gog-button's
    // full-width class: this field is full width by default, so the class only appears
    // once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class TextareaComponent implements ControlValueAccessor, DoCheck {
  readonly label = input('');
  readonly placeholder = input('');
  readonly errorMessage = input('');
  /**
   * See `GogErrorDisplay`. Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to
   * `'manual'` — matching every other control in the library.
   */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly name = input('');
  readonly inputId = input('');
  readonly disabled = input(false);
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  /** Native `rows` attribute, controlling the field's initial height. */
  readonly rows = input(4);
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the field to fit its content instead.
   */
  readonly fullWidth = input(true);
  /**
   * Whether to offer a clear button once the field has text. Unset, falls back to
   * `GOG_CONFIG.control.clearable`, then to `false`.
   */
  readonly clearable = input<boolean | undefined>(undefined);
  /** Accessible name for the clear button. */
  readonly clearAriaLabel = input('Clear');
  /** Unset, falls back to `GOG_CONFIG.floatLabel.variant`, then to `'none'` (off). */
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.showPlaceholder`, then to `false`. */
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);

  /** Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`. */
  readonly value = model<string>('');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly cvaDisabled = signal(false);
  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  private readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(
      this.errorDisplay(),
      this.globalConfig.control?.errorDisplay,
      DEFAULT_ERROR_DISPLAY,
    ),
  );
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );
  /** Set from `(focus)`/`(blur)` on the `<textarea>` — see `onFocus`/`onBlur`. */
  protected readonly isFocused = signal(false);

  /**
   * The single size modifier, replacing one `[class.gog-input-wrapper--<size>]` binding per size.
   * Empty for `'md'`: that is this component's default size and has no modifier rule of its own — every `gog-input-wrapper--*` chain bottoms out at it.
   */
  protected readonly sizeClass = computed(() =>
    this.resolvedSize() === 'md' ? '' : `gog-input-wrapper--${this.resolvedSize()}`,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  private readonly floatLabelState = new GogFloatLabelState(
    this.floatLabel,
    this.floatLabelShowPlaceholder,
    this.placeholder,
    this.isFocused,
    // "Has content" for a textarea is simply a non-empty value.
    computed(() => this.value() !== ''),
    this.globalConfig,
  );

  private readonly clearableState = new GogClearableState(
    this.clearable,
    computed(() => this.value() !== ''),
    this.isDisabled,
    this.globalConfig,
    () => false,
  );
  /** Whether to render the clear button right now — see `GogClearableState`. */
  protected readonly showClear = this.clearableState.isVisible;

  protected readonly resolvedFloatLabel = this.floatLabelState.variant;
  protected readonly isFloatLabelActive = this.floatLabelState.isActive;
  protected readonly isFloatLabelFloated = this.floatLabelState.isFloated;
  protected readonly effectivePlaceholder = this.floatLabelState.effectivePlaceholder;

  private _onChange: (val: string) => void = () => {};
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

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value.set(textarea.value);
    this._onChange(textarea.value);
  }

  /** Clears the field and notifies any attached form, then returns focus to the input. */
  protected clearValue(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.value.set('');
    this._onChange('');
    this._onTouched();
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this._onTouched();
  }
}
