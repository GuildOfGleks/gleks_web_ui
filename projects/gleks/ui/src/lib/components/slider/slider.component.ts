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
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';

/** Built-in default, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
import { GogSliderOrientation, GogSliderRange } from '../../shared/types';

/** How many digits after the decimal point `step` prints, e.g. `0.25` → `2`, `5` → `0`. */
function decimalPlaces(step: number): number {
  const str = String(step);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

/**
 * Character count of `value` formatted with `decimals` fraction digits — the widest a
 * number in `[min, max]` at this `step` can ever print, since digit count only grows moving
 * away from zero (see `valueDisplayChars` below for why `min`/`max` alone are enough to
 * bound every value in between).
 */
function digitLength(value: number, decimals: number): number {
  const sign = value < 0 ? 1 : 0;
  const intLen = String(Math.trunc(Math.abs(value))).length;
  const fraction = decimals > 0 ? decimals + 1 : 0; // +1 for the decimal point itself
  return sign + intLen + fraction;
}

@Component({
  selector: 'gog-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--thumb-pos]': 'thumbPos()',
    '[style.--fill-scale]': 'fillScale()',
    '[style.--range-start-pos]': 'rangeStartPos()',
    '[style.--range-end-pos]': 'rangeEndPos()',
    '[style.--value-chars]': 'valueDisplayChars()',
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
  /** Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to `'manual'`. */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly ariaLabel = input('');
  readonly disabled = input(false);
  /**
   * Full width of the container by default. Set to `false` to size the track to
   * `--gog-slider-auto-width` instead — a slider's track has no content of its own to
   * shrink-wrap to, so unlike the other field controls this needs an explicit fallback
   * width rather than `fit-content`.
   *
   * Ignored when `orientation` is `'vertical'`: a vertical slider's own width is its
   * thickness, not its length, so it always sizes to fit its content. Its length instead
   * comes from `--gog-slider-vertical-length` (default `160px`), same idea as
   * `--gog-slider-auto-width` for the horizontal auto-width case.
   */
  readonly fullWidth = input(true);
  /**
   * `'horizontal'` (default) or `'vertical'`. The developer picks per instance — there is
   * no global default for this, since it's a layout decision tied to where the slider sits,
   * not a house style. Backed by a native `<input type="range">` rotated via `writing-mode`,
   * so dragging, touch and keyboard (Up/Down as well as Left/Right) all keep working exactly
   * as they do horizontally.
   */
  readonly orientation = input<GogSliderOrientation>('horizontal');

  /**
   * Switches the slider to two-thumb mode for picking a *range* of values instead of a
   * single one. When on, use `[(rangeValue)]` instead of `[(value)]` — the two are mutually
   * exclusive; `value`/`writeValue` are ignored while this is `true`, and vice versa.
   */
  readonly range = input(false);
  /**
   * Accessible name for the start (lower) thumb in `range` mode. Falls back to `'Minimum'`,
   * prefixed with `label()` when one is set (e.g. `'Price Minimum'`) — a shared `<label>`
   * can't be associated with two inputs via `for`, so each thumb needs its own name.
   */
  readonly startAriaLabel = input('');
  /** Accessible name for the end (upper) thumb in `range` mode. Falls back to `'Maximum'`. */
  readonly endAriaLabel = input('');
  /**
   * Disables only the start (lower) thumb in `range` mode — e.g. to pin a range's floor
   * while letting the consumer still raise or lower its ceiling. ORed with `disabled`
   * (either one disables it), never overrides it: `disabled` still means "both thumbs off".
   * Ignored outside `range` mode, where there's only one thumb and `disabled` already covers
   * it. Unlike `disabled`, this never applies the whole-control `.gog-slider--disabled`
   * dimming/`pointer-events: none` — only the one thumb goes inert, both visually (its own
   * dot dims) and functionally (the native input's own `disabled` attribute takes it out of
   * the tab order), so the other thumb stays fully usable.
   */
  readonly startDisabled = input(false);
  /** Disables only the end (upper) thumb in `range` mode. Mirrors `startDisabled`. */
  readonly endDisabled = input(false);

  /** Two-way bindable value: `[(value)]="signal"`. Ignored when `range` is `true`. */
  readonly value = model<number>(0);
  /** Two-way bindable `{ start, end }` pair: `[(rangeValue)]="signal"`. Used only when `range` is `true`. */
  readonly rangeValue = model<GogSliderRange>({ start: 0, end: 100 });

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cvaDisabled = signal(false);
  private readonly globalConfig = inject(GOG_CONFIG);
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

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /**
   * `isDisabled()` also covers `cvaDisabled()` — a `[formControl]`'s own `.disable()`, which
   * (being one FormControl backing one `rangeValue`) always speaks for both thumbs at once
   * and has no way to target just one. `startDisabled`/`endDisabled` are the only route to a
   * one-sided disable, and only make sense in `range` mode.
   */
  protected readonly isStartDisabled = computed(() => this.isDisabled() || this.startDisabled());
  protected readonly isEndDisabled = computed(() => this.isDisabled() || this.endDisabled());
  /**
   * Drives the whole-control `.gog-slider--disabled` class (dimming + `pointer-events: none`
   * over the whole track). Applying that class off a one-sided `isStartDisabled()`/
   * `isEndDisabled()` would also block pointer/touch input to the *other*, still-enabled
   * thumb — `pointer-events: none` on an ancestor cuts off every descendant, not just the
   * disabled one — so in `range` mode this only fires once *both* sides are disabled. A
   * still-disabled single thumb stays inert on its own regardless (its native `disabled`
   * attribute already takes it out of the tab order and stops it from firing events).
   */
  protected readonly isFullyDisabled = computed(() =>
    this.range() ? this.isStartDisabled() && this.isEndDisabled() : this.isDisabled(),
  );
  protected readonly clampedValue = computed(() => {
    const value = this.value();
    return Math.min(this.max(), Math.max(this.min(), value));
  });
  /**
   * `rangeValue()` clamped to `[min, max]`, swapping the pair back in order if a consumer
   * writes `start > end` directly (e.g. via `writeValue`/a FormControl) — dragging or
   * keyboard-nudging a thumb past the other can never produce that, since
   * onRangeStartInput/onRangeEndInput already clamp against each other there.
   */
  protected readonly clampedRange = computed(() => this.clampRange(this.rangeValue()));

  private percentFor(value: number): number {
    const span = this.max() - this.min();
    if (span === 0) return 0;
    return ((value - this.min()) / span) * 100;
  }

  private clampRange(value: GogSliderRange): GogSliderRange {
    const lo = this.min();
    const hi = this.max();
    const start = Math.min(hi, Math.max(lo, value.start));
    const end = Math.min(hi, Math.max(lo, value.end));
    return start <= end ? { start, end } : { start: end, end: start };
  }

  protected readonly fillPercent = computed(() => this.percentFor(this.clampedValue()));
  protected readonly rangeStartPercent = computed(() => this.percentFor(this.clampedRange().start));
  protected readonly rangeEndPercent = computed(() => this.percentFor(this.clampedRange().end));

  protected readonly thumbPos = computed(() => `${this.fillPercent()}%`);
  protected readonly fillScale = computed(() => this.fillPercent() / 100);
  protected readonly rangeStartPos = computed(() => `${this.rangeStartPercent()}%`);
  protected readonly rangeEndPos = computed(() => `${this.rangeEndPercent()}%`);
  protected readonly rangeDisplayValue = computed(() => {
    const { start, end } = this.clampedRange();
    return `${start} – ${end}`;
  });
  /**
   * Reserved width for `.gog-slider__value`, in `ch`. Without this the span sizes to
   * whatever the *current* value happens to print as, so it visibly resizes on every drag —
   * harmless when `fullWidth` absorbs the wiggle (the default for horizontal), but a vertical
   * slider is only ever as wide as its content (see the `fit-content` comment in the
   * stylesheet), so there the whole control jitters in width as you drag, and the header row
   * being what's regrowing/shrinking tugs the min/max labels below along with it even though
   * their own text never changes. Sized from `min()`/`max()` rather than the live value:
   * digit count only grows moving away from zero, so whichever endpoint prints the most
   * characters is already the worst case for every value in between.
   */
  protected readonly valueDisplayChars = computed(() => {
    const decimals = decimalPlaces(this.step());
    const chars = Math.max(digitLength(this.min(), decimals), digitLength(this.max(), decimals));
    return this.range() ? chars * 2 + 3 : chars; // +3 for the " – " separator
  });
  protected readonly startInputAriaLabel = computed(() => {
    const base = this.startAriaLabel() || 'Minimum';
    return this.label() ? `${this.label()} ${base}` : base;
  });
  protected readonly endInputAriaLabel = computed(() => {
    const base = this.endAriaLabel() || 'Maximum';
    return this.label() ? `${this.label()} ${base}` : base;
  });
  protected readonly isVertical = computed(() => this.orientation() === 'vertical');
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;
  protected readonly errorId = computed(() => (this.hasError() ? `${this.inputId}-error` : null));

  /** Fires with a plain `number` normally, or a `GogSliderRange` while `range()` is `true`. */
  private onChange: (val: number | GogSliderRange) => void = () => {};
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

  writeValue(val: number | GogSliderRange): void {
    if (this.range()) {
      const next = (val as GogSliderRange | null) ?? { start: this.min(), end: this.max() };
      this.rangeValue.set(this.clampRange(next));
    } else {
      const next = (val as number | null) ?? this.min();
      this.value.set(Math.min(this.max(), Math.max(this.min(), next)));
    }
  }

  registerOnChange(fn: (val: number | GogSliderRange) => void): void {
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

  /**
   * Start (lower) thumb in `range` mode. Both native inputs keep the slider's global
   * `min()`/`max()` (see the template's comment on why), so crossing prevention happens
   * entirely here via `Math.min(current.end, ...)` rather than through a narrowed native
   * `max` attribute — which also means the browser will happily keep dragging this input's
   * own raw `.value` past `current.end` even once we've clamped the logical value. Writing
   * the clamped result back to `input.value` directly (rather than trusting the `[value]`
   * binding to do it) matters because that binding no-ops once the *next* clamped result
   * matches what Angular itself last wrote — it has no way to know the raw DOM value has
   * since drifted out from under it via native dragging.
   */
  onRangeStartInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = Number(input.value);
    const current = this.clampedRange();
    const start = Math.min(current.end, Math.max(this.min(), raw));
    const next: GogSliderRange = { start, end: current.end };

    input.value = String(start);
    this.rangeValue.set(next);
    this.onChange(next);
  }

  /** End (upper) thumb in `range` mode. Mirrors `onRangeStartInput`. */
  onRangeEndInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = Number(input.value);
    const current = this.clampedRange();
    const end = Math.max(current.start, Math.min(this.max(), raw));
    const next: GogSliderRange = { start: current.start, end };

    input.value = String(end);

    this.rangeValue.set(next);
    this.onChange(next);
  }
}
