import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  contentChild,
  computed,
  DoCheck,
  inject,
  input,
  model,
  TemplateRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { nextGogControlId } from '../../shared/control-id';
import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';
import { GogClearableState } from '../../shared/clearable-state';
import { GogFloatLabelState } from '../../shared/float-label-state';
import { GogFloatLabelVariant, GogInputMode, GogInputType, GogSize } from '../../shared/types';
import { IconComponent, type GogIconName } from '../icon/icon.component';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
const DEFAULT_SHOW_SPIN_BUTTONS = true;
const DEFAULT_LABELS = {
  clear: 'Clear',
  increment: 'Increment',
  decrement: 'Decrement',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
} as const;
/** Native `stepUp()`/`stepDown()` default when `step` is left unset. */
const DEFAULT_STEP = 1;

/** Rounds to `step`'s own decimal precision, so e.g. repeated `0.1` steps don't drift to
 * `0.30000000000000004`. */
function roundToStep(value: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return decimals === 0 ? Math.round(value) : Number(value.toFixed(decimals));
}

/**
 * Arbitrary markup in the field's leading slot — an icon, a button, a prefix label:
 *
 * ```html
 * <gog-inputfield label="Amount">
 *   <span gogInputAddonStart>€</span>
 * </gog-inputfield>
 *
 * <gog-inputfield label="Search">
 *   <button gogInputAddonStart type="button" aria-label="Search" (click)="run()">
 *     <gog-icon name="check" />
 *   </button>
 * </gog-inputfield>
 * ```
 *
 * Unlike the deprecated `iconStartTemplate` / `iconStartFn` / `iconStartLabel` trio this
 * replaces, the projected element is a normal DOM element: it carries its own `aria-label`,
 * its own click handler, and its own disabled state, so the component needs no input per
 * capability. `iconStart` — a bare icon name — stays, since that really is the common case.
 */
@Directive({ selector: '[gogInputAddonStart]' })
export class GogInputAddonStartDirective {}

/**
 * Arbitrary markup in the field's trailing slot — see `GogInputAddonStartDirective`.
 *
 * On `type="password"` the built-in show/hide toggle owns this slot and a projected end addon
 * is ignored, so the reveal control can never be accidentally replaced by a decorative one.
 */
