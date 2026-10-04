import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import {
  GOG_CONFIG,
  GogErrorState,
  GogSize,
  nextGogControlId,
  resolveConfigured,
  type GogErrorDisplay,
} from '@guildofgleks/ui/shared';

/** Built-in defaults, used when `GOG_CONFIG.labels` leaves them unset. */
const DEFAULT_LABELS = {
  ratingStar: (value: number) => (value === 1 ? '1 star' : `${value} stars`),
  ratingValue: (value: number | null, max: number) =>
    value === null ? 'Not rated' : `Rated ${value} out of ${max}`,
};

/** One drawn star: its value, and how much of it is filled (0, 0.5 or 1). */
interface Star {
  readonly value: number;
  readonly fill: number;
}

/**
 * A score out of a few stars, to give or to show. `docs/rating.md` has the argument for why it is
 * a component; the short version is that a row of stars is one choice out of `max`, and a
 * displayed score is a picture with a number in it — neither of which a row of icons says.
 *
 * **Interactive**, the stars are drawn over native radios, so the group is one tab stop, the arrow
 * keys move the rating and each star is read as "3 stars". Hovering previews the score a press
 * would give; with `clearable`, a press on the chosen star, or Space on it, clears it.
 *
 * **Read-only**, it is one `role="img"` named "Rated 4.7 out of 5". The stars draw to the nearest
 * half; the name keeps the real value.
 */
@Component({
  selector: 'gog-rating',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class RatingComponent implements ControlValueAccessor, DoCheck {
  /** The score, two-way. `null` is not rated. Also what an attached form control holds. */
  readonly value = model<number | null>(null);
  /** How many stars. */
  readonly max = input(5);
  /** A picture of the score rather than a control. The value may be fractional. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** A press on the chosen star clears the rating. */
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly label = input('');
  /** Names the group when there is no `label`. */
  readonly ariaLabel = input('');
  readonly errorMessage = input('');
  /** Unset, `GOG_CONFIG.control.errorDisplay`, then `'manual'`. */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Unset, `GOG_CONFIG.control.size`, then `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);

  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected readonly uid = nextGogControlId('gog-rating');
  protected readonly labelId = `${this.uid}-label`;
  protected readonly valueId = `${this.uid}-value`;
  protected readonly errorId = `${this.uid}-error`;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /** The star under the pointer, which the fill previews. */
  protected readonly hovered = signal<number | null>(null);

  private onChange: (value: number | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  private readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(this.errorDisplay(), this.globalConfig.control?.errorDisplay, 'manual'),
  );
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );
  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  private readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, 'md'),
  );

  protected readonly resolvedLabels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      star: configured.ratingStar ?? DEFAULT_LABELS.ratingStar,
      value: configured.ratingValue ?? DEFAULT_LABELS.ratingValue,
    };
  });

  private readonly count = computed(() => Math.max(1, Math.floor(this.max())));

  protected readonly stars = computed<readonly Star[]>(() => {
    // Read-only, to the nearest half; interactive, whole stars up to the hovered or chosen one.
    const shown = this.readonly()
      ? Math.round((this.value() ?? 0) * 2) / 2
      : (this.hovered() ?? this.value() ?? 0);
    return Array.from({ length: this.count() }, (_, i) => ({
      value: i + 1,
      fill: Math.min(1, Math.max(0, shown - i)),
    }));
  });

  protected readonly valueText = computed(() =>
    this.resolvedLabels().value(this.value(), this.count()),
  );

  protected readonly hostClasses = computed(
    () =>
      `gog-rating-host gog-rating--${this.resolvedSize()}` +
      (this.readonly() ? ' gog-rating--readonly' : ''),
  );

  constructor() {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  /**
   * On `click` rather than `change`: a radio that is already checked fires no `change`, and that
   * press is the one `clearable` needs. An arrow key also clicks the radio it moves to, after
   * checking it, so the value it compares against is still the previous one.
   */
  protected choose(star: number): void {
    if (this.isDisabled()) return;
    const next = this.clearable() && this.value() === star ? null : star;
    this.value.set(next);
    this.onChange(next);
  }

  /**
   * Space on a radio that is already checked does nothing natively — Chrome fires no `click` for it
   * — so the keyboard's way to clear is handled here, and the default is prevented so a browser that
   * does click does not clear and re-set it.
   */
  protected clearWithSpace(event: Event, star: number): void {
    if (!this.clearable() || this.isDisabled() || this.value() !== star) return;
    event.preventDefault();
    this.choose(star);
  }

  protected preview(star: number | null): void {
    if (!this.isDisabled()) this.hovered.set(star);
  }
}
