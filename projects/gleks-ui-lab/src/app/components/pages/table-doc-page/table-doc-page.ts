import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  GogTableRowClickEvent,
  GogTableSortEvent,
  GogTagVariant,
  ScrollComponent,
  TableComponent,
  TagComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { LIBRARY_VERSION } from '../../shared/library-version';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface DemoRow {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

interface SparseRow {
  component: string;
  owner: string | null;
}

/** A row of the fake "server" data set behind the lazy demo. */
interface ServerRow {
  id: number;
  name: string;
  team: string;
  score: number;
}

/**
 * Stands in for a backend: 137 rows that only ever leave this constant one page at a time.
 * Sorting and slicing happen *here*, which is the whole point — a table in `lazy` mode must not
 * re-order or re-slice what it is handed.
 */
const SERVER_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  name: `Record ${String(i + 1).padStart(3, '0')}`,
  team: ['Design', 'Forms', 'Data', 'Navigation'][i % 4],
  score: ((i * 37) % 100) + 1,
}));

const SERVER_REQUEST_DELAY_MS = 350;
const EVENT_LOG_LIMIT = 6;

const STATUS_VARIANTS: Record<string, GogTagVariant> = {
  Ready: 'success',
  'In review': 'warning',
  Planned: 'info',
};

const ROWS: DemoRow[] = [
  { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
  { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
  { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
  { component: 'Accordion', status: 'Planned', owner: 'Navigation', updated: 'This week' },
  { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  { component: 'Toast', status: 'Ready', owner: 'Feedback', updated: 'This month' },
];

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const TABLE_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'T[]',
    default: '[]',
    description: 'The row data array. In lazy mode this is the current page, already sorted.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description: 'Fills its container by default. Set false to shrink to fit its columns instead.',
  },
  {
    name: 'pageSize',
    type: 'model<number>',
    default: '0',
    description:
      'Rows per page. 0 disables pagination. A model since 21.4.0, so [(pageSize)] binds two-way — which is what lets the rows-per-page select write back with no wiring in between.',
  },
  {
    name: 'showPageSizeSelect',
    type: 'boolean | undefined',
    default: 'false',
    description:
      "Shows the paginator's rows-per-page select. Also settable app-wide via GOG_CONFIG.paginator.",
    since: '21.4.0',
  },
  {
    name: 'pageSizeOptions',
    type: 'number[] | undefined',
    default: '[10, 20, 30, 40, 50]',
    description: 'The choices that select offers. Also settable app-wide via GOG_CONFIG.paginator.',
    since: '21.4.0',
  },
  {
    name: 'lazy',
    type: 'boolean',
    default: 'false',
    description:
      'Hands sorting and paging to you: value is rendered exactly as given and treated as the current page. Needs totalRecords.',
    since: '21.4.0',
  },
  {
    name: 'totalRecords',
    type: 'number | null',
    default: 'null',
    description:
      'How many rows exist in total, for lazy mode. Without it pagination stays hidden and the table warns in dev. showTotal reports this rather than value.length.',
    since: '21.4.0',
  },
  {
    name: 'selectionMode',
    type: "'none' | 'single' | 'multiple'",
    default: "'none'",
    description: 'Turns row selection on, and whether more than one row can be held at a time.',
    since: '21.4.0',
  },
  {
    name: 'selection',
    type: 'model<T[]>',
    default: '[]',
    description:
      "Two-way bindable selected rows — always an array, including in 'single' mode where it holds zero or one row.",
    since: '21.4.0',
  },
  {
    name: 'dataKey',
    type: 'string',
    default: "''",
    description:
      'The field (or dot-path) identifying a row. Selection matches on it instead of object identity, and it becomes the @for track key. Set it whenever the data can be refetched.',
    since: '21.4.0',
  },
  {
    name: 'showSelectionColumn',
    type: 'boolean',
    default: 'true',
    description:
      'The checkbox column that appears once selection is on. Turn it off for a table that selects by row click.',
    since: '21.4.0',
  },
  {
    name: 'interactiveRows',
    type: 'boolean',
    default: 'false',
    description:
      'Makes rows focusable and styled as clickable, so Enter/Space activate the focused row. Without it gogRowClick is a mouse-only affordance.',
    since: '21.4.0',
  },
  {
    name: 'showRowNumbers',
    type: 'boolean',
    default: 'true',
    description: 'Shows a leading row-number column.',
  },
  { name: 'showTotal', type: 'boolean', default: 'false', description: 'Shows a row-count label.' },
  {
    name: 'emptyPlaceholder',
    type: 'string',
    default: "'-'",
    description: 'Fallback text for a cell whose field is null or undefined.',
  },
  {
    name: 'paginatorPosition',
    type: "'left' | 'center' | 'right'",
    default: "'center'",
    description: 'Alignment of the pagination controls.',
  },
  {
    name: 'totalPosition',
    type: "'left' | 'right' | 'opposite'",
    default: "'opposite'",
    description:
      "Alignment of the total-count label (only with showTotal). 'opposite' picks whichever side paginatorPosition isn't on.",
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner in place of rows.',
  },
  {
    name: 'showColumnBorders',
    type: 'boolean',
    default: 'false',
    description: 'Vertical borders between columns.',
  },
  {
    name: 'stickyHeader',
    type: 'boolean',
    default: 'false',
    description: 'Sticks the header row to the top of the nearest scrolling ancestor.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'lg'",
    description: 'Row density — cell padding and font size scale with it.',
  },
];

type OutputRow = Omit<ApiRow, 'default'>;

const TABLE_OUTPUTS: readonly OutputRow[] = [
  {
    name: 'gogSortChange',
    type: 'GogTableSortEvent',
    description:
      "{ field, direction } — including the third click that clears the sort, which arrives as { field: '', direction: null }.",
    since: '21.4.0',
  },
  {
    name: 'gogPageChange',
    type: 'number',
    description:
      'The new 1-based page. Deliberately silent in two cases: the first render, and the reset to page 1 that a new sort causes.',
    since: '21.4.0',
  },
  {
    name: 'gogRowClick',
    type: 'GogTableRowClickEvent<T>',
    description:
      '{ row, index, originalEvent }. index is the position within the rendered page, not the whole data set.',
    since: '21.4.0',
  },
  {
    name: 'pageSizeChange',
    type: 'number',
    description:
      "The model's own change event. In lazy mode this is the refetch signal for a new page size — it does not also emit gogPageChange.",
    since: '21.4.0',
  },
  {
    name: 'selectionChange',
    type: 'T[]',
    description: "The selection model's change event, for when you don't want the banana-box.",
    since: '21.4.0',
  },
];

const COLUMN_INPUTS: readonly ApiRow[] = [
  {
    name: 'field',
    type: 'string',
    default: 'required',
    description: 'Field name, or a dot-path into a nested property (e.g. "address.city").',
  },
  { name: 'header', type: 'string', default: "''", description: 'Header text.' },
  {
    name: 'sortable',
    type: 'boolean',
    default: 'false',
    description: 'Enables click-to-sort on the header: asc → desc → unsorted.',
  },
  {
    name: 'width',
    type: 'string',
    default: "''",
    description: 'Fixed width, e.g. "120px" or "20%".',
  },
  { name: 'minWidth', type: 'string', default: "''", description: 'Minimum width, e.g. "80px".' },
  { name: 'maxWidth', type: 'string', default: "''", description: 'Maximum width, e.g. "300px".' },
  {
    name: 'comparator',
    type: '((a: unknown, b: unknown) => number) | null',
    default: 'null',
    description:
      'Custom sort comparator for this column. Defaults to a locale-aware string compare, </> otherwise.',
  },
];

interface SlotRow {
  readonly name: string;
  readonly context: string;
  readonly description: string;
}

const COLUMN_SLOTS: readonly SlotRow[] = [
  {
    name: 'gogColumnBody',
    context: '$implicit / row (the row object), index, value',
    description:
      "Custom cell markup for this column. value is the already-resolved cell value for the column's field, so a custom cell can decorate it rather than re-derive it. index is the position within the rendered page, not the whole data set.",
  },
  {
    name: 'gogColumnHeader',
    context: "$implicit (the column's own header text), field",
    description:
      'Custom header markup for this column. The header text is handed in so a custom header can decorate it rather than restate it.',
  },
];

@Component({
  selector: 'app-table-doc-page',
  imports: [
    TableComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    TagComponent,
    ButtonComponent,
    ScrollComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './table-doc-page.html',
  styleUrl: './table-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDocPage implements OnDestroy {
  // Read from the installed package so the defect note cannot claim the wrong version.
  protected readonly libraryVersion = LIBRARY_VERSION;

  protected readonly rows = ROWS;
  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
    { component: 'Table', owner: null },
  ];

  protected readonly tableInputs = TABLE_INPUTS;
  protected readonly tableOutputs = TABLE_OUTPUTS;
  protected readonly columnInputs = COLUMN_INPUTS;
  protected readonly columnSlots = COLUMN_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'table')?.tokens ?? [];

  protected readonly loading = signal(false);
  protected readonly showEmpty = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Outputs demo ───────────────────────────────────────────────────────────────────────────
  protected readonly eventLog = signal<readonly string[]>([]);

  // ── Selection demo ─────────────────────────────────────────────────────────────────────────
  protected readonly selection = signal<DemoRow[]>([]);
  protected readonly selectionSummary = computed(() =>
    this.selection().length === 0
      ? 'Nothing selected'
      : this.selection()
          .map((row) => row.component)
          .join(', '),
  );

  // ── Rows-per-page demo ─────────────────────────────────────────────────────────────────────
  /** A `signal`, because `pageSize` is a `model` the select writes back into. */
  protected readonly rowsPerPage = signal(2);

  // ── Lazy demo ──────────────────────────────────────────────────────────────────────────────
  protected readonly serverPageSize = signal(10);
  protected readonly serverRows = signal<ServerRow[]>([]);
  protected readonly serverTotal = signal(SERVER_ROWS.length);
  protected readonly serverLoading = signal(false);
  protected readonly lastServerQuery = signal('page 1, unsorted');
  private serverPage = 1;
  private serverSort: GogTableSortEvent = { field: '', direction: null };
  private serverTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.fetchPage();
  }

  protected logEvent(message: string): void {
    this.eventLog.update((log) => [message, ...log].slice(0, EVENT_LOG_LIMIT));
  }

  protected onSortChange(sort: GogTableSortEvent): void {
    this.logEvent(
      sort.direction
        ? `gogSortChange → ${sort.field} ${sort.direction}`
        : 'gogSortChange → cleared',
    );
  }

  protected onPageChange(page: number): void {
    this.logEvent(`gogPageChange → ${page}`);
  }

  protected onRowClick(event: GogTableRowClickEvent<DemoRow>): void {
    this.logEvent(`gogRowClick → ${event.row.component} (row ${event.index + 1})`);
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
    }, SERVER_REQUEST_DELAY_MS);
  }

  protected readonly importSnippet =
    "```typescript\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TableComponent, GogColumn],\n})\n```";

  protected statusVariant(status: string): GogTagVariant {
    return STATUS_VARIANTS[status] ?? 'info';
  }

  protected readonly overviewHtml = [
    '<gog-table [value]="rows">',
    '  <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '  <gog-column field="status" header="Status" [sortable]="true"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '  <gog-column field="updated" header="Updated"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly overviewTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    'interface Row {',
    '  component: string;',
    '  status: string;',
    '  owner: string;',
    '  updated: string;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `',
    '    <gog-table [value]="rows">',
    '      <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '      <gog-column field="status" header="Status" [sortable]="true"></gog-column>',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '      <gog-column field="updated" header="Updated"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows: Row[] = [',
    "    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },",
    "    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly templatesHtml = [
    '<gog-table [value]="rows" [showRowNumbers]="false">',
    '  <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '',
    '  <gog-column field="status" header="Status">',
    '    <ng-template gogColumnHeader let-header>',
    '      <span class="status-header">{{ header }}</span>',
    '    </ng-template>',
    '    <ng-template gogColumnBody let-row let-value="value">',
    '      <gog-tag [variant]="statusVariant(row.status)" size="sm">{{ value }}</gog-tag>',
    '    </ng-template>',
    '  </gog-column>',
    '',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly templatesTs = [
    "import { Component } from '@angular/core';",
    'import {',
    '  GogColumn,',
    '  GogColumnBodyDirective,',
    '  GogColumnHeaderDirective,',
    '  GogTagVariant,',
    '  TableComponent,',
    '  TagComponent,',
    "} from '@guildofgleks/ui';",
    '',
    'const STATUS_VARIANTS: Record<string, GogTagVariant> = {',
    "  Ready: 'success',",
    "  'In review': 'warning',",
    "  Planned: 'info',",
    '};',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [',
    '    TableComponent,',
    '    GogColumn,',
    '    GogColumnBodyDirective,',
    '    GogColumnHeaderDirective,',
    '    TagComponent,',
    '  ],',
    '  template: `',
    '    <gog-table [value]="rows" [showRowNumbers]="false">',
    '      <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '',
    '      <gog-column field="status" header="Status">',
    '        <ng-template gogColumnHeader let-header>',
    '          <span class="status-header">{{ header }}</span>',
    '        </ng-template>',
    '        <ng-template gogColumnBody let-row let-value="value">',
    '          <gog-tag [variant]="statusVariant(row.status)" size="sm">{{ value }}</gog-tag>',
    '        </ng-template>',
    '      </gog-column>',
    '',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows: Row[] = [/* ... */];',
    '',
    '  protected statusVariant(status: string): GogTagVariant {',
    "    return STATUS_VARIANTS[status] ?? 'info';",
    '  }',
    '}',
  ].join('\n');
  protected readonly templatesCss = [
    '/* The header template only decorates the text — everything else about the header cell',
    '   still comes from the table. */',
    '.status-header {',
    '  color: var(--gog-accent-color);',
    '  font-weight: 600;',
    '}',
  ].join('\n');

  protected readonly paginationHtml = [
    '<gog-table [value]="rows" [pageSize]="3" [showTotal]="true" totalPosition="left">',
    '  <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '  <gog-column field="status" header="Status" [sortable]="true"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly paginationTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `',
    '    <gog-table [value]="rows" [pageSize]="3" [showTotal]="true" totalPosition="left">',
    '      <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '      <gog-column field="status" header="Status" [sortable]="true"></gog-column>',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows = [/* ... */];',
    '}',
  ].join('\n');

  protected readonly stickyHtml = [
    '<gog-scroll style="height: 260px;" ariaLabel="Table rows">',
    '  <gog-table [value]="rows" [stickyHeader]="true">',
    '    <gog-column field="component" header="Component"></gog-column>',
    '    <gog-column field="status" header="Status"></gog-column>',
    '    <gog-column field="owner" header="Owner"></gog-column>',
    '  </gog-table>',
    '</gog-scroll>',
  ].join('\n');
  protected readonly stickyTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, ScrollComponent, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn, ScrollComponent],',
    '  template: `',
    '    <gog-scroll style="height: 260px;" ariaLabel="Table rows">',
    '      <gog-table [value]="rows" [stickyHeader]="true">',
    '        <gog-column field="component" header="Component"></gog-column>',
    '        <gog-column field="status" header="Status"></gog-column>',
    '        <gog-column field="owner" header="Owner"></gog-column>',
    '      </gog-table>',
    '    </gog-scroll>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows = [/* six or more rows, so the container actually scrolls */];',
    '}',
  ].join('\n');

  protected readonly missingValuesHtml = [
    '<gog-table [value]="sparseRows" [showRowNumbers]="false" size="sm">',
    '  <gog-column field="component" header="Component"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
    '',
    '<gog-table [value]="sparseRows" [showRowNumbers]="false" emptyPlaceholder="N/A" size="sm">',
    '  <gog-column field="component" header="Component"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly missingValuesTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    'interface SparseRow {',
    '  component: string;',
    '  owner: string | null;',
    '}',
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `',
    '    <gog-table [value]="sparseRows" [showRowNumbers]="false" size="sm">',
    '      <gog-column field="component" header="Component"></gog-column>',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '    </gog-table>',
    '',
    '    <gog-table [value]="sparseRows" [showRowNumbers]="false" emptyPlaceholder="N/A" size="sm">',
    '      <gog-column field="component" header="Component"></gog-column>',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly sparseRows: SparseRow[] = [',
    "    { component: 'Buttons', owner: 'Design' },",
    "    { component: 'Checkbox', owner: null },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml = [
    '<gog-table [value]="rows" [showRowNumbers]="false" [fullWidth]="false" size="sm">',
    '  <gog-column field="component" header="Component" width="115px"></gog-column>',
    '  <gog-column field="status" header="Status" width="80px"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `',
    '    <gog-table [value]="rows" [showRowNumbers]="false" [fullWidth]="false" size="sm">',
    '      <gog-column field="component" header="Component"></gog-column>',
    '      <gog-column field="status" header="Status"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows = [/* ... */];',
    '}',
  ].join('\n');

  protected readonly loadingHtml =
    '<gog-table [value]="rows" [loading]="loading()">...</gog-table>';
  protected readonly loadingTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn, ButtonComponent],',
    '  template: `',
    '    <gog-button (gogClick)="toggleLoading()">Toggle loading</gog-button>',
    '    <gog-table [value]="rows" [loading]="loading()">',
    '      <gog-column field="component" header="Component"></gog-column>',
    '      <gog-column field="status" header="Status"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly loading = signal(false);',
    '  protected readonly rows = [/* ... */];',
    '',
    '  protected toggleLoading(): void {',
    '    this.loading.set(true);',
    '    setTimeout(() => this.loading.set(false), 1200);',
    '  }',
    '}',
  ].join('\n');

  protected readonly emptyHtml = '<gog-table [value]="showEmpty() ? [] : rows">...</gog-table>';
  protected readonly emptyTs = [
    "import { Component, signal } from '@angular/core';",
    "import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn, ButtonComponent],',
    '  template: `',
    '    <gog-button (gogClick)="showEmpty.set(!showEmpty())">Toggle</gog-button>',
    '    <gog-table [value]="showEmpty() ? [] : rows">',
    '      <gog-column field="component" header="Component"></gog-column>',
    '      <gog-column field="owner" header="Owner"></gog-column>',
    '    </gog-table>',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly showEmpty = signal(false);',
    '  protected readonly rows = [/* ... */];',
    '}',
  ].join('\n');

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

  // ── Snippets for the 21.4.0 sections ───────────────────────────────────────────────────────

  protected readonly outputsHtml = [
    '<gog-table',
    '  [value]="rows"',
    '  [pageSize]="3"',
    '  [interactiveRows]="true"',
    '  (gogSortChange)="onSortChange($event)"',
    '  (gogPageChange)="onPageChange($event)"',
    '  (gogRowClick)="onRowClick($event)"',
    '>',
    '  <gog-column field="component" header="Component" [sortable]="true"></gog-column>',
    '  <gog-column field="status" header="Status" [sortable]="true"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly outputsTs = [
    "import { Component, signal } from '@angular/core';",
    'import {',
    '  GogColumn,',
    '  GogTableRowClickEvent,',
    '  GogTableSortEvent,',
    '  TableComponent,',
    "} from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `/* as in the HTML tab */`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows = [/* ... */];',
    '',
    '  protected onSortChange(sort: GogTableSortEvent): void {',
    '    // The third click clears the sort: { field: "", direction: null }.',
    '    console.log(sort.field, sort.direction);',
    '  }',
    '',
    '  protected onPageChange(page: number): void {',
    '    // 1-based. Never fires on first render, nor for the reset a new sort causes.',
    '    console.log(page);',
    '  }',
    '',
    '  protected onRowClick(event: GogTableRowClickEvent<Row>): void {',
    '    console.log(event.row, event.index, event.originalEvent);',
    '  }',
    '}',
  ].join('\n');

  protected readonly selectionHtml = [
    '<gog-table',
    '  [value]="rows"',
    '  selectionMode="multiple"',
    '  [(selection)]="selection"',
    '  dataKey="component"',
    '>',
    '  <gog-column field="component" header="Component"></gog-column>',
    '  <gog-column field="status" header="Status"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly selectionTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `/* as in the HTML tab */`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows: Row[] = [/* ... */];',
    '',
    '  // Always an array — in "single" mode it simply holds zero or one row, so there is',
    '  // one shape to read rather than a T | T[] | null union to narrow on every access.',
    '  protected readonly selection = signal<Row[]>([]);',
    '}',
  ].join('\n');

  protected readonly rowsPerPageHtml = [
    '<gog-table',
    '  [value]="rows"',
    '  [(pageSize)]="rowsPerPage"',
    '  [showPageSizeSelect]="true"',
    '  [pageSizeOptions]="[2, 3, 6]"',
    '>',
    '  <gog-column field="component" header="Component"></gog-column>',
    '  <gog-column field="owner" header="Owner"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly rowsPerPageTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `/* as in the HTML tab */`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly rows = [/* ... */];',
    '',
    '  // `pageSize` is a model on both the table and the paginator, which is exactly what lets',
    '  // the select write back through the table without a go-between signal.',
    '  protected readonly rowsPerPage = signal(2);',
    '}',
  ].join('\n');

  protected readonly lazyHtml = [
    '<gog-table',
    '  [value]="serverRows()"',
    '  [lazy]="true"',
    '  [totalRecords]="serverTotal()"',
    '  [(pageSize)]="serverPageSize"',
    '  [loading]="serverLoading()"',
    '  [showTotal]="true"',
    '  [showPageSizeSelect]="true"',
    '  [pageSizeOptions]="[10, 20, 50]"',
    '  dataKey="id"',
    '  (gogSortChange)="onServerSort($event)"',
    '  (gogPageChange)="onServerPage($event)"',
    '  (pageSizeChange)="onServerPageSize($event)"',
    '>',
    '  <gog-column field="name" header="Name" [sortable]="true"></gog-column>',
    '  <gog-column field="team" header="Team" [sortable]="true"></gog-column>',
    '  <gog-column field="score" header="Score" [sortable]="true"></gog-column>',
    '</gog-table>',
  ].join('\n');
  protected readonly lazyTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogColumn, GogTableSortEvent, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `/* as in the HTML tab */`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly serverRows = signal<ServerRow[]>([]);',
    '  protected readonly serverTotal = signal(0);',
    '  protected readonly serverPageSize = signal(10);',
    '  protected readonly serverLoading = signal(false);',
    '',
    '  private page = 1;',
    "  private sort: GogTableSortEvent = { field: '', direction: null };",
    '',
    '  constructor() {',
    '    this.fetchPage();',
    '  }',
    '',
    '  protected onServerSort(sort: GogTableSortEvent): void {',
    '    this.sort = sort;',
    '    // The table has already reset itself to page 1 — that reset is part of the sort,',
    '    // which is why gogPageChange stays quiet for it.',
    '    this.page = 1;',
    '    this.fetchPage();',
    '  }',
    '',
    '  protected onServerPage(page: number): void {',
    '    this.page = page;',
    '    this.fetchPage();',
    '  }',
    '',
    '  protected onServerPageSize(size: number): void {',
    '    this.serverPageSize.set(size);',
    '    this.page = 1;',
    '    this.fetchPage();',
    '  }',
    '',
    '  private fetchPage(): void {',
    '    this.serverLoading.set(true);',
    '    this.api.list({ page: this.page, size: this.serverPageSize(), sort: this.sort }).subscribe({',
    '      next: ({ rows, total }) => {',
    '        this.serverRows.set(rows); // already sorted and sliced by the server',
    '        this.serverTotal.set(total);',
    '        this.serverLoading.set(false);',
    '      },',
    '    });',
    '  }',
    '}',
  ].join('\n');
}
