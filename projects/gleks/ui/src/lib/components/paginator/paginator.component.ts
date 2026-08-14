import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
} from '@angular/core';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { ButtonComponent } from '../button/button.component';
import { SelectComponent } from '../select/select.component';
import { GogPaginatorRangeMode, GogSize } from '../../shared/types';

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG.labels` supplies one. */
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];
/** Off by default: a paginator that silently grew a control would change every existing layout. */
const DEFAULT_SHOW_PAGE_SIZE_SELECT = false;

const DEFAULT_LABELS = {
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  rowsPerPage: 'Rows per page',
  page: (page: number, isCurrent: boolean) =>
    isCurrent ? `Page ${page}, current page` : `Go to page ${page}`,
};

@Component({
  selector: 'gog-paginator',
  imports: [ButtonComponent, SelectComponent],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-paginator',
    role: 'navigation',
    '[attr.aria-label]': 'resolvedAriaLabel()',
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
  /**
   * How many pages there are. Ignored when `totalRecords` is given — see there.
   */
  readonly totalPages = input(1);
  /**
   * How many rows exist in total. Given this, the paginator computes the page count itself from
   * `pageSize`, which is what removes the `computed(() => Math.ceil(total / size))` a consumer
   * would otherwise have to write and keep in sync with the select below.
   *
   * `null` (the default) keeps the old contract: you tell it `totalPages` directly.
   */
  readonly totalRecords = input<number | null>(null);
  /**
   * Rows per page. Two-way bindable — `[(pageSize)]="size"` — which is the whole point once
   * `showPageSizeSelect` is on: the select writes back through this, and nothing has to be
   * ferried between components by hand. `gog-table` binds its own `pageSize` model straight to
   * this one.
   */
  readonly pageSize = model(DEFAULT_PAGE_SIZE);
  /**
   * Whether to offer the rows-per-page select. Unset, falls back to
   * `GOG_CONFIG.paginator.showPageSizeSelect`, then to `false`.
   */
  readonly showPageSizeSelect = input<boolean | undefined>(undefined);
  /**
   * The choices the select offers. Unset, falls back to
   * `GOG_CONFIG.paginator.pageSizeOptions`, then to `[10, 20, 30, 40, 50]`.
   */
  readonly pageSizeOptions = input<number[] | undefined>(undefined);
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
  /**
   * Accessible name of the `<nav>`. Unset, falls back to `GOG_CONFIG.labels.pagination`, then
   * to `'Pagination'`.
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  private readonly globalConfig = inject(GOG_CONFIG);

  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedAriaLabel = computed(() =>
    resolveConfigured(
      this.ariaLabel(),
      this.globalConfig.labels?.pagination,
      DEFAULT_LABELS.pagination,
    ),
  );
  /**
   * The two step buttons. Config-only: unlike the `<nav>` name, these say the same thing on
   * every paginator in an app, so a per-instance input would be dead weight.
   */
  protected readonly resolvedPreviousLabel = computed(() =>
    resolveConfigured(
      undefined,
      this.globalConfig.labels?.previousPage,
      DEFAULT_LABELS.previousPage,
    ),
  );
  protected readonly resolvedNextLabel = computed(() =>
    resolveConfigured(undefined, this.globalConfig.labels?.nextPage, DEFAULT_LABELS.nextPage),
  );
  /**
   * Names one page button. A method rather than a `computed`, since it takes the page number —
   * the formatter itself is resolved once and only re-read when the config object changes.
   */
  protected pageLabel(page: number): string {
    const format = this.globalConfig.labels?.page ?? DEFAULT_LABELS.page;
    return format(page, page === this.page());
  }

  protected readonly resolvedShowPageSizeSelect = computed(() =>
    resolveConfigured(
      this.showPageSizeSelect(),
      this.globalConfig.paginator?.showPageSizeSelect,
      DEFAULT_SHOW_PAGE_SIZE_SELECT,
    ),
  );
  protected readonly resolvedRowsPerPageLabel = computed(() =>
    resolveConfigured(undefined, this.globalConfig.labels?.rowsPerPage, DEFAULT_LABELS.rowsPerPage),
  );
  /**
   * The select takes `{ id, name }` objects because that is `GogDropdownOption`'s default shape —
   * `optionLabel`/`optionValue` accessors for a list of plain numbers would be more API than the
   * mapping saves. The current `pageSize` is included even when it is not one of the offered
   * options, so a programmatic `[pageSize]="15"` shows 15 rather than an empty trigger.
   */
  protected readonly resolvedPageSizeOptions = computed(() => {
    const options = resolveConfigured(
      this.pageSizeOptions(),
      this.globalConfig.paginator?.pageSizeOptions,
      DEFAULT_PAGE_SIZE_OPTIONS,
    );
    const current = this.pageSize();
    const all = options.includes(current) ? options : [...options, current].sort((a, b) => a - b);
    return all.map((size) => ({ id: size, name: String(size) }));
  });

  /**
   * `totalRecords` when supplied, `totalPages` otherwise — every internal read goes through this
   * so the two inputs cannot disagree anywhere.
   */
  protected readonly resolvedTotalPages = computed(() => {
    const records = this.totalRecords();
    if (records === null) return Math.max(1, this.totalPages());
    return Math.max(1, Math.ceil(Math.max(0, records) / Math.max(1, this.pageSize())));
  });

  protected readonly pageNumbers = computed(() => {
    const total = this.resolvedTotalPages();
    const current = this.page();
    return this.rangeMode() === 'ellipsis'
      ? this.ellipsisRange(total, current)
      : this.windowRange(total, current);
  });

  constructor() {
    // Self-clamps whenever the page count shrinks below the current page (or a consumer
    // passes an out-of-range value directly), so every consumer gets correct bounds for
    // free instead of reimplementing this per usage.
    effect(() => {
      const total = this.resolvedTotalPages();
      const current = this.page();
      if (current > total) {
        this.page.set(total);
      } else if (current < 1) {
        this.page.set(1);
      }
    });

    /*
     * A new page size invalidates the current page: "page 5" of 10-row pages is not "page 5" of
     * 50-row ones, and clamping alone would leave the user somewhere they did not ask to be.
     * Back to page 1, which is the only position that means the same thing at every size.
     * `untracked` so this reacts to the size and not to its own write.
     */
    let previousSize: number | null = null;
    effect(() => {
      const size = this.pageSize();
      // Guarded on an actual change, not on the effect running: the first run must leave an
      // initial `[page]="3"` alone, and re-running for an unrelated dependency must not snap the
      // user back to page 1.
      if (previousSize !== null && previousSize !== size) {
        untracked(() => {
          if (this.page() !== 1) this.page.set(1);
        });
      }
      previousSize = size;
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
    if (this.disabled() || target < 1 || target > this.resolvedTotalPages()) return;
    this.page.set(target);
  }

  protected prev(): void {
    this.goTo(this.page() - 1);
  }

  protected next(): void {
    this.goTo(this.page() + 1);
  }

  protected onPageSizeChange(size: number | null): void {
    if (size !== null) this.pageSize.set(size);
  }
}
