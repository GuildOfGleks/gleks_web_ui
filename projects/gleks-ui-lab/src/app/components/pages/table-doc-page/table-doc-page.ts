import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { TABLE_EXAMPLES } from '../../../examples/table/sources.generated';
import { TableColumnsExample } from '../../../examples/table/table-columns/example';
import { TableConfigExample } from '../../../examples/table/table-config/example';
import { TableCustomCellsExample } from '../../../examples/table/table-custom-cells/example';
import { TableEventsExample } from '../../../examples/table/table-events/example';
import { TableLazyExample } from '../../../examples/table/table-lazy/example';
import { TableOverviewExample } from '../../../examples/table/table-overview/example';
import { TablePageSizeExample } from '../../../examples/table/table-page-size/example';
import { TablePaginationExample } from '../../../examples/table/table-pagination/example';
import { TableRowSelectExample } from '../../../examples/table/table-row-select/example';
import { TableSelectionExample } from '../../../examples/table/table-selection/example';
import { TableSizesExample } from '../../../examples/table/table-sizes/example';
import { TableStatesExample } from '../../../examples/table/table-states/example';
import { TableStickyExample } from '../../../examples/table/table-sticky/example';
import { TableVirtualizeExample } from '../../../examples/table/table-virtualize/example';
import { TableWidthExample } from '../../../examples/table/table-width/example';

const TABLE_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'readonly T[]',
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
    type: 'readonly number[] | undefined',
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
    name: 'sort',
    type: 'GogTableSortEvent | null',
    default: 'null',
    description:
      'Seeds the sort, and replaces it whenever it changes — for data that arrives already ordered, so the header says what the server did. A header press still moves it in between. Setting it does not emit gogSortChange, so [sort]="sort()" (gogSortChange)="sort.set($event)" is a two-way binding.',
    since: '21.15.0',
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
      'The checkbox column that appears once selection is on. For a table that selects by clicking the row itself, turn it off and set selectOnRowClick. With it off, a selected row carries visually hidden "Selected" text (GOG_CONFIG.labels.tableRowSelected).',
    since: '21.4.0',
  },
  {
    name: 'selectOnRowClick',
    type: 'boolean',
    default: 'false',
    description:
      "Toggles a row's selection when the row itself is pressed, and makes rows interactive on its own (focusable, Enter/Space toggle) — no interactiveRows needed. A press on a control inside a cell, or a drag that selects text, does not toggle. gogRowClick still fires, so leave it off where rows navigate. A no-op without selectionMode.",
    since: '21.15.0',
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
    name: 'emptyMessage',
    type: 'string | undefined',
    default: "'No data'",
    description:
      "The text of the one row an empty table renders. Falls back to GOG_CONFIG.labels.tableEmpty, then to 'No data'. Before 21.15.0 that row was a dash.",
    since: '21.15.0',
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
    description:
      "Holds the header row at the top of the table's own scroll viewport. Needs maxHeight — without it the viewport is content-height and never scrolls, so there is nothing to hold against.",
  },
  {
    name: 'maxHeight',
    type: 'string | null',
    default: 'null',
    description:
      "Any CSS length ('420px', '60vh'). Caps the table's own scroll viewport, so the table owns its vertical scrolling instead of growing to its content and letting an ancestor scroll it. This is what makes stickyHeader work.",
    since: '21.6.0',
  },
  {
    name: 'virtualize',
    type: 'boolean',
    default: 'false',
    description:
      'Renders only the rows in view, measuring each one as it renders since a table row cannot be given a fixed height. Requires maxHeight and fullWidth — without either it turns itself off and warns in dev mode. Composes with lazy rather than replacing it. Since 21.15.0 the server renders a window too, not every row.',
    since: '21.13.0',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'lg'",
    description: 'Row density — cell padding and font size scale with it.',
  },
];

const TABLE_OUTPUTS: readonly ApiRow[] = [
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

const COLUMN_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogColumnBody',
    type: '$implicit / row (the row object), index, value',
    description:
      "Custom cell markup for this column. value is the already-resolved cell value for the column's field, so a custom cell can decorate it rather than re-derive it. index is the position within the rendered page, not the whole data set.",
  },
  {
    name: '[gogColumnBodyTypeOf]',
    type: 'readonly T[] — an input on gogColumnBody',
    description:
      'Since 21.15.0. Bind the same array the table renders and let-row is typed as its element instead of unknown. Never read at runtime; left unbound, the template compiles exactly as before. value stays unknown either way, since it is read from a field string.',
  },
  {
    name: 'gogColumnHeader',
    type: "$implicit (the column's own header text), field",
    description:
      'Custom header markup for this column. The header text is handed in so a custom header can decorate it rather than restate it. In a sortable column it renders inside the sort button and names it, so keep links, buttons and form controls out of it.',
  },
];

@Component({
  selector: 'app-table-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './table-doc-page.html',
  styleUrl: './table-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDocPage {
  protected readonly tableInputs = TABLE_INPUTS;
  protected readonly tableOutputs = TABLE_OUTPUTS;
  protected readonly columnInputs = COLUMN_INPUTS;
  protected readonly columnSlots = COLUMN_SLOTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'table')?.tokens ?? [];

  protected readonly sources = TABLE_EXAMPLES;
  protected readonly examples = {
    overview: TableOverviewExample,
    sizes: TableSizesExample,
    states: TableStatesExample,
    customCells: TableCustomCellsExample,
    columns: TableColumnsExample,
    width: TableWidthExample,
    pagination: TablePaginationExample,
    sticky: TableStickyExample,
    config: TableConfigExample,
    events: TableEventsExample,
    selection: TableSelectionExample,
    rowSelect: TableRowSelectExample,
    pageSize: TablePageSizeExample,
    lazy: TableLazyExample,
    virtualize: TableVirtualizeExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { GogColumn, TableComponent } from '@guildofgleks/ui/table';\n\n@Component({\n  // ...\n  imports: [TableComponent, GogColumn],\n})\n```";
}
