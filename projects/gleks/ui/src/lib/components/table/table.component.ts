import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  linkedSignal,
  model,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../icon/icon.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { SpinnerComponent } from '../spinner/spinner.component';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogSize } from '../../shared/types';
import { getByPath } from '../../shared/option-accessor';
import {
  GogColumn,
  type GogColumnBodyContext,
  type GogColumnHeaderContext,
  defaultCompare,
} from './column';
import { TemplateDirective } from './template.directive';

export type SortDirection = 'asc' | 'desc' | null;

/**
 * The table's sort state. `field` is `''` and `direction` `null` when nothing is sorted — the
 * third state of the header's asc → desc → none cycle.
 */
export interface GogTableSortEvent {
  field: string;
  direction: SortDirection;
}

/** Kept as the internal alias it has always been; `GogTableSortEvent` is the exported shape. */
type SortState = GogTableSortEvent;

export type GogTableSelectionMode = 'none' | 'single' | 'multiple';

/** Built-in defaults, used when `GOG_CONFIG.labels` doesn't supply one. */
const DEFAULT_LABELS = {
  total: 'Total',
  pagination: 'Table pagination',
  selectRow: 'Select row',
  selectAllRows: 'Select all rows on this page',
} as const;

/** Emitted by `gogRowClick`. */
export interface GogTableRowClickEvent<T> {
  row: T;
  /**
   * Index within the currently rendered page, not the whole data set — the same convention as
   * `GogColumnBodyContext.index`. `gog-table` cannot know the absolute index in `lazy` mode.
   */
  index: number;
  /**
   * The click (or the `keydown` for a keyboard activation), so a handler can tell a click on the
   * row from one on a button inside a cell — `event.target` is the element actually hit.
   */
  originalEvent: MouseEvent | KeyboardEvent;
}

