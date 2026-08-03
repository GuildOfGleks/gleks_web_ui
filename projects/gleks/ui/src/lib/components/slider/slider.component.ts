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

import { GogErrorState, type GogErrorDisplay } from '../../shared/error-state';

@Component({
  selector: 'gog-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--thumb-pos]': 'thumbPos()',
    '[style.--fill-scale]': 'fillScale()',
    // Drives the :host(.gog-host--auto-width) rule in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Inverted from gog-button's
    // full-width class: this control is full width by default, so the class only
    // appears once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class SliderComponent implements ControlValueAccessor, DoCheck {
  private static nextId = 0;
  protected readonly inputId = `gog-slider-${++SliderComponent.nextId}`;

  readonly label = input('');
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly showValue = input(true);
  readonly showThumb = input(true);
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  readonly errorDisplay = input<GogErrorDisplay>('manual');
  readonly ariaLabel = input('');
  readonly disabled = input(false);
  /**
   * Full width of the container by default. Set to `false` to size the track to
   * `--gog-slider-auto-width` instead — a slider's track has no content of its own to
   * shrink-wrap to, so unlike the other field controls this needs an explicit fallback
   * width rather than `fit-content`.
   */
  readonly fullWidth = input(true);

  /** Two-way bindable value: `[(value)]="signal"`. */
  readonly value = model<number>(0);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.errorDisplay,
    this.ngControl,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly clampedValue = computed(() => {
    const value = this.value();
    return Math.min(this.max(), Math.max(this.min(), value));
  });

  protected readonly fillPercent = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) return 0;
    return ((this.clampedValue() - this.min()) / range) * 100;
  });

  protected readonly thumbPos = computed(() => `${this.fillPercent()}%`);
  protected readonly fillScale = computed(() => this.fillPercent() / 100);
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;
  protected readonly errorId = computed(() => (this.hasError() ? `${this.inputId}-error` : null));

  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

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

  writeValue(val: number): void {
    const next = val ?? this.min();
    this.value.set(Math.min(this.max(), Math.max(this.min(), next)));
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Number(input.value);
    const value = Math.min(this.max(), Math.max(this.min(), next));

    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
