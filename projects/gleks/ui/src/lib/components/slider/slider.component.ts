import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'gog-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
  host: {
    '[style.--thumb-pos]': 'thumbPos()',
    '[style.--fill-scale]': 'fillScale()',
  },
})
export class SliderComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly inputId = `gog-slider-${++SliderComponent.nextId}`;

  readonly label = input('');
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly showValue = input(true);
  readonly showThumb = input(true);
  readonly errorMessage = input('');
  readonly ariaLabel = input('');
  readonly disabled = input(false);

  /** Two-way bindable value: `[(value)]="signal"`. */
  readonly value = model<number>(0);

  private readonly cvaDisabled = signal(false);
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
  protected readonly errorId = computed(() => (this.errorMessage() ? `${this.inputId}-error` : null));

  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

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