@Component({
  selector: 'gog-table',
  imports: [
    SpinnerComponent,
    PaginatorComponent,
    NgTemplateOutlet,
    IconComponent,
    ScrollComponent,
    CheckboxComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-table-host',
    '[style.display]': '"block"',
    '[style.width]': 'fullWidth() ? "100%" : "fit-content"',
  },
})
export class TableComponent<T extends object> {
  /**
   * The single size modifier, replacing one `[class.gog-table--<size>]` binding per size.
   * Empty for `'lg'`: that is this component's default size and has no modifier rule of its own — every `gog-table--*` chain bottoms out at it.
   */
  protected readonly sizeClass = computed(() =>
    this.size() === 'lg' ? '' : `gog-table--${this.size()}`,
  );
  readonly value = input<T[]>([]);
  /**
   * Full width of the container by default. Set to `false` to shrink the table to fit
   * its columns' content instead.
   */
  readonly fullWidth = input(true);
  /**
   * Rows per page; `0` (the default) means no pagination at all.
   *
   * A **`model`**, not an input, so `[pageSize]="20"` still works exactly as before *and*
   * `[(pageSize)]="size"` becomes possible. That is what lets `showPageSizeSelect` work without
   * any wiring: the table binds this model straight to its own paginator's `pageSize`, the
   * select writes back through it, and a consumer who wants to observe or persist the choice
   * binds two-way. Nothing is ferried between the two components by hand.
   *
   * In `lazy` mode a change here is a refetch signal, same as `gogPageChange` — bind
   * `[(pageSize)]` and reload from it. Changing the size always returns to page 1.
   */
  readonly pageSize = model<number>(0);
  /**
   * Whether the paginator offers a rows-per-page select. Forwarded straight to `gog-paginator`;
   * unset, it falls back to `GOG_CONFIG.paginator.showPageSizeSelect`, then to `false`.
   */
  readonly showPageSizeSelect = input<boolean | undefined>(undefined);
  /**
   * The sizes that select offers. Forwarded to `gog-paginator`; unset, falls back to
   * `GOG_CONFIG.paginator.pageSizeOptions`, then to `[10, 20, 30, 40, 50]`.
   */
  readonly pageSizeOptions = input<number[] | undefined>(undefined);
  /**
   * Hands sorting and paging to the server.
   *
   * Off (the default), the table owns the whole data set: it sorts and slices `value` itself, and
   * `totalPages` comes from `value.length`. On, `value` is **the current page, already sorted** —
   * the table renders it as given and never re-orders or re-slices it. Supply `totalRecords` so
   * the paginator knows how many pages exist, and refetch in response to `gogSortChange` /
   * `gogPageChange`.
   *
   * ```html
   * <gog-table
   *   [value]="page()"
   *   [lazy]="true"
   *   [totalRecords]="total()"
   *   [pageSize]="20"
   *   [loading]="loading()"
   *   (gogSortChange)="sort.set($event); reload()"
   *   (gogPageChange)="page$.set($event); reload()"
   * />
   * ```
   */
  readonly lazy = input(false);
  /**
   * How many rows exist on the server, across all pages. `lazy` only — without it the table
   * cannot know how many pages to offer, and pagination is disabled. Ignored when `lazy` is off,
   * where `value.length` is the truth.
   */
  readonly totalRecords = input<number | null>(null);
  /**
   * Makes rows focusable and styles them as clickable, for a table whose rows navigate or open
   * something. `gogRowClick` fires on a plain click regardless; this is what makes that
   * affordance **discoverable and reachable by keyboard** (Enter and Space activate the focused
   * row), which a bare `(gogRowClick)` on a `<tr>` is not.
   *
   * If the row's action is better expressed as a control — a link to a detail page, a delete
   * button — put that in a cell instead. This is for the whole-row-is-the-target case.
   */
  readonly interactiveRows = input(false);
  /**
   * Turns on row selection. `'single'` keeps at most one row selected, `'multiple'` any number.
   *
   * The selection itself is always a `T[]` (`[(selection)]`), including in `'single'` mode where
   * it holds zero or one row — one shape rather than a `T | T[] | null` union the consumer has to
   * narrow on every read.
   */
  readonly selectionMode = input<GogTableSelectionMode>('none');
  /**
   * Two-way bindable selected rows: `[(selection)]="selected"`.
   *
   * Rows are matched by `dataKey` when one is set, and by object identity otherwise — so with no
   * `dataKey`, a refetch that produces new objects drops the selection. In `lazy` mode that is
   * almost always the wrong behaviour: set `dataKey`.
   */
  readonly selection = model<T[]>([]);
  /**
   * Field name (or dot-path) uniquely identifying a row — `'id'` in most data sets.
   *
   * Used for selection identity and, when set, as the `@for` track key, which is what lets the
   * DOM survive a re-fetch of the same page instead of being torn down and rebuilt.
   */
  readonly dataKey = input('');
  /**
   * Whether the checkbox column renders. On by default once `selectionMode` is set; turn it off
   * for a table that selects by clicking the row itself, and pair it with `interactiveRows` so
   * that stays reachable by keyboard.
   */
  readonly showSelectionColumn = input(true);
  readonly showRowNumbers = input<boolean>(true);
  readonly showTotal = input<boolean>(false);
  readonly emptyPlaceholder = input<string>('-');
  /** Alignment of pagination controls */
  readonly paginatorPosition = input<'left' | 'center' | 'right'>('center');
  /** Alignment of total count label (only when showTotal=true) */
  readonly totalPosition = input<'left' | 'right' | 'opposite'>('opposite');
  /** Show loading spinner instead of rows */
  readonly loading = input<boolean>(false);
  /** Show vertical borders between columns */
  readonly showColumnBorders = input<boolean>(false);
  /** Stick header row to the top of the viewport while scrolling */
  readonly stickyHeader = input<boolean>(false);
  /** Row density: lg (default) / md (compact) / sm (dense) */
  readonly size = input<GogSize>('lg');

