import { ChangeDetectionStrategy, Component, computed, effect, input, model } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { GogPaginatorRangeMode, GogSize } from '../../shared/types';

@Component({
  selector: 'gog-paginator',
  imports: [ButtonComponent],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-paginator',
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    // Drives the :host(.gog-host--auto-width) rule in the stylesheet — without this
    // binding the `fullWidth` input has no visible effect. Inverted from gog-button's
    // full-width class: this control is full width by default, so the class only
    // appears once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export class PaginatorComponent {
  /** 1-based current page. Two-way bindable: `[(page)]="myPageSignal"`. */
  readonly page = model(1);
  /**
   * Full width of the container by default. Set to `false` to shrink to fit the page
   * buttons instead.
   */
  readonly fullWidth = input(true);
  readonly totalPages = input(1);
  /**
   * `window` (default): a fixed number of page buttons (`visiblePages`) that slides to keep
   * the current page centered, clamped at the edges — no ellipsis, no pinned boundaries
   * unless `showFirstPage`/`showLastPage` ask for them.
   * `ellipsis`: the original behavior — first and last page are always pinned, and
   * `siblingCount` pages are kept around the current one, with a "…" filling the gap. Kept
   * around as an opt-in for consumers (like `gog-table`) already built around that look.
   */
  readonly rangeMode = input<GogPaginatorRangeMode>('window');
  /** `rangeMode="window"` only: how many page number buttons stay visible at once. */
  readonly visiblePages = input(5);
  /** `rangeMode="window"` only: always keep page 1 reachable, with a "…" if it's not adjacent. */
  readonly showFirstPage = input(false);
  /** `rangeMode="window"` only: always keep the last page reachable, with a "…" if it's not adjacent. */
  readonly showLastPage = input(false);
  /** `rangeMode="ellipsis"` only: how many page numbers to keep on each side of the current page. */
  readonly siblingCount = input(2);
  readonly size = input<GogSize>('sm');
  readonly disabled = input(false);
  readonly ariaLabel = input('Pagination');

  protected readonly pageNumbers = computed(() => {
    const total = Math.max(1, this.totalPages());
    const current = this.page();
    return this.rangeMode() === 'ellipsis'
      ? this.ellipsisRange(total, current)
      : this.windowRange(total, current);
  });

  constructor() {
    // Self-clamps whenever `totalPages` shrinks below the current page (or a consumer
    // passes an out-of-range value directly), so every consumer gets correct bounds for
    // free instead of reimplementing this per usage.
    effect(() => {
      const total = Math.max(1, this.totalPages());
      const current = this.page();
      if (current > total) {
        this.page.set(total);
      } else if (current < 1) {
        this.page.set(1);
      }
    });
  }

  private windowRange(total: number, current: number): (number | '...')[] {
    const windowSize = Math.min(Math.max(1, this.visiblePages()), total);
    const start = Math.max(
      1,
      Math.min(current - Math.floor((windowSize - 1) / 2), total - windowSize + 1),
    );
    const end = start + windowSize - 1;

    const range: (number | '...')[] = [];
    if (this.showFirstPage() && start > 1) {
      range.push(1);
      if (start > 2) range.push('...');
    }
    for (let i = start; i <= end; i++) range.push(i);
    if (this.showLastPage() && end < total) {
      if (end < total - 1) range.push('...');
      range.push(total);
    }
    return range;
  }

  private ellipsisRange(total: number, current: number): (number | '...')[] {
    const delta = Math.max(0, this.siblingCount());
    const range: (number | '...')[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }

  protected isNumber(value: number | '...'): value is number {
    return typeof value === 'number';
  }

  protected goTo(target: number): void {
    if (this.disabled() || target < 1 || target > this.totalPages()) return;
    this.page.set(target);
  }

  protected prev(): void {
    this.goTo(this.page() - 1);
  }

  protected next(): void {
    this.goTo(this.page() + 1);
  }
}
