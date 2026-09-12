import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
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
  untracked,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../icon/icon.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { ScrollComponent } from '../scroll/scroll.component';
import { SpinnerComponent } from '../spinner/spinner.component';

import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogSize } from '../../shared/types';
import { getByPath } from '../../shared/option-accessor';
import { resolveCssLengthPx } from '../../shared/dropdown-position';
import { GogVariableWindow } from '../../shared/variable-window';
import {
  GogColumn,
  type GogColumnBodyContext,
  type GogColumnHeaderContext,
  defaultCompare,
} from './column';

/**
 * Row height assumed before any row has been measured, for `virtualize`. A seed, not a claim: the
 * first rendered row replaces it. See `docs/table-virtualization.md`.
 */
const FALLBACK_ROW_HEIGHT = 40;

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
    /*
     * While loading, the body is a single cell holding a spinner and the header is dimmed and
     * inert — so the table has no rows to announce and nothing saying more are coming. Required
     * of every `loading` input; see the loading-state rule in `api-design.instructions.md`.
     */
    '[attr.aria-busy]': 'loading() ? "true" : null',
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
  /**
   * Stick the header row to the top of the table's own scroll viewport.
   *
   * **Needs `maxHeight` to be reliable.** A sticky element resolves against its nearest scroll
   * container, and the table wraps itself in a `gog-scroll`; the moment that scroller starts
   * scrolling sideways it is a scroll container on both axes — CSS coerces `overflow-y: visible`
   * to `auto` beside a scrolling `overflow-x`, and `clip` to `hidden`, so there is no value that
   * scrolls one axis and stays out of the sticky chain on the other. Without `maxHeight` that
   * viewport is exactly as tall as its content and never scrolls vertically, so a header pinned
   * to it rides out of view along with everything else.
   *
   * With `maxHeight` set the viewport is the vertical scrollport, and the header pins to it.
   */
  readonly stickyHeader = input<boolean>(false);
  /**
   * Caps the table's own scroll viewport, in any CSS length — `'420px'`, `'60vh'`. The table then
   * owns its vertical scrolling instead of growing to its content and letting an ancestor scroll
   * it, which is what makes `stickyHeader` work (see above).
   *
   * An input rather than a `--gog-table-*` token, even though the value only ever lands in CSS:
   * it also decides whether the internal scroller handles the vertical axis at all. A capped
   * viewport has to scroll vertically; an uncapped one must *not* become a scroll container,
   * because that would put every table in the sticky chain of its own descendants and take the
   * consumer's own scrolling region out of it. That is behaviour, not appearance.
   *
   * `null` leaves the table exactly as it was: viewport at content height, vertical axis inert.
   */
  readonly maxHeight = input<string | null>(null);
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

  // ── Windowing ────────────────────────────────────────────────────────────────
  //
  // See `docs/table-virtualization.md`. `GogVariableWindow` rather than the dropdowns'
  // `GogVirtualWindow`, because a table row's height cannot be pinned: `height` on a `<tr>` or a
  // `<td>` is a *minimum* in table layout, so a cell whose content wraps makes its row taller and
  // nothing in CSS can stop it. Measured: one cell from 40 to 600 characters went 39px to 173.75px
  // with its column width unchanged.

  /**
   * Renders only the rows in view instead of all of them.
   *
   * **Requires `maxHeight` and `fullWidth`**, and does nothing without them — with a dev-mode
   * warning saying which is missing, rather than half-working:
   *
   * - Without `maxHeight` the table's scroller is exactly as tall as its content and never scrolls
   *   vertically, so there is no viewport to compute a window from. This is the same constraint
   *   `stickyHeader` already documents.
   * - `fullWidth="false"` means `table-layout: auto`, and the browser then sizes columns from the
   *   cells that are *present*. Measured: rendering 2 of 24 rows moved columns by up to 7.8px, so
   *   a windowed table would shift its own columns as you scroll.
   *
   * What it changes while it is on, beyond speed: `Ctrl+F` finds only the rendered rows, CSS
   * targeting `:last-child` matches the last rendered one, and — with `interactiveRows` — scrolling
   * a focused row out of view moves focus to the scroll region, because the row it was on no longer
   * exists. `aria-rowcount` and `aria-rowindex` keep the announced count and position honest.
   *
   * Not a substitute for `[lazy]` and not substituted by it: `lazy` keeps the *fetch* small and
   * still stamps every row it is handed.
   *
   * @default false
   */
  readonly virtualize = input(false);

  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly ownDestroyRef = inject(DestroyRef);

  /** The scroller's real geometry, fed from `gog-scroll`'s own `(gogScroll)`. */
  private readonly viewport = signal<{ scrollTop: number; height: number }>({
    scrollTop: 0,
    height: 0,
  });

  /**
   * What to assume for a row that has never been rendered.
   *
   * Seeded from `maxHeight` is impossible — that is the viewport, not a row — so it starts at a
   * constant and is replaced by the first row actually measured. A seed, not a claim: it governs
   * only the frames before any row has rendered, and being wrong there costs one re-render rather
   * than a drifting scroll position.
   */
  private readonly estimatedRowHeight = signal(FALLBACK_ROW_HEIGHT);

  /** Windowing is on only when it can be correct — see `virtualize`. */
  protected readonly windowingActive = computed(
    () => this.virtualize() && !!this.maxHeight() && this.fullWidth() && !this.loading(),
  );

  /**
   * `maxHeight` resolved to px, as the viewport's stand-in until `gog-scroll` reports a real one.
   *
   * A computed rather than a value seeded on open, which is what this was first written as and is
   * wrong for a reason worth keeping: a component's constructor runs before its inputs are set, so
   * a seed taken there reads `maxHeight` as `null` and the first frame renders the whole table —
   * exactly the frame the seed exists to prevent.
   */
  private readonly maxHeightPx = computed(() => {
    if (!this.isBrowser) return 0;
    const max = this.maxHeight();
    if (!max) return 0;
    return resolveCssLengthPx(max, window.innerHeight) ?? 0;
  });

  private readonly rowWindow = new GogVariableWindow({
    count: computed(() => this.visibleRows().length),
    estimatedRowHeight: this.estimatedRowHeight,
    viewportHeight: computed(() => {
      const reported = this.viewport().height;
      return reported > 0 ? reported : this.maxHeightPx();
    }),
    scrollTop: computed(() => this.viewport().scrollTop),
  });

  protected readonly rowRange = computed(() =>
    this.windowingActive() ? this.rowWindow.range() : { start: 0, end: this.visibleRows().length },
  );

  /**
   * What the template loops over. The same array instance as `visibleRows()` when not windowing,
   * so nothing re-renders for the sake of a slice that changed nothing.
   */
  protected readonly renderedRows = computed(() => {
    const all = this.visibleRows();
    const { start, end } = this.rowRange();
    return start === 0 && end === all.length ? all : all.slice(start, end);
  });

  /** Filler above and below the rendered rows, as `<tr>` heights. */
  protected readonly padBefore = computed(() =>
    this.windowingActive() ? this.rowWindow.padBefore() : 0,
  );
  protected readonly padAfter = computed(() =>
    this.windowingActive() ? this.rowWindow.padAfter() : 0,
  );

  /**
   * A rendered row's index **within the page**, which is what every index this component hands out
   * has always meant.
   *
   * Three places read it and all three would have changed meaning silently under a window:
   * `gogRowClick`'s `index` (public API, documented as the index within the page), the
   * `showRowNumbers` column, and `GogColumnBodyContext.index` in every consumer's cell template.
   * The same trap `gog-autocomplete`'s option id hit one iteration earlier.
   */
  protected rowIndexOf(renderedIndex: number): number {
    return this.rowRange().start + renderedIndex;
  }

  /** Total rows the grid claims, header included — `null` when every row is present anyway. */
  protected readonly ariaRowCount = computed(() =>
    this.windowingActive() ? this.visibleRows().length + 1 : null,
  );

  /** 1-based position of a rendered row in the grid, header being row 1. */
  protected ariaRowIndex(renderedIndex: number): number | null {
    return this.windowingActive() ? this.rowIndexOf(renderedIndex) + 2 : null;
  }

  /** `(gogScroll)` on the table's own scroller. */
  protected onTableScroll(metrics: { scrollTop: number; clientHeight: number }): void {
    this.viewport.update((viewport) => ({
      scrollTop: metrics.scrollTop,
      // A zero is "not laid out yet", not "no viewport" -- the scroller's first emission can land
      // before the table has a height, and believing it renders every row for a frame.
      height: metrics.clientHeight > 0 ? metrics.clientHeight : viewport.height,
    }));
    this.releaseFocusLeavingTheWindow();
  }

  /**
   * With `interactiveRows`, every row is a tab stop. A row scrolled out of the window is
   * unmounted, and an unmounted element holding focus drops it on `<body>` -- where the arrow keys
   * scroll the page instead of the table.
   *
   * Focus goes to the scroll region instead, which `gog-scroll` already makes a tab stop
   * (`role="region"`, `tabindex="0"`) and which is where scrolling is driven from anyway.
   *
   * Runs after the viewport signal moves, so `rowRange()` is already the new range -- and before
   * the re-render, so the row still exists to be recognised. After the unmount there is nothing
   * left to ask whether it held focus.
   */
  private releaseFocusLeavingTheWindow(): void {
    if (!this.isBrowser || !this.windowingActive() || !this.interactiveRows()) return;

    const host = this.elRef.nativeElement as HTMLElement;
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !host.contains(focused)) return;
    if (!focused.classList.contains('gog-table__row')) return;

    const index = Number(focused.dataset['gogRowIndex']);
    if (!Number.isFinite(index)) return;

    const { start, end } = this.rowRange();
    if (index >= start && index < end) return;

    host.querySelector<HTMLElement>('.gog-scroll__viewport')?.focus();
  }

  /**
   * Reads the rendered rows and tells the window what they really measured.
   *
   * The return value is the part that matters and the part the arithmetic does not make obvious:
   * correcting a row *above* the viewport moves everything below it, under the reader, while they
   * are scrolling. Adding that delta to the scroller holds the visible rows still.
   */
  private measureRenderedRows(): void {
    if (!this.isBrowser || !this.windowingActive()) return;

    const host = this.elRef.nativeElement as HTMLElement;
    const rows = Array.from(
      host.querySelectorAll<HTMLElement>('tbody .gog-table__row[data-gog-row-index]'),
    );
    if (rows.length === 0) return;

    const heights = new Map<number, number>();
    for (const row of rows) {
      const index = Number(row.dataset['gogRowIndex']);
      const height = row.getBoundingClientRect().height;
      if (!Number.isFinite(index) || height <= 0) continue;
      heights.set(index, height);
    }
    if (heights.size === 0) return;

    /*
     * The first batch of rendered rows replaces the constant seed, so every row nobody has looked
     * at is estimated from this table's own geometry rather than from a number in this file.
     *
     * **The median of the batch, not its first row.** Taking row 0 was the first version and it is
     * wrong wherever the tall rows are not evenly spread: the showcase's own demo makes every
     * seventh row wrap, row 0 among them, so the estimate came out 65% high and all 10 000 rows
     * were sized from the one row that least resembles them. The median is the row a reader would
     * point at and say "that is what a row looks like here".
     *
     * Seeded once and then held. An estimate that keeps moving re-sizes every unmeasured row above
     * the viewport, and *that* shift is invisible to `applyMeasurements` — it is not a measurement
     * — so it would move the content under the reader with no delta to correct it.
     */
    if (!this.rowHeightSeeded) {
      const sorted = [...heights.values()].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      this.rowHeightSeeded = true;
      if (median > 0 && Math.abs(this.estimatedRowHeight() - median) > 0.5) {
        this.estimatedRowHeight.set(median);
      }
    }

    const delta = this.rowWindow.applyMeasurements(heights);
    if (delta === 0) return;

    const viewportEl = host.querySelector<HTMLElement>('.gog-scroll__viewport');
    if (viewportEl) viewportEl.scrollTop = viewportEl.scrollTop + delta;
    this.viewport.update((viewport) => ({ ...viewport, scrollTop: viewport.scrollTop + delta }));
  }

  private rowHeightSeeded = false;
  private measureFrame: number | null = null;

  private scheduleRowMeasure(): void {
    if (!this.isBrowser || this.measureFrame !== null) return;
    this.measureFrame = requestAnimationFrame(() => {
      this.measureFrame = null;
      this.measureRenderedRows();
    });
  }

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

    /*
     * `virtualize` needs both, and does nothing without either, so say which is missing rather
     * than let a consumer conclude the input is broken. Both are hard requirements for reasons
     * measured in `docs/table-virtualization.md`, not preferences.
     */
    effect(() => {
      if (!isDevMode() || !this.virtualize()) return;
      if (!this.maxHeight()) {
        console.warn(
          '[gog-table] `virtualize` needs `maxHeight`: without it the table never scrolls vertically on its own, so there is no viewport to window against. Windowing is off.',
        );
      }
      if (!this.fullWidth()) {
        console.warn(
          '[gog-table] `virtualize` needs `fullWidth`: `fullWidth="false"` lays the table out with `table-layout: auto`, which sizes columns from the rows that are rendered — so a windowed table would move its own columns as you scroll. Windowing is off.',
        );
      }
    });

    /*
     * Measure after every render that changes what is on screen. This converges rather than
     * looping: `applyMeasurements` writes nothing when the rows measure what it already believed,
     * so the effect stops re-triggering itself as soon as the window is telling the truth.
     */
    effect(() => {
      this.renderedRows();
      this.rowRange();
      if (this.windowingActive()) this.scheduleRowMeasure();
    });

    /*
     * A cached height belongs to a row, and these are the four things that change which rows the
     * indices refer to. Keeping the measurements across a sort would place the new rows using the
     * old rows' heights — which is not a small error, because sorting is exactly what moves a tall
     * row from the bottom of the list to the top.
     */
    effect(() => {
      this.value();
      this.sortState();
      this.currentPage();
      this.pageSize();
      /*
       * `untracked` is load-bearing, and it took a live session to see why.
       *
       * `reset()` *reads* the window's measurement signal to decide whether it has anything to
       * clear. Called bare inside this effect, that read becomes one of the effect's dependencies
       * — so measuring wrote the signal, this effect re-ran, and it cleared the measurements that
       * had just been taken. A ping-pong, and the table ran on the estimate for ever while looking
       * entirely correct: the rows were right, the heights were right, and only the scroll height
       * was quietly the estimate times the row count.
       *
       * The four reads above are the intended dependencies. Anything this effect *does* is not.
       */
      untracked(() => {
        this.rowWindow.reset();
        this.rowHeightSeeded = false;
      });
    });

    this.ownDestroyRef.onDestroy(() => {
      if (this.measureFrame !== null) cancelAnimationFrame(this.measureFrame);
    });
  }

  /** The `gogColumnBody` template declared inside the column, if it has one. */
  getBodyTemplate(col: GogColumn): TemplateRef<unknown> | null {
    return (col.bodyTemplate()?.templateRef as TemplateRef<unknown> | undefined) ?? null;
  }

  /** The `gogColumnHeader` template declared inside the column, if it has one. */
  getHeaderTemplate(col: GogColumn): TemplateRef<unknown> | null {
    return (col.headerTemplate()?.templateRef as TemplateRef<unknown> | undefined) ?? null;
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
}
