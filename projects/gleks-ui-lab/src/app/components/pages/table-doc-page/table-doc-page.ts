import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ButtonComponent,
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  GogTagVariant,
  TableComponent,
  TagComponent,
} from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
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
}

const TABLE_INPUTS: readonly ApiRow[] = [
  { name: 'value', type: 'T[]', default: '[]', description: 'The row data array.' },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description: 'Fills its container by default. Set false to shrink to fit its columns instead.',
  },
  {
    name: 'pageSize',
    type: 'number',
    default: '0',
    description: 'Rows per page. 0 disables pagination.',
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
  imports: [
    TableComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    TagComponent,
    ButtonComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
  ],
  templateUrl: './table-doc-page.html',
  styleUrl: './table-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDocPage implements OnDestroy {
  protected readonly rows = ROWS;
  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
    { component: 'Table', owner: null },
  ];

  protected readonly tableInputs = TABLE_INPUTS;
  protected readonly columnInputs = COLUMN_INPUTS;
  protected readonly columnSlots = COLUMN_SLOTS;
  protected readonly deprecatedTemplateInputs = DEPRECATED_TEMPLATE_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'table')?.tokens ?? [];

  protected readonly loading = signal(false);
  protected readonly showEmpty = signal(false);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

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
    '<div style="max-height: 260px; overflow-y: auto;">',
    '  <gog-table [value]="rows" [stickyHeader]="true">',
    '    <gog-column field="component" header="Component"></gog-column>',
    '    <gog-column field="status" header="Status"></gog-column>',
    '    <gog-column field="owner" header="Owner"></gog-column>',
    '  </gog-table>',
    '</div>',
  ].join('\n');
  protected readonly stickyTs = [
    "import { Component } from '@angular/core';",
    "import { GogColumn, TableComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [TableComponent, GogColumn],',
    '  template: `',
    '    <div style="max-height: 260px; overflow-y: auto;">',
    '      <gog-table [value]="rows" [stickyHeader]="true">',
    '        <gog-column field="component" header="Component"></gog-column>',
    '        <gog-column field="status" header="Status"></gog-column>',
    '        <gog-column field="owner" header="Owner"></gog-column>',
    '      </gog-table>',
    '    </div>',
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
    '  <gog-column field="component" header="Component"></gog-column>',
    '  <gog-column field="status" header="Status"></gog-column>',
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
  }
}
