import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GogProgressbarMode, GogProgressbarVariant, GogSize } from '../../shared/types';

const MIN = 0;
const MAX = 100;

function clamp(value: number): number {
  if (!Number.isFinite(value)) return MIN;
  return Math.min(MAX, Math.max(MIN, value));
}

/**
 * A horizontal progress indicator.
 *
 * ```html
 * <gog-progressbar [value]="42" />
 * <gog-progressbar mode="indeterminate" ariaLabel="Загрузка" />
 * <gog-progressbar mode="buffer" [value]="42" [buffer]="70" />
 * ```
 *
 * `value` and `buffer` are percentages and are clamped to 0–100 rather than trusted: a bar
 * driven straight from `loaded / total` overshoots on the last chunk often enough that
 * clamping here is worth more than letting the caller find out from a broken layout.
 */
@Component({
  selector: 'gog-progressbar',
  imports: [],
  templateUrl: './progressbar.component.html',
  styleUrl: './progressbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    role: 'progressbar',
    '[attr.aria-valuemin]': 'MIN',
    '[attr.aria-valuemax]': 'MAX',
    // Absent in indeterminate mode — that omission is precisely what tells assistive tech the
    // work has no known length. Reporting 0 instead would announce "0 percent" forever.
    '[attr.aria-valuenow]': 'isIndeterminate() ? null : clampedValue()',
    '[attr.aria-valuetext]': 'isIndeterminate() ? null : displayValue()',
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class ProgressbarComponent {
  protected readonly MIN = MIN;
  protected readonly MAX = MAX;

  /** Percentage complete, 0–100. Ignored in `'indeterminate'` mode. */
  readonly value = input(0);
  /** Secondary level shown behind `value` in `'buffer'` mode — preloaded but not yet played. */
  readonly buffer = input(0);
  readonly mode = input<GogProgressbarMode>('determinate');
  readonly variant = input<GogProgressbarVariant>('accent');
  readonly size = input<GogSize>('md');
  /** Renders the percentage next to the bar. Off by default — most bars sit under a label. */
  readonly showValue = input(false);
  readonly ariaLabel = input('');

  protected readonly isIndeterminate = computed(() => this.mode() === 'indeterminate');
  protected readonly clampedValue = computed(() => clamp(this.value()));
  protected readonly clampedBuffer = computed(() => clamp(this.buffer()));
  protected readonly displayValue = computed(() => `${Math.round(this.clampedValue())}%`);
  /** The fill is driven to 100% in indeterminate mode; the animation moves it, not the width. */
  protected readonly fillPercent = computed(() =>
    this.isIndeterminate() ? MAX : this.clampedValue(),
  );

  protected readonly hostClasses = computed(() =>
    [
      'gog-progressbar',
      `gog-progressbar--${this.mode()}`,
      `gog-progressbar--${this.variant()}`,
      `gog-progressbar--${this.size()}`,
      this.showValue() ? 'gog-progressbar--with-value' : null,
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
}