  /**
   * Fires when a header cell changes the sort — including the third click that clears it, which
   * emits `{ field: '', direction: null }`. In `lazy` mode this is the refetch signal; the table
   * has already reset to page 1 by the time it fires.
   */
  readonly gogSortChange = output<GogTableSortEvent>();
  /**
   * Fires when the page changes, with the new 1-based page. Only ever fires for a *user* action
   * or a clamp — not for the initial render.
   */
  readonly gogPageChange = output<number>();
  /** Fires when a row is clicked, or activated with Enter/Space when `interactiveRows` is on. */
  readonly gogRowClick = output<GogTableRowClickEvent<T>>();

  readonly columns = contentChildren(GogColumn);
  readonly templates = contentChildren(TemplateDirective);

  readonly sortState = signal<SortState>({ field: '', direction: null });

  /**
   * In `lazy` mode `value` is the server's answer — already sorted, already the right page — so
   * both this and `visibleRows` become pass-throughs. Re-sorting it locally would reorder one
   * page against a global ordering, which looks like corruption rather than a bug.
   */
  readonly sortedData = computed(() => {
    if (this.lazy()) return this.value();

    const { field, direction } = this.sortState();
    const rows = [...this.value()];
    if (!field || !direction) return rows;

    const compare =
      this.columns()
        .find((col) => col.field() === field)
        ?.comparator() ?? defaultCompare;

    return rows.sort((a, b) => {
      const av = getByPath(a, field);
      const bv = getByPath(b, field);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = compare(av, bv);
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  /**
   * How many rows the paginator is dividing. `value.length` normally; `totalRecords` in `lazy`
   * mode, where `value` is only the current page. Also what `showTotal` reports.
   */
  readonly rowCount = computed(() =>
    this.lazy() ? Math.max(0, this.totalRecords() ?? 0) : this.value().length,
  );

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.rowCount() / size));
  });

  /**
   * Resets to page 1 whenever the sort changes (a new sort re-orders the whole data set,
   * so whatever page the user was on no longer means anything) and clamps down to
   * `totalPages` whenever the data set or page size shrinks — but otherwise preserves
   * wherever the paginator navigated to. `gog-paginator`'s own `page` model additionally
   * self-clamps against `totalPages` on its own, so this only has to handle the reset case.
   */
  readonly currentPage = linkedSignal<
    { total: number; sortState: SortState; pageSize: number },
    number
  >({
    source: () => ({
      total: this.totalPages(),
      sortState: this.sortState(),
      pageSize: this.pageSize(),
    }),
    computation: (src, previous) => {
      if (!previous) return 1;
      // A new sort re-orders everything, and a new page size redraws the boundaries — in both
      // cases the page the user was on no longer denotes the same rows.
      if (previous.source.sortState !== src.sortState) return 1;
      if (previous.source.pageSize !== src.pageSize) return 1;
      return Math.min(Math.max(1, previous.value), src.total);
    },
  });

  /** In `lazy` mode the server already sliced the page — see `sortedData`. */
  readonly visibleRows = computed(() => {
    const size = this.pageSize();
    if (this.lazy() || !size) return this.sortedData();
    const page = this.currentPage();
    const start = (page - 1) * size;
    return this.sortedData().slice(start, start + size);
  });

  /**
   * Resolved the same way `gog-paginator` resolves it, because the footer's own visibility
   * depends on it — see `hasPagination`.
   */
  protected readonly showsPageSizeSelect = computed(() =>
    resolveConfigured(
      this.showPageSizeSelect(),
      this.globalConfig.paginator?.showPageSizeSelect,
      false,
    ),
  );

  /**
   * Normally the paginator only earns its space once there is more than one page — but the
   * rows-per-page select lives inside it, and hiding the whole thing at one page would strand the
   * user on whatever size produced that single page with no way back to a smaller one.
   */
  readonly hasPagination = computed(
    () =>
      !this.loading() &&
      this.pageSize() > 0 &&
      (this.totalPages() > 1 || this.showsPageSizeSelect()),
  );

  private readonly globalConfig = inject(GOG_CONFIG);

