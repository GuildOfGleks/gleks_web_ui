import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  GogPanelHeaderDirective,
  GogSize,
  GogTableRowClickEvent,
  GogTableSortEvent,
  GogTagVariant,
  PanelComponent,
  TableComponent,
  TagComponent,
} from '@guildofgleks/ui';

interface DemoRow {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

/** A row of the fake "server" data set behind the lazy demo. */
interface ServerRow {
  id: number;
  name: string;
  team: string;
  score: number;
}

interface SparseRow {
  component: string;
  owner: string | null;
}

const STATUS_VARIANTS: Record<string, GogTagVariant> = {
  Ready: 'success',
  'In review': 'warning',
  Planned: 'info',
};

/**
 * Stands in for a backend: 137 rows that only ever leave this module one page at a time. Sorting
 * and slicing happen *here*, which is the point — `gog-table` in `lazy` mode must not re-order or
 * re-slice what it is handed.
 */
const SERVER_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  name: `Record ${String(i + 1).padStart(3, '0')}`,
  team: ['Design', 'Forms', 'Data', 'Navigation'][i % 4],
  score: ((i * 37) % 100) + 1,
}));

@Component({
  selector: 'app-table-page',
  imports: [
    ButtonComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    GogPanelHeaderDirective,
    PanelComponent,
    TableComponent,
    TagComponent,
  ],
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePage implements OnDestroy {
  protected readonly rows: DemoRow[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation', updated: 'This week' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  ];

  /**
   * Long enough that a capped table has something to scroll, and wide enough that the horizontal
   * scroller activates — which is the combination `stickyHeader` used to fail on.
   */
  protected readonly tallRows: DemoRow[] = Array.from({ length: 24 }, (_, i) => ({
    component: `Component ${i + 1} with a deliberately long name`,
    status: i % 3 === 0 ? 'Ready' : i % 3 === 1 ? 'In review' : 'Planned',
    owner: ['Design', 'Forms', 'Data', 'Navigation', 'Feedback'][i % 5],
    updated: `${i + 1} days ago`,
  }));

  protected readonly loading = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Lazy demo ──────────────────────────────────────────────────────────────────────────────
  /** A `signal`, because the table's `pageSize` is a `model` the select writes back into. */
  protected readonly serverPageSize = signal(10);
  protected readonly serverRows = signal<ServerRow[]>([]);
  protected readonly serverTotal = signal(SERVER_ROWS.length);
  protected readonly serverLoading = signal(false);
  protected readonly serverSelection = signal<ServerRow[]>([]);
  protected readonly lastServerQuery = signal('page 1, unsorted');
  private serverPage = 1;
  private serverSort: GogTableSortEvent = { field: '', direction: null };
  private serverTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.fetchPage();
  }

  protected onServerSort(sort: GogTableSortEvent): void {
    this.serverSort = sort;
    // The table has already reset itself to page 1 by the time this fires.
    this.serverPage = 1;
    this.fetchPage();
  }

  protected onServerPage(page: number): void {
    this.serverPage = page;
    this.fetchPage();
  }

  /**
   * In lazy mode a new page size is a refetch, exactly like a new page. The table has already
   * returned to page 1 by the time this fires, so there is no separate `gogPageChange` to handle.
   */
  protected onServerPageSize(size: number): void {
    this.serverPageSize.set(size);
    this.serverPage = 1;
    this.fetchPage();
  }

  protected onServerRowClick(event: GogTableRowClickEvent<ServerRow>): void {
    this.lastServerQuery.set(`clicked ${event.row.name} (row ${event.index + 1} on this page)`);
  }

  /** The "request": sort the whole set, cut out the page, answer after a short delay. */
  private fetchPage(): void {
    this.serverLoading.set(true);
    if (this.serverTimer) clearTimeout(this.serverTimer);

    const { field, direction } = this.serverSort;
    this.lastServerQuery.set(
      `page ${this.serverPage}` + (direction ? `, sorted by ${field} ${direction}` : ', unsorted'),
    );

    this.serverTimer = setTimeout(() => {
      const sorted = [...SERVER_ROWS];
      if (field && direction) {
        sorted.sort((a, b) => {
          const av = a[field as keyof ServerRow];
          const bv = b[field as keyof ServerRow];
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return direction === 'asc' ? cmp : -cmp;
        });
      }

      const size = this.serverPageSize();
      const start = (this.serverPage - 1) * size;
      this.serverRows.set(sorted.slice(start, start + size));
      this.serverTotal.set(sorted.length);
      this.serverLoading.set(false);
    }, 350);
  }

  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly size = signal<GogSize>('lg');

  protected readonly paginatorPositions: ('left' | 'center' | 'right')[] = [
    'left',
    'center',
    'right',
  ];
  protected readonly paginatorPosition = signal<'left' | 'center' | 'right'>('center');

  protected readonly stickyHeader = signal(false);
  protected readonly showEmpty = signal(false);

  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
    { component: 'Table', owner: null },
  ];

  protected statusVariant(status: string): GogTagVariant {
    return STATUS_VARIANTS[status] ?? 'info';
  }

  protected toggleLoading(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }

    this.loading.set(true);
    this.loadingTimer = setTimeout(() => {
      this.loading.set(false);
      this.loadingTimer = null;
    }, 1200);
  }

  protected toggleStickyHeader(): void {
    this.stickyHeader.update((value) => !value);
  }

  protected toggleEmpty(): void {
    this.showEmpty.update((value) => !value);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
    if (this.serverTimer) {
      clearTimeout(this.serverTimer);
    }
  }
}
