import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { LIBRARY_VERSION } from '../../shared/library-version';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { TABLE_EXAMPLE_SOURCES } from '../../../examples/table/sources.generated';
import { TableEmptyExample } from '../../../examples/table/table-empty.example';
import { TableFullWidthExample } from '../../../examples/table/table-full-width.example';
import { TableLazyExample } from '../../../examples/table/table-lazy.example';
import { TableLoadingExample } from '../../../examples/table/table-loading.example';
import { TableMissingValuesExample } from '../../../examples/table/table-missing-values.example';
import { TableOutputsExample } from '../../../examples/table/table-outputs.example';
import { TableOverviewExample } from '../../../examples/table/table-overview.example';
import { TablePaginationExample } from '../../../examples/table/table-pagination.example';
import { TableRowsPerPageExample } from '../../../examples/table/table-rows-per-page.example';
import { TableSelectionExample } from '../../../examples/table/table-selection.example';
import { TableStickyExample } from '../../../examples/table/table-sticky.example';
import { TableTemplatesExample } from '../../../examples/table/table-templates.example';

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

const DEPRECATED_TEMPLATE_INPUTS: readonly ApiRow[] = [
  {
    name: 'template',
    type: 'string',
    default: 'required',
    description:
      'The column field this template rendered for — a string the compiler cannot check, so a typo silently fell back to the default cell. That is why it was replaced.',
  },
  {
    name: 'type',
    type: "'body' | 'header'",
    default: "'body'",
    description:
      "'body' got let-row (the row object) and let-index (its position). 'header' got no context.",
  },
];

@Component({
  selector: 'app-table-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  providers: [provideExampleSources(TABLE_EXAMPLE_SOURCES)],
  templateUrl: './table-doc-page.html',
  styleUrl: './table-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDocPage {
  // Read from the installed package so the defect note cannot claim the wrong version.
  protected readonly libraryVersion = LIBRARY_VERSION;

  protected readonly tableInputs = TABLE_INPUTS;
  protected readonly tableOutputs = TABLE_OUTPUTS;
  protected readonly columnInputs = COLUMN_INPUTS;
  protected readonly columnSlots = COLUMN_SLOTS;
  protected readonly deprecatedTemplateInputs = DEPRECATED_TEMPLATE_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'table')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { GogColumn } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [TableComponent, GogColumn],\n})\n```";

  protected readonly migrateTemplateSnippet = [
    '```html',
    '<!-- 21.2.x — the template matched its column by a string the compiler cannot check, -->',
    '<!-- so a typo silently fell back to the default cell. -->',
    '<gog-table [value]="rows">',
    '  <column field="status" header="Status"></column>',
    '  <ng-template template="status" type="body" let-row>…</ng-template>',
    '</gog-table>',
    '',
    '<!-- 21.3.0 — the template lives inside the column it belongs to. -->',
    '<gog-table [value]="rows">',
    '  <gog-column field="status" header="Status">',
    '    <ng-template gogColumnBody let-row let-value="value">…</ng-template>',
    '  </gog-column>',
    '</gog-table>',
    '```',
  ].join('\n');

  // ── Snippets for the 21.4.0 sections ───────────────────────────────────────────────────────

  /** Each example is a file under `src/app/examples/table/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    empty: TableEmptyExample,
    fullWidth: TableFullWidthExample,
    lazy: TableLazyExample,
    loading: TableLoadingExample,
    missingValues: TableMissingValuesExample,
    outputs: TableOutputsExample,
    overview: TableOverviewExample,
    pagination: TablePaginationExample,
    rowsPerPage: TableRowsPerPageExample,
    selection: TableSelectionExample,
    sticky: TableStickyExample,
    templates: TableTemplatesExample,
  };
}