  /** `GOG_CONFIG.labels` → the built-in English defaults. No per-instance inputs: these name
   * table chrome, and an app that relabels them does so once. */
  protected readonly resolvedLabels = computed(() => {
    const configured = this.globalConfig.labels ?? {};
    return {
      total: resolveConfigured(undefined, configured.total, DEFAULT_LABELS.total),
      pagination: resolveConfigured(
        undefined,
        configured.tablePagination,
        DEFAULT_LABELS.pagination,
      ),
      selectRow: resolveConfigured(undefined, configured.selectRow, DEFAULT_LABELS.selectRow),
      selectAllRows: resolveConfigured(
        undefined,
        configured.selectAllRows,
        DEFAULT_LABELS.selectAllRows,
      ),
    };
  });

  protected readonly hasSelection = computed(() => this.selectionMode() !== 'none');
  protected readonly hasSelectionColumn = computed(
    () => this.hasSelection() && this.showSelectionColumn(),
  );

  readonly emptyColspan = computed(
    () =>
      this.columns().length + (this.showRowNumbers() ? 1 : 0) + (this.hasSelectionColumn() ? 1 : 0),
  );

  /**
   * Identity for selection and `@for` tracking. `dataKey`'s value when set, the row object
   * otherwise — the object works for a static data set and breaks the moment rows are re-fetched,
   * which is exactly what `dataKey` is for.
   */
  protected rowKey(row: T): unknown {
    const key = this.dataKey();
    return key ? getByPath(row, key) : row;
  }

  protected isSelected(row: T): boolean {
    const key = this.rowKey(row);
    return this.selection().some((selected) => this.rowKey(selected) === key);
  }

  /** All rows on the current page are selected — drives the header checkbox. */
  protected readonly allPageRowsSelected = computed(() => {
    const rows = this.visibleRows();
    return rows.length > 0 && rows.every((row) => this.isSelected(row));
  });

  /** Some but not all — the header checkbox's indeterminate state. */
  protected readonly somePageRowsSelected = computed(() => {
    const rows = this.visibleRows();
    return rows.some((row) => this.isSelected(row)) && !this.allPageRowsSelected();
  });

  protected toggleRowSelection(row: T, selected: boolean): void {
    if (this.selectionMode() === 'single') {
      this.selection.set(selected ? [row] : []);
      return;
    }

    const key = this.rowKey(row);
    const without = this.selection().filter((entry) => this.rowKey(entry) !== key);
    this.selection.set(selected ? [...without, row] : without);
  }

  /**
   * Header checkbox: selects or clears **the current page**, not the whole data set. Anything
   * else would be a lie in `lazy` mode, where the table has never seen the other pages — and
   * inconsistent between the two modes, which is worse than either behaviour alone.
   */
  protected toggleAllOnPage(selected: boolean): void {
    const rows = this.visibleRows();
    const pageKeys = new Set(rows.map((row) => this.rowKey(row)));
    const offPage = this.selection().filter((entry) => !pageKeys.has(this.rowKey(entry)));

    this.selection.set(selected ? [...offPage, ...rows] : offPage);
  }

  constructor() {
    /*
     * `gogPageChange` for user navigation and clamps, but *not* for the reset that follows a new
     * sort: `currentPage` snapping back to 1 there is part of the sort, and a lazy consumer
     * refetching from both events would fire two requests for one user action. Detected by the
     * sort having changed in the same computation, and skipped.
     */
    let previous: { page: number; sort: SortState; size: number } | null = null;
    effect(() => {
      const page = this.currentPage();
      const sort = this.sortState();
      const size = this.pageSize();
      const causedByOther = previous && (previous.sort !== sort || previous.size !== size);
      if (previous && previous.page !== page && !causedByOther) {
        this.gogPageChange.emit(page);
      }
      previous = { page, sort, size };
    });

    effect(() => {
      if (!isDevMode() || !this.lazy() || this.pageSize() <= 0) return;
      if (this.totalRecords() === null) {
        console.warn(
          "[gog-table] `lazy` with a `pageSize` but no `totalRecords`: the table cannot know how many pages exist, so pagination stays hidden. Pass the server's total row count.",
        );
      }
    });
  }