@Directive({ selector: '[gogInputAddonEnd]' })
export class GogInputAddonEndDirective {}

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
  /** See `GogInputType` for why this is a subset of the native `type` list. */
  readonly type = input<GogInputType>('text');
  /** Defaults to 'current-password' for password fields, 'off' otherwise */
  readonly autocomplete = input('');
  /**
   * Native `readonly`: the value is still selectable, focusable and submitted with the form, but
   * cannot be edited. Distinct from `disabled`, which also takes the field out of the tab order,
   * greys it out and drops it from form submission.
   *
   * Suppresses the clear button and the number field's spin buttons for as long as it is on —
   * both promise an edit the field would refuse.
   */
  readonly readonly = input(false);
  /** Native `maxlength`. Unset (`null`), no limit is applied. */
  readonly maxlength = input<number | null>(null);
  /** Native `minlength`. Unset (`null`), no minimum is applied. */
  readonly minlength = input<number | null>(null);
  /** Native `pattern`, as a regular-expression source string. Unset (`''`), nothing is applied. */
  readonly pattern = input('');
  /**
   * Native `inputmode` — see `GogInputMode`. Unset, the browser infers a keyboard from `type`.
   */
  readonly inputMode = input<GogInputMode | null>(null);
  /**
   * Native `spellcheck`. Unset (`null`), the browser's own default applies; set `false` on
   * fields holding names, codes or identifiers, where the red underline is noise.
   */
  readonly spellcheck = input<boolean | null>(null);
  /** Only applied when `type="number"`. */
  readonly min = input<number | null>(null);
  /** Only applied when `type="number"`. */
  readonly max = input<number | null>(null);
  /** Only applied when `type="number"`. */
  readonly step = input<number | null>(null);
  /**
   * Whether a `type="number"` field shows the library's own increment/decrement buttons in
   * place of the browser's native (and inconsistently-styled across platforms) spin glyphs.
   * The native glyphs are always hidden on a number field regardless of this — off just means
   * no stepper UI at all, not a fallback to the native one. Arrow-key stepping on the focused
   * field keeps working either way; that's native `<input type="number">` behaviour, unrelated
   * to which glyphs are visible. Unset, falls back to `GOG_CONFIG.inputfield.showSpinButtons`,
   * then to `true`.
   */
  readonly showSpinButtons = input<boolean | undefined>(undefined);
  /** aria-label for the number field's increment button. Unset, falls back to `GOG_CONFIG.labels.increment`. */
  readonly incrementLabel = input<string | undefined>(undefined);
  /** aria-label for the number field's decrement button. Unset, falls back to `GOG_CONFIG.labels.decrement`. */
  readonly decrementLabel = input<string | undefined>(undefined);
  readonly errorMessage = input('');
  /**
   * See `GogErrorDisplay`. Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to
   * `'manual'` — matching every other control in the library.
   */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly name = input('');
  /**
   * The `<input>`'s `id`. Left unset, the field generates one — the label's `for` and the error
   * message's `aria-describedby` both need a real id, and a field that is silently unlabelled
   * without one is the wrong default. Set this only when something outside the component has to
   * reference the input by a known id.
   */
  readonly inputId = input('');
  readonly disabled = input(false);
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the field to fit its content instead.
   */
  readonly fullWidth = input(true);
  /** Default icon name for the leading icon. */
  readonly iconStart = input<GogIconName | ''>('');
  /** Default icon name for the trailing icon. */
  readonly iconEnd = input<GogIconName | ''>('');
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<span gogInputAddonStart>` element instead. Removed in 21.5.0.
   */
  readonly iconStartTemplate = input<TemplateRef<unknown> | null>(null);
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<span gogInputAddonEnd>` element instead. Removed in 21.5.0.
   */
  readonly iconEndTemplate = input<TemplateRef<unknown> | null>(null);
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<button gogInputAddonStart>` element instead. Removed in 21.5.0. A projected button carries its own
   * `(click)` handler, so no input is needed for it.
   */
  readonly iconStartFn = input<(() => void) | null>(null);
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<button gogInputAddonEnd>` element instead. Removed in 21.5.0. A projected button carries its own
   * `(click)` handler, so no input is needed for it.
   */
  readonly iconEndFn = input<(() => void) | null>(null);
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<button gogInputAddonStart>` element instead. Removed in 21.5.0. Put `aria-label` on that button.
   */
  readonly iconStartLabel = input('');
  /**
   * @deprecated since 21.3.0 (2026-08-07) — project a `<button gogInputAddonEnd>` element instead. Removed in 21.5.0. Put `aria-label` on that button.
   */
  readonly iconEndLabel = input('');
  /** aria-label for the reveal-password button, shown when `type` is `'password'`. Unset, falls back to `GOG_CONFIG.labels.showPassword`. */
  readonly showPasswordLabel = input<string | undefined>(undefined);
  /** aria-label for the hide-password button, shown once the password is revealed. Unset, falls back to `GOG_CONFIG.labels.hidePassword`. */
  readonly hidePasswordLabel = input<string | undefined>(undefined);
  /**
   * Whether to offer a clear button once the field has text. Unset, falls back to
   * `GOG_CONFIG.control.clearable`, then to `false`.
   */
  readonly clearable = input<boolean | undefined>(undefined);
  /** Accessible name for the clear button. Unset, falls back to `GOG_CONFIG.labels.clear`. */
  readonly clearAriaLabel = input<string | undefined>(undefined);
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
  private readonly passwordVisible = signal(false);
  /** Set from `(focus)`/`(blur)` on the `<input>` — see `onFocus`/`onBlur`. */
  protected readonly isFocused = signal(false);

  /**
   * The single size modifier, replacing one `[class.gog-input-wrapper--<size>]` binding per size.
   * Empty for `'md'`: that is this component's default size and has no modifier rule of its own — every `gog-input-wrapper--*` chain bottoms out at it.
   */
  protected readonly sizeClass = computed(() =>
    this.resolvedSize() === 'md' ? '' : `gog-input-wrapper--${this.resolvedSize()}`,
  );

  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedClearLabel = computed(() =>
    resolveConfigured(this.clearAriaLabel(), this.globalConfig.labels?.clear, DEFAULT_LABELS.clear),
  );
  protected readonly resolvedIncrementLabel = computed(() =>
    resolveConfigured(
      this.incrementLabel(),
      this.globalConfig.labels?.increment,
      DEFAULT_LABELS.increment,
    ),
  );
  protected readonly resolvedDecrementLabel = computed(() =>
    resolveConfigured(
      this.decrementLabel(),
      this.globalConfig.labels?.decrement,
      DEFAULT_LABELS.decrement,
    ),
  );

  protected readonly resolvedShowSpinButtons = computed(() =>
    resolveConfigured(
      this.showSpinButtons(),
      this.globalConfig.inputfield?.showSpinButtons,
      DEFAULT_SHOW_SPIN_BUTTONS,
    ),
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /** Disabled and read-only both refuse edits; the affordances that offer one key off this. */
  protected readonly isNotEditable = computed(() => this.isDisabled() || this.readonly());
  protected readonly isPasswordField = computed(() => this.type() === 'password');
  protected readonly isNumberField = computed(() => this.type() === 'number');
  protected readonly hasSpinButtons = computed(
    () => this.isNumberField() && this.resolvedShowSpinButtons() && !this.readonly(),
  );
  /** Current field value as a number, or `null` while empty. */
  private readonly numericValue = computed(() =>
    this.value() === '' ? null : Number(this.value()),
  );
  protected readonly isAtMin = computed(() => {
    const min = this.min();
    const current = this.numericValue();
    return min !== null && current !== null && current <= min;
  });
  protected readonly isAtMax = computed(() => {
    const max = this.max();
    const current = this.numericValue();
    return max !== null && current !== null && current >= max;
  });
  protected readonly effectiveType = computed(() =>
    this.isPasswordField() && this.passwordVisible() ? 'text' : this.type(),
  );
  protected readonly effectiveAutocomplete = computed(
    () => this.autocomplete() || (this.type() === 'password' ? 'current-password' : 'off'),
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  /** Fallback id, generated once per instance — see `resolvedInputId`. */
  private readonly autoId = nextGogControlId('gog-input');
  /** The consumer's `inputId` when given, otherwise the generated one. Never empty. */
  protected readonly resolvedInputId = computed(() => this.inputId() || this.autoId);
  /**
   * Only non-null while the error element is actually rendered — the template renders it on
   * `visibleError()`, and an `aria-describedby` pointing at an id that isn't in the DOM is worse
   * than none at all.
   */
  protected readonly errorId = computed(() =>
    this.visibleError() ? `${this.resolvedInputId()}-error` : null,
  );

  private readonly floatLabelState = new GogFloatLabelState(
    this.floatLabel,
    this.floatLabelShowPlaceholder,
    this.placeholder,
    this.isFocused,
    // "Has content" for a text field is simply a non-empty value.
    computed(() => this.value() !== ''),
    this.globalConfig,
  );

  private readonly clearableState = new GogClearableState(
    this.clearable,
    computed(() => this.value() !== ''),
    this.isNotEditable,
    this.globalConfig,
    () => false,
  );
  /** Whether to render the clear button right now — see `GogClearableState`. */
  protected readonly showClear = this.clearableState.isVisible;

  /**
   * Both the stepper and the clear button are on screen — only possible on a `clearable`
   * number field with a value. Drives `.gog-input-wrapper--spin-clear`, which widens the end
   * gutter and shifts the clear button clear of the stepper; without it the two overlap.
   */
  protected readonly hasSpinAndClear = computed(
    () => this.hasSpinButtons() && this.showClear() && !this.isPasswordField(),
  );

  protected readonly resolvedFloatLabel = this.floatLabelState.variant;
  protected readonly isFloatLabelActive = this.floatLabelState.isActive;
  protected readonly isFloatLabelFloated = this.floatLabelState.isFloated;
  protected readonly effectivePlaceholder = this.floatLabelState.effectivePlaceholder;

  /** Projected `gogInputAddonStart` element, if any. */
  protected readonly addonStart = contentChild(GogInputAddonStartDirective);
  /** Projected `gogInputAddonEnd` element, if any. */
  protected readonly addonEnd = contentChild(GogInputAddonEndDirective);

  /**
   * Drives the wrapper's `--icon-start` class, which widens the field's leading gutter. Counts
   * a projected addon as well as the legacy icon inputs, or the addon would overlap the text.
   */
  protected readonly hasIconStart = computed(
    () => !!this.addonStart() || !!this.iconStartTemplate() || !!this.iconStart(),
  );
  protected readonly hasIconStartAction = computed(() => !!this.iconStartFn());

  /** For password fields the trailing icon is always the built-in show/hide toggle. */
  protected readonly effectiveIconEnd = computed<GogIconName | ''>(() =>
    this.isPasswordField() ? (this.passwordVisible() ? 'eye-off' : 'eye') : this.iconEnd(),
  );
  protected readonly effectiveIconEndLabel = computed(() => {
    if (!this.isPasswordField()) return this.iconEndLabel();
    return this.passwordVisible()
      ? resolveConfigured(
          this.hidePasswordLabel(),
          this.globalConfig.labels?.hidePassword,
          DEFAULT_LABELS.hidePassword,
        )
      : resolveConfigured(
          this.showPasswordLabel(),
          this.globalConfig.labels?.showPassword,
          DEFAULT_LABELS.showPassword,
        );
  });
  protected readonly hasIconEnd = computed(
    () =>
      this.showClear() ||
      !!this.addonEnd() ||
      !!this.iconEndTemplate() ||
      !!this.effectiveIconEnd(),
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

  /** Increments (`direction: 1`) or decrements (`direction: -1`) by `step`, clamped to min/max. */
  protected stepValue(direction: 1 | -1): void {
    if (this.isNotEditable()) return;

    const step = this.step() ?? DEFAULT_STEP;
    const current = this.numericValue() ?? this.min() ?? 0;
    let next = roundToStep(current + direction * step, step);

    const min = this.min();
    const max = this.max();
    if (min !== null) next = Math.max(next, min);
    if (max !== null) next = Math.min(next, max);

    this.value.set(String(next));
    this._onChange(next);
  }

  /**
   * Clears the field and notifies any attached form.
   *
   * The value written to the form control has to match what `onInput` writes when the user
   * empties the field by hand — `null` for a number field, `''` otherwise. Emitting `''` for a
   * number field put a string into a control typed `number | null`, which then failed
   * `Validators.min`-style checks and round-tripped the wrong type to the server.
   */
  protected clearValue(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.value.set('');
    this._onChange(this.isNumberField() ? null : '');
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
