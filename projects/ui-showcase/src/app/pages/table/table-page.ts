import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CheckboxComponent, TagComponent, type GogSize } from '@guildofgleks/ui';
import {
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  TableComponent,
  type GogTableRowClickEvent,
  type GogTableSortEvent,
} from '@guildofgleks/ui/table';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';
import { TABLE_SCOPE_CONFIG, TableConfigScope } from './table-config-scope';
import {
  MANY_ROWS,
  ROWS,
  SERVER_ROWS,
  STATUS_VARIANTS,
  TALL_ROWS,
  type DemoRow,
  type ServerRow,
} from './table-data';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface A11yRow {
  readonly name: string;
  readonly target: string;
}

@Component({
  selector: 'app-table-page',
  imports: [
    JsonPipe,
    CheckboxComponent,
    TagComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    TableComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
    TableConfigScope,
  ],
  templateUrl: './table-page.html',
  styleUrl: './table-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePage {
  protected readonly rows = ROWS;
  protected readonly tallRows = TALL_ROWS;
  protected readonly manyRows = MANY_ROWS;
  protected readonly firstRows = ROWS.slice(0, 3);
  protected readonly noRows: DemoRow[] = [];
  protected readonly statusVariants = STATUS_VARIANTS;

  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly states: readonly Labelled<'rest' | 'loading' | 'empty'>[] = [
    { name: 'rest', value: 'rest' },
    { name: '[loading]="true"', value: 'loading' },
    { name: '[value]="[]"', value: 'empty' },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['table'] as const;

  protected readonly lastSort = signal('none yet');
  protected readonly byLength = (a: unknown, b: unknown): number =>
    String(a).length - String(b).length;

  protected readonly picked = signal<DemoRow[]>([]);
  protected readonly single = signal<DemoRow[]>([]);
  protected readonly clicked = signal('none yet');
  protected readonly names = (rows: readonly DemoRow[]): string =>
    rows.map((row) => row.component).join(', ') || 'nothing';

  protected readonly virtualizeRows = signal(true);

  // A fake server for the lazy table.
  protected readonly serverPageSize = signal(10);
  protected readonly serverRows = signal<ServerRow[]>([]);
  protected readonly serverTotal = signal(SERVER_ROWS.length);
  protected readonly serverLoading = signal(false);
  protected readonly serverSelection = signal<ServerRow[]>([]);
  protected readonly lastQuery = signal('page 1, unsorted');
  private serverPage = 1;
  private serverSort: GogTableSortEvent = { field: '', direction: null };
  private serverTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly selectedCount = computed(() => this.serverSelection().length);

  protected readonly scopeConfig = TABLE_SCOPE_CONFIG;
  protected readonly scopeAxis = ['outside scope', 'inside scope'] as const;

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'the table', target: 'table' },
    { name: 'a sortable header', target: 'th.gog-table__th--sortable' },
    { name: 'the select-all checkbox', target: 'thead input' },
    { name: 'a selected row', target: 'tbody tr[aria-selected=true]' },
    { name: 'a row checkbox', target: 'tr[aria-selected] input' },
  ];
  protected readonly a11ySelection = signal<DemoRow[]>([ROWS[0]]);

  constructor() {
    this.fetchPage();
    inject(DestroyRef).onDestroy(() => {
      if (this.serverTimer) clearTimeout(this.serverTimer);
    });
  }

  protected onSort(event: GogTableSortEvent): void {
    this.lastSort.set(event.direction ? `${event.field} ${event.direction}` : 'cleared');
  }

  protected onRowClick(event: GogTableRowClickEvent<DemoRow>): void {
    this.clicked.set(`${event.row.component} (row ${event.index + 1})`);
  }

  protected onServerSort(sort: GogTableSortEvent): void {
    this.serverSort = sort;
    // The table has already gone back to page 1 by the time this fires.
    this.serverPage = 1;
    this.fetchPage();
  }

  protected onServerPage(page: number): void {
    this.serverPage = page;
    this.fetchPage();
  }

  protected onServerPageSize(size: number): void {
    this.serverPageSize.set(size);
    this.serverPage = 1;
    this.fetchPage();
  }

  /** The "request": sort the whole set, cut out the page, answer after a short delay. */
  private fetchPage(): void {
    this.serverLoading.set(true);
    if (this.serverTimer) clearTimeout(this.serverTimer);
    const { field, direction } = this.serverSort;
    this.lastQuery.set(
      `page ${this.serverPage}` + (direction ? `, sorted by ${field} ${direction}` : ', unsorted'),
    );
    this.serverTimer = setTimeout(() => {
      const sorted = [...SERVER_ROWS];
      if (field && direction) {
        const key = field as keyof ServerRow;
        sorted.sort((a, b) => {
          const cmp = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
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
}
