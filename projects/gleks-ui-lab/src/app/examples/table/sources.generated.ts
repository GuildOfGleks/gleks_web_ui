// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { TableEmptyExample } from './table-empty/example';
import { TableFullWidthExample } from './table-full-width/example';
import { TableLazyExample } from './table-lazy/example';
import { TableLoadingExample } from './table-loading/example';
import { TableMissingValuesExample } from './table-missing-values/example';
import { TableOutputsExample } from './table-outputs/example';
import { TableOverviewExample } from './table-overview/example';
import { TablePaginationExample } from './table-pagination/example';
import { TableRowsPerPageExample } from './table-rows-per-page/example';
import { TableSelectionExample } from './table-selection/example';
import { TableStickyExample } from './table-sticky/example';
import { TableTemplatesExample } from './table-templates/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const TABLE_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    TableEmptyExample,
    {
      html: '<div class="example">\n  <gog-button size="sm" variant="outline" (gogClick)="showEmpty.set(!showEmpty())">\n    {{ showEmpty() ? \'Show the rows\' : \'Empty the table\' }}\n  </gog-button>\n\n  <gog-table [value]="showEmpty() ? [] : rows">\n    <gog-column field="component" header="Component" />\n    <gog-column field="owner" header="Owner" />\n  </gog-table>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn, ButtonComponent],\n})\nexport class TableEmptyExample {\n  protected readonly showEmpty = signal(false);\n  protected readonly rows = [\n    { component: 'Buttons', owner: 'Design' },\n    { component: 'Checkbox', owner: 'Forms' },\n    { component: 'Table', owner: 'Data' },\n    { component: 'Accordion', owner: 'Navigation' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 16px;\n}\ngog-table {\n  align-self: stretch;\n}',
    },
  ],
  [
    TableFullWidthExample,
    {
      html: '<div class="example">\n  <div class="case">\n    <p class="case__label">Default — fills its container</p>\n    <gog-table [value]="rows" [showRowNumbers]="false" size="sm">\n      <gog-column field="component" header="Component" />\n      <gog-column field="status" header="Status" />\n    </gog-table>\n  </div>\n\n  <div class="case">\n    <p class="case__label">[fullWidth]="false" — shrinks to its columns</p>\n    <!-- The table is table-layout: fixed, so it splits its width evenly between columns\n         instead of measuring the text. Shrink-to-fit therefore needs the column widths\n         stated: without them the header of the widest column is cut off. -->\n    <gog-table [value]="rows" [showRowNumbers]="false" [fullWidth]="false" size="sm">\n      <gog-column field="component" header="Component" width="140px" />\n      <gog-column field="status" header="Status" width="110px" />\n    </gog-table>\n  </div>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableFullWidthExample {\n  protected readonly rows = [\n    { component: 'Buttons', status: 'Ready' },\n    { component: 'Checkbox', status: 'Ready' },\n    { component: 'Table', status: 'In review' },\n    { component: 'Accordion', status: 'Planned' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 20px;\n}\n.case {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.case__label {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    TableLazyExample,
    {
      html: '<div class="example">\n  <gog-table\n    [value]="serverRows()"\n    [lazy]="true"\n    [totalRecords]="serverTotal()"\n    [(pageSize)]="serverPageSize"\n    [loading]="serverLoading()"\n    [showTotal]="true"\n    [showPageSizeSelect]="true"\n    [pageSizeOptions]="[10, 20, 50]"\n    dataKey="id"\n    (gogSortChange)="onServerSort($event)"\n    (gogPageChange)="onServerPage($event)"\n    (pageSizeChange)="onServerPageSize($event)"\n  >\n    <gog-column field="name" header="Name" [sortable]="true" />\n    <gog-column field="team" header="Team" [sortable]="true" />\n  </gog-table>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogColumn, GogTableSortEvent, TableComponent } from '@guildofgleks/ui';\n\ninterface ServerRow {\n  readonly id: number;\n  readonly name: string;\n  readonly team: string;\n}\n\n// Stands in for the backend so the example runs anywhere. In a real app this is an HTTP call.\nconst ALL_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, index) => ({\n  id: index + 1,\n  name: `Person ${index + 1}`,\n  team: ['Platform', 'Design', 'Support'][index % 3],\n}));\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableLazyExample {\n  protected readonly serverRows = signal<ServerRow[]>([]);\n  protected readonly serverTotal = signal(0);\n  protected readonly serverPageSize = signal(10);\n  protected readonly serverLoading = signal(false);\n\n  private page = 1;\n  private sort: GogTableSortEvent = { field: '', direction: null };\n\n  constructor() {\n    this.fetchPage();\n  }\n\n  protected onServerSort(sort: GogTableSortEvent): void {\n    this.sort = sort;\n    // The table has already reset itself to page 1 — that reset is part of the sort, which is\n    // why gogPageChange stays quiet for it.\n    this.page = 1;\n    this.fetchPage();\n  }\n\n  protected onServerPage(page: number): void {\n    this.page = page;\n    this.fetchPage();\n  }\n\n  protected onServerPageSize(size: number): void {\n    this.serverPageSize.set(size);\n    this.page = 1;\n    this.fetchPage();\n  }\n\n  private fetchPage(): void {\n    this.serverLoading.set(true);\n\n    setTimeout(() => {\n      const sorted = this.sortRows(ALL_ROWS);\n      const start = (this.page - 1) * this.serverPageSize();\n\n      // Whatever arrives is rendered as-is: with `lazy`, the table neither sorts nor slices.\n      this.serverRows.set(sorted.slice(start, start + this.serverPageSize()));\n      this.serverTotal.set(ALL_ROWS.length);\n      this.serverLoading.set(false);\n    }, 300);\n  }\n\n  private sortRows(rows: readonly ServerRow[]): ServerRow[] {\n    const { field, direction } = this.sort;\n    if (!field || direction === null) return [...rows];\n\n    const key = field as keyof ServerRow;\n    return [...rows].sort(\n      (a, b) => String(a[key]).localeCompare(String(b[key])) * (direction === 'asc' ? 1 : -1),\n    );\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TableLoadingExample,
    {
      html: '<div class="example">\n  <gog-button size="sm" variant="outline" [disabled]="loading()" (gogClick)="reload()">\n    {{ loading() ? \'Loading…\' : \'Reload\' }}\n  </gog-button>\n\n  <gog-table [value]="rows" [loading]="loading()">\n    <gog-column field="component" header="Component" />\n    <gog-column field="status" header="Status" />\n  </gog-table>\n</div>',
      ts: "import { Component, OnDestroy, signal } from '@angular/core';\nimport { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn, ButtonComponent],\n})\nexport class TableLoadingExample implements OnDestroy {\n  protected readonly loading = signal(false);\n  private timer: ReturnType<typeof setTimeout> | null = null;\n\n  protected readonly rows = [\n    { component: 'Buttons', status: 'Ready' },\n    { component: 'Checkbox', status: 'Ready' },\n    { component: 'Table', status: 'In review' },\n    { component: 'Accordion', status: 'Planned' },\n  ];\n\n  /** Stands in for a refetch: in a real app `loading` is the request's in-flight flag. */\n  protected reload(): void {\n    if (this.timer) clearTimeout(this.timer);\n\n    this.loading.set(true);\n    this.timer = setTimeout(() => {\n      this.loading.set(false);\n      this.timer = null;\n    }, 1200);\n  }\n\n  ngOnDestroy(): void {\n    if (this.timer) clearTimeout(this.timer);\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 16px;\n}\ngog-table {\n  align-self: stretch;\n}',
    },
  ],
  [
    TableMissingValuesExample,
    {
      html: '<div class="example">\n  <div class="case">\n    <p class="case__label">Default — emptyPlaceholder is "-"</p>\n    <gog-table [value]="sparseRows" [showRowNumbers]="false" size="sm">\n      <gog-column field="component" header="Component" />\n      <gog-column field="owner" header="Owner" />\n    </gog-table>\n  </div>\n\n  <div class="case">\n    <p class="case__label">emptyPlaceholder="Unassigned"</p>\n    <gog-table\n      [value]="sparseRows"\n      [showRowNumbers]="false"\n      emptyPlaceholder="Unassigned"\n      size="sm"\n    >\n      <gog-column field="component" header="Component" />\n      <gog-column field="owner" header="Owner" />\n    </gog-table>\n  </div>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\ninterface SparseRow {\n  component: string;\n  owner: string | null;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableMissingValuesExample {\n  protected readonly sparseRows: SparseRow[] = [\n    { component: 'Buttons', owner: 'Design' },\n    { component: 'Checkbox', owner: null },\n    { component: 'Table', owner: 'Data' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 20px;\n}\n.case {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.case__label {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    TableOutputsExample,
    {
      html: '<div class="example">\n  <gog-table\n    [value]="rows"\n    [pageSize]="3"\n    [interactiveRows]="true"\n    (gogSortChange)="onSortChange($event)"\n    (gogPageChange)="onPageChange($event)"\n    (gogRowClick)="onRowClick($event)"\n  >\n    <gog-column field="component" header="Component" [sortable]="true" />\n    <gog-column field="status" header="Status" [sortable]="true" />\n  </gog-table>\n\n  <p class="readout">{{ lastEvent() }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport {\n  GogColumn,\n  GogTableRowClickEvent,\n  GogTableSortEvent,\n  TableComponent,\n} from '@guildofgleks/ui';\n\ninterface Row {\n  readonly component: string;\n  readonly status: string;\n  readonly owner: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableOutputsExample {\n  protected readonly rows: Row[] = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },\n    { component: 'Table', status: 'In review', owner: 'Data' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },\n  ];\n\n  protected readonly lastEvent = signal('No event yet.');\n\n  protected onSortChange(sort: GogTableSortEvent): void {\n    // The third click clears the sort: { field: '', direction: null }.\n    this.lastEvent.set(`sort: ${sort.field || '(cleared)'} ${sort.direction ?? ''}`);\n  }\n\n  protected onPageChange(page: number): void {\n    // 1-based. Never fires on first render, nor for the reset a new sort causes.\n    this.lastEvent.set(`page: ${page}`);\n  }\n\n  protected onRowClick(event: GogTableRowClickEvent<Row>): void {\n    this.lastEvent.set(`row click: ${event.row.component} (index ${event.index})`);\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    TableOverviewExample,
    {
      html: '<div class="example">\n  <gog-table [value]="rows">\n    <gog-column field="component" header="Component" [sortable]="true" />\n    <gog-column field="status" header="Status" [sortable]="true" />\n    <gog-column field="owner" header="Owner" />\n    <gog-column field="updated" header="Updated" />\n  </gog-table>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\ninterface Row {\n  component: string;\n  status: string;\n  owner: string;\n  updated: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableOverviewExample {\n  // Enough rows that clicking a sortable header visibly reorders something — two rows can be\n  // sorted, but not convincingly.\n  protected readonly rows: Row[] = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },\n    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation', updated: 'This week' },\n    { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TablePaginationExample,
    {
      html: '<div class="example">\n  <gog-table [value]="rows" [pageSize]="3" [showTotal]="true" totalPosition="left">\n    <gog-column field="component" header="Component" [sortable]="true"></gog-column>\n    <gog-column field="status" header="Status" [sortable]="true"></gog-column>\n    <gog-column field="owner" header="Owner"></gog-column>\n  </gog-table>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TablePaginationExample {\n  protected readonly rows = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },\n    { component: 'Table', status: 'In review', owner: 'Data' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },\n    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },\n    { component: 'Toast', status: 'Ready', owner: 'Feedback' },\n    { component: 'Tabs', status: 'In review', owner: 'Navigation' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TableRowsPerPageExample,
    {
      html: '<div class="example">\n  <gog-table\n    [value]="rows"\n    [(pageSize)]="rowsPerPage"\n    [showPageSizeSelect]="true"\n    [pageSizeOptions]="[2, 3, 6]"\n  >\n    <gog-column field="component" header="Component" />\n    <gog-column field="owner" header="Owner" />\n  </gog-table>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableRowsPerPageExample {\n  protected readonly rows = [\n    { component: 'Buttons', owner: 'Design' },\n    { component: 'Checkbox', owner: 'Forms' },\n    { component: 'Table', owner: 'Data' },\n    { component: 'Accordion', owner: 'Navigation' },\n    { component: 'Spinner', owner: 'Feedback' },\n    { component: 'Toast', owner: 'Feedback' },\n  ];\n\n  // `pageSize` is a model on both the table and the paginator, which is exactly what lets\n  // the select write back through the table without a go-between signal.\n  protected readonly rowsPerPage = signal(2);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}',
    },
  ],
  [
    TableSelectionExample,
    {
      html: '<div class="example">\n  <gog-table [value]="rows" selectionMode="multiple" [(selection)]="selection" dataKey="component">\n    <gog-column field="component" header="Component" />\n    <gog-column field="status" header="Status" />\n    <gog-column field="owner" header="Owner" />\n  </gog-table>\n\n  <p class="readout">Selected: {{ selection().length }}</p>\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { GogColumn, TableComponent } from '@guildofgleks/ui';\n\ninterface Row {\n  readonly component: string;\n  readonly status: string;\n  readonly owner: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn],\n})\nexport class TableSelectionExample {\n  protected readonly rows: Row[] = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },\n    { component: 'Table', status: 'In review', owner: 'Data' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },\n  ];\n\n  // Always an array — in \"single\" mode it simply holds zero or one row, so there is\n  // one shape to read rather than a T | T[] | null union to narrow on every access.\n  protected readonly selection = signal<Row[]>([]);\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\n.readout {\n  margin: 0;\n  color: var(--gog-muted-text-color);\n  font-size: 0.9em;\n}',
    },
  ],
  [
    TableStickyExample,
    {
      html: '<div class="example">\n  <!-- gog-scroll rather than a bare overflow-y: auto — a native scrollbar is the one piece of\n       chrome no --gog-* token can reach, which is the whole reason the component exists.\n\n       Note that the header does not actually hold in this version: gog-table wraps its own\n       markup in a horizontal gog-scroll, and a sticky element resolves against its nearest\n       scrolling ancestor, so that inner viewport wins over this region. See the note above\n       the demo. Nothing here works around it — the fix belongs in the component. -->\n  <gog-scroll class="box" ariaLabel="Components">\n    <gog-table [value]="rows" [stickyHeader]="true">\n      <gog-column field="component" header="Component" />\n      <gog-column field="status" header="Status" />\n      <gog-column field="owner" header="Owner" />\n    </gog-table>\n  </gog-scroll>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { GogColumn, ScrollComponent, TableComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [TableComponent, GogColumn, ScrollComponent],\n})\nexport class TableStickyExample {\n  protected readonly rows = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },\n    { component: 'Table', status: 'In review', owner: 'Data' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },\n    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },\n    { component: 'Toast', status: 'Ready', owner: 'Feedback' },\n    { component: 'Tabs', status: 'In review', owner: 'Navigation' },\n    { component: 'Tooltip', status: 'Ready', owner: 'Overlays' },\n    { component: 'Dialog', status: 'Ready', owner: 'Overlays' },\n    { component: 'Select', status: 'In review', owner: 'Forms' },\n    { component: 'Slider', status: 'Ready', owner: 'Forms' },\n    { component: 'Paginator', status: 'Planned', owner: 'Data' },\n  ];\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\n.box {\n  height: 260px;\n}',
    },
  ],
  [
    TableTemplatesExample,
    {
      html: '<div class="example">\n  <gog-table [value]="rows" [showRowNumbers]="false">\n    <gog-column field="component" header="Component" [sortable]="true"></gog-column>\n\n    <gog-column field="status" header="Status">\n      <ng-template gogColumnHeader let-header>\n        <span class="status-header">{{ header }}</span>\n      </ng-template>\n      <ng-template gogColumnBody let-row let-value="value">\n        <gog-tag [variant]="statusVariant(asRow(row).status)" size="sm">{{ value }}</gog-tag>\n      </ng-template>\n    </gog-column>\n\n    <gog-column field="owner" header="Owner"></gog-column>\n  </gog-table>\n</div>',
      ts: "import { Component } from '@angular/core';\nimport {\n  GogColumn,\n  GogColumnBodyDirective,\n  GogColumnHeaderDirective,\n  GogTagVariant,\n  TableComponent,\n  TagComponent,\n} from '@guildofgleks/ui';\n\nconst STATUS_VARIANTS: Record<string, GogTagVariant> = {\n  Ready: 'success',\n  'In review': 'warning',\n  Planned: 'info',\n};\n\ninterface Row {\n  readonly component: string;\n  readonly status: string;\n  readonly owner: string;\n}\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [\n    TableComponent,\n    GogColumn,\n    GogColumnBodyDirective,\n    GogColumnHeaderDirective,\n    TagComponent,\n  ],\n})\nexport class TableTemplatesExample {\n  protected readonly rows: Row[] = [\n    { component: 'Buttons', status: 'Ready', owner: 'Design' },\n    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },\n    { component: 'Table', status: 'In review', owner: 'Data' },\n    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },\n  ];\n\n  // The slot hands the row back as unknown, so narrow it once here.\n  protected asRow(row: unknown): Row {\n    return row as Row;\n  }\n\n  protected statusVariant(status: string): GogTagVariant {\n    return STATUS_VARIANTS[status] ?? 'info';\n  }\n}",
      css: '.example {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 16px;\n}\n.status-header {\n  font-weight: 600;\n  color: var(--gog-accent-color);\n}',
    },
  ],
]);
