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

import { GOG_CONFIG } from '../../shared/config';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogFloatLabelVariant, GogSize } from '../../shared/types';

const DEFAULT_FLOAT_LABEL_VARIANT: GogFloatLabelVariant = 'none';

@Component({
  selector: 'gog-textarea',
  imports: [],
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
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  readonly errorDisplay = input<GogErrorDisplay>('manual');
  readonly name = input('');
  readonly inputId = input('');
  readonly disabled = input(false);
  readonly size = input<GogSize>('md');
  /** Native `rows` attribute, controlling the field's initial height. */
  readonly rows = input(4);
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the field to fit its content instead.
   */
  readonly fullWidth = input(true);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.variant`, then to `'none'` (off). */
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.showPlaceholder`, then to `false`. */
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);

  /** Two-way bindable value: `[(value)]="signal"` or `[value]` / `(valueChange)`. */
  readonly value = model<string>('');

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.errorDisplay,
    this.ngControl,
  );
  /** Set from `(focus)`/`(blur)` on the `<textarea>` — see `onFocus`/`onBlur`. */
  protected readonly isFocused = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
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

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this._onTouched();
  }
}
