import {
  Directive,
  ElementRef,
  type OnInit,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  isDevMode,
  output,
  untracked,
} from '@angular/core';
import {
  type AbstractControl,
  type ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  type ValidationErrors,
  type Validator,
} from '@angular/forms';
import { GogMaskController, gogMaskValidator } from './mask-controller';
import {
  type GogMask,
  type GogMaskState,
  type GogMaskTokens,
  type GogMaskValue,
  compileMask,
} from './mask-engine';

/** A masked `<input>` cannot be one of these: a number input has no caret, a password no shape. */
const UNMASKABLE_TYPES = new Set(['number', 'password']);

/**
 * Formats an `<input>` to a fixed shape as it is typed — a phone number, a barcode, a postcode.
 *
 * ```html
 * <input gogMask="+38 (000) 000-00-00" [(ngModel)]="phone" />
 * ```
 *
 * `0` takes a digit, `a` a letter, `*` either, and `\` makes the next character a literal; any
 * other character is a literal, inserted as the user types. `gogMaskTokens` adds slot characters
 * (`{ H: /[0-9a-f]/i }`), and an array of patterns is a value whose length varies.
 *
 * The form gets the slot characters alone (`'0501234567'`) unless `gogMaskValue="formatted"`, and
 * a value written in is read the same way. A non-empty value that fills no pattern is invalid
 * with `{ gogMask: { actual, required } }`; an empty one is left to `Validators.required`. When
 * every slot takes digits only and the element has no `inputmode`, it gets `numeric`.
 *
 * Works on any `<input>` with or without a form — `(gogMaskChange)` carries every conformed value.
 * `gog-inputfield` has the same as its own `mask` input.
 */
@Directive({
  selector: 'input[gogMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GogMaskDirective),
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => GogMaskDirective), multi: true },
  ],
  host: {
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
    '(compositionstart)': 'onCompositionStart()',
    '(compositionend)': 'onCompositionEnd()',
    '(blur)': 'onBlur()',
  },
})
export class GogMaskDirective implements ControlValueAccessor, Validator, OnInit {
  /** The pattern, or several for a value whose length varies. `null` or `''` turns masking off. */
  readonly mask = input.required<GogMask | null>({ alias: 'gogMask' });
  /** Extra slot characters, or overrides of `0`, `a` and `*`. */
  readonly tokens = input<GogMaskTokens>({}, { alias: 'gogMaskTokens' });
  /** What the form gets, and how a written value is read. */
  readonly maskValue = input<GogMaskValue>('raw', { alias: 'gogMaskValue' });

  /** Every conformed value, typed or written — for an `<input>` with no form around it. */
  readonly gogMaskChange = output<GogMaskState>();

  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly unmaskable = computed(() => UNMASKABLE_TYPES.has(this.element.type));
  private readonly compiled = computed(() => {
    const mask = this.mask();
    if (!mask || mask.length === 0 || this.unmaskable()) return null;
    return compileMask(mask, this.tokens());
  });
  private readonly controller = new GogMaskController(
    () => this.element,
    () => this.compiled(),
  );
  private readonly validator = gogMaskValidator(
    () => this.compiled(),
    () => this.maskValue(),
  );
  /** `inputmode` this directive set, so it takes back only its own. */
  private ownInputMode = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    // A new pattern re-shapes what is already there and re-judges it.
    effect(() => {
      const compiled = this.compiled();
      untracked(() => {
        const before = this.controller.state.display;
        const raw = this.controller.state.raw;
        // What a controller has conformed is raw; text it has not seen yet (a static `value`)
        // is read as typed.
        const state = raw
          ? this.controller.write(raw, true)
          : this.controller.write(this.element.value, false);
        this.syncInputMode(!!compiled?.numeric);
        if (compiled && state.display !== before) this.gogMaskChange.emit(state);
        this.onValidatorChange();
      });
    });
  }

  ngOnInit(): void {
    if (isDevMode() && this.unmaskable()) {
      console.warn(
        `[gogMask] has no effect on <input type="${this.element.type}">: a number input exposes no ` +
          'caret, and a password has no shape to show. Use type="text" or "tel".',
      );
    }
  }

  writeValue(value: unknown): void {
    const text = value === null || value === undefined ? '' : String(value);
    this.controller.write(text, this.maskValue() === 'raw');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.element.disabled = disabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  protected onInput(): void {
    if (!this.compiled()) {
      this.onChange(this.element.value);
      return;
    }
    this.emit(this.controller.input());
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.emit(this.controller.keydown(event));
  }

  protected onCompositionStart(): void {
    this.controller.compositionStart();
  }

  protected onCompositionEnd(): void {
    this.emit(this.controller.compositionEnd());
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private emit(state: GogMaskState | null): void {
    if (!state) return;
    this.onChange(this.controller.value(this.maskValue()));
    this.gogMaskChange.emit(state);
  }

  private syncInputMode(numeric: boolean): void {
    if (numeric && !this.element.hasAttribute('inputmode')) {
      this.element.setAttribute('inputmode', 'numeric');
      this.ownInputMode = true;
    } else if (!numeric && this.ownInputMode) {
      this.element.removeAttribute('inputmode');
      this.ownInputMode = false;
    }
  }
}
