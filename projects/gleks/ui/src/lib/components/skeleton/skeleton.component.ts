import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GogSize, GogSkeletonAnimation, GogSkeletonShape } from '../../shared/types';

@Component({
  selector: 'gog-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[style.width]': 'width()',
    '[style.height]': 'resolvedHeight()',
    // Decorative by default — a page can carry dozens of these while loading, and a
    // role="status" on every single bone would flood assistive tech with announcements.
    // Pass `ariaLabel` on the one instance that should actually speak for the loading state.
    '[attr.role]': 'ariaLabel() ? "status" : null',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
})
export class SkeletonComponent {
  readonly shape = input<GogSkeletonShape>('text');
  readonly size = input<GogSize>('md');
  readonly animation = input<GogSkeletonAnimation>('pulse');
  /** CSS width, e.g. '240px' or '60%'. Falls back to a shape/size default when unset. */
  readonly width = input<string | null>(null);
  /** CSS height override. Ignored for `text`, whose lines size from `size` instead. */
  readonly height = input<string | null>(null);
  /** Number of stacked lines when `shape="text"`. The last line renders shorter. */
  readonly lines = input(1);
  readonly rounded = input(true);
  readonly ariaLabel = input<string | null>(null);

  protected readonly lineList = computed(() => {
    const count = Math.max(1, this.lines());
    return Array.from({ length: count }, (_, index) => count > 1 && index === count - 1);
  });

  // Keeps a width-only override circular instead of an oval, since `circle` has no
  // independent height concept of its own.
  protected readonly resolvedHeight = computed(() => {
    if (this.shape() === 'text') {
      return null;
    }
    if (this.shape() === 'circle') {
      return this.height() ?? this.width();
    }
    return this.height();
  });

  protected readonly hostClasses = computed(() =>
    [
      'gog-skeleton',
      `gog-skeleton--${this.shape()}`,
      `gog-skeleton--${this.size()}`,
      `gog-skeleton--${this.animation()}`,
      this.rounded() ? null : 'gog-skeleton--square',
    ]
      .filter((className): className is string => className !== null)
      .join(' '),
  );
}