  /**
   * A `gogColumnBody` template declared inside the column wins; the string-keyed
   * `<ng-template template="field" type="body">` is the deprecated fallback.
   */
  getBodyTemplate(col: GogColumn): TemplateRef<unknown> | null {
    return (
      (col.bodyTemplate()?.templateRef as TemplateRef<unknown> | undefined) ??
      this.bodyTemplateMap().get(col.field()) ??
      null
    );
  }

  getHeaderTemplate(col: GogColumn): TemplateRef<unknown> | null {
    return (
      (col.headerTemplate()?.templateRef as TemplateRef<unknown> | undefined) ??
      this.headerTemplateMap().get(col.field()) ??
      null
    );
  }

  /** Context for a `gogColumnBody` template — see `GogColumnBodyContext`. */
  bodyContext(row: T, col: GogColumn, index: number): GogColumnBodyContext<T> {
    return { $implicit: row, row, index, value: this.getCellValue(row, col.field()) };
  }

  /** Context for a `gogColumnHeader` template — see `GogColumnHeaderContext`. */
  headerContext(col: GogColumn): GogColumnHeaderContext {
    return { $implicit: col.header(), field: col.field() };
  }

  /**
   * Cycles the clicked column asc → desc → unsorted, and emits the result. The emit is last, so
   * a `lazy` consumer refetching from it already sees `currentPage` reset to 1.
   */
  toggleSort(col: GogColumn): void {
    if (!col.sortable()) return;
    const cur = this.sortState();
    const field = col.field();
    if (cur.field !== field) {
      this.sortState.set({ field, direction: 'asc' });
    } else if (cur.direction === 'asc') {
      this.sortState.set({ field, direction: 'desc' });
    } else {
      this.sortState.set({ field: '', direction: null });
    }
    this.gogSortChange.emit(this.sortState());
  }

  /** Click, or Enter/Space on a focused row when `interactiveRows` is on. */
  protected emitRowClick(row: T, index: number, originalEvent: MouseEvent | KeyboardEvent): void {
    this.gogRowClick.emit({ row, index, originalEvent });
  }

  /** Enter and Space activate the focused row; Space must not also scroll the page. */
  protected onRowKeydown(row: T, index: number, event: KeyboardEvent): void {
    if (!this.interactiveRows()) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.emitRowClick(row, index, event);
  }

  getSortDirection(field: string): SortDirection {
    const s = this.sortState();
    return s.field === field ? s.direction : null;
  }

  getAriaSort(field: string): 'ascending' | 'descending' | null {
    const direction = this.getSortDirection(field);
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return null;
  }

  handleSortClick(col: GogColumn): void {
    if (!this.loading()) this.toggleSort(col);
  }

  getCellValue(row: T, field: string): unknown {
    return getByPath(row, field);
  }

  formatCellValue(row: T, field: string): string {
    const value = this.getCellValue(row, field);
    return value == null ? this.emptyPlaceholder() : String(value);
  }

  globalRowIndex(localIndex: number): number {
    const size = this.pageSize();
    if (!size) return localIndex + 1;
    return (this.currentPage() - 1) * size + localIndex + 1;
  }

  /** CSS grid-area for the total label: left slot or right slot */
  readonly totalGridArea = computed(() => {
    const totalPos = this.totalPosition();
    const paginatorPos = this.paginatorPosition();
    if (totalPos === 'opposite') return paginatorPos === 'right' ? 'left' : 'right';
    return totalPos;
  });

  /** CSS grid-area for the pagination block */
  readonly paginatorGridArea = computed(() => this.paginatorPosition());

  private readonly bodyTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const t of this.templates()) {
      if (t.type() === 'body') map.set(t.template(), t.templateRef);
    }
    return map;
  });

  private readonly headerTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const t of this.templates()) {
      if (t.type() === 'header') map.set(t.template(), t.templateRef);
    }
    return map;
  });
}
