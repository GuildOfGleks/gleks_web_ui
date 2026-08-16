import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize, PaginatorComponent } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiInputRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiInputRow[] = [
  {
    name: 'page',
    type: 'number (model)',
    default: '1',
    description:
      '1-based current page. Two-way bindable: [(page)]="myPageSignal". Self-clamps to [1, totalPages] whenever totalPages shrinks below it.',
  },
  {
    name: 'totalRecords',
    type: 'number | null',
    default: 'null',
    description:
      'How many rows exist. Given this, the paginator derives the page count from pageSize itself — which is what removes the Math.ceil(total / size) a consumer otherwise writes and keeps in sync. Wins over totalPages when both are set.',
    since: '21.4.0',
  },
  {
    name: 'pageSize',
    type: 'number (model)',
    default: '10',
    description:
      'Rows per page, two-way bindable. Changing it always returns to page 1 — "page 5" of 10-row pages is not "page 5" of 50-row ones.',
    since: '21.4.0',
  },
  {
    name: 'showPageSizeSelect',
    type: 'boolean | undefined',
    default: 'false',
    description:
      'Whether the rows-per-page select renders at all. Also settable app-wide via GOG_CONFIG.paginator.',
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
    name: 'totalPages',
    type: 'number',
    default: '1',
    description:
      'Total number of pages. Still the right input when a server hands you a page count directly.',
  },
  {
    name: 'rangeMode',
    type: "'window' | 'ellipsis'",
    default: "'window'",
    description:
      "'window': a fixed number of page buttons (visiblePages) that slides to keep the current page centered, clamped at the edges — no ellipsis, no pinned boundaries unless showFirstPage/showLastPage ask for them. 'ellipsis': first and last page are always pinned, with siblingCount pages kept around the current one and a \"…\" filling the gap.",
  },
  {
    name: 'visiblePages',
    type: 'number',
    default: '5',
    description: 'rangeMode="window" only: how many page number buttons stay visible at once.',
  },
  {
    name: 'showFirstPage',
    type: 'boolean',
    default: 'false',
    description:
      'rangeMode="window" only: always keep page 1 reachable, with a "…" if it is not adjacent.',
  },
  {
    name: 'showLastPage',
    type: 'boolean',
    default: 'false',
    description:
      'rangeMode="window" only: always keep the last page reachable, with a "…" if it is not adjacent.',
  },
  {
    name: 'siblingCount',
    type: 'number',
    default: '2',
    description:
      'rangeMode="ellipsis" only: how many page numbers to keep on each side of the current page.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'sm'",
    description: 'Button height, padding, and font size.',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'true',
    description:
      'Fills its container by default. Set false to shrink to fit the page buttons instead.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Freezes every control.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Pagination'",
    description:
      'Accessible name for the navigation landmark. Its default now comes from GOG_CONFIG.labels.pagination.',
  },
];

const FRUIT_ITEMS = [
  'Apple',
  'Banana',
  'Cherry',
  'Date',
  'Elderberry',
  'Fig',
  'Grape',
  'Honeydew',
  'Kiwi',
  'Lemon',
  'Mango',
];

@Component({
  selector: 'app-paginator-doc-page',
  imports: [
    PaginatorComponent,
    MarkdownComponent,
    CodeTabsComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './paginator-doc-page.html',
  styleUrl: './paginator-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'paginator')?.tokens ?? [];

  protected readonly basicPage = signal(1);
  protected readonly basicTotalPages = signal(20);

  protected readonly windowPage = signal(10);
  protected readonly windowTotalPages = signal(20);

  protected readonly ellipsisPage = signal(10);
  protected readonly ellipsisTotalPages = signal(20);

  protected readonly sizeDemoPage = signal(2);

  protected readonly disabledPage = signal(3);

  // ── totalRecords / rows-per-page demo ──────────────────────────────────────────────────────
  protected readonly recordsPage = signal(1);
  protected readonly recordsPageSize = signal(10);
  protected readonly totalRecords = signal(137);
  protected readonly recordsRange = computed(() => {
    const size = this.recordsPageSize();
    const start = (this.recordsPage() - 1) * size + 1;
    return `${start}–${Math.min(start + size - 1, this.totalRecords())} of ${this.totalRecords()}`;
  });

  private readonly listPageSize = 4;
  protected readonly listItems = FRUIT_ITEMS;
  protected readonly listPage = signal(1);
  protected readonly listTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.listItems.length / this.listPageSize)),
  );
  protected readonly visibleListItems = computed(() => {
    const start = (this.listPage() - 1) * this.listPageSize;
    return this.listItems.slice(start, start + this.listPageSize);
  });

  protected readonly importSnippet =
    "```typescript\nimport { PaginatorComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [PaginatorComponent],\n})\n```";

  protected readonly recordsHtml = [
    '<gog-paginator',
    '  [(page)]="page"',
    '  [(pageSize)]="pageSize"',
    '  [totalRecords]="items().length"',
    '  [showPageSizeSelect]="true"',
    '  [pageSizeOptions]="[10, 20, 50]"',
    '/>',
  ].join('\n');
  protected readonly recordsTs = [
    "import { Component, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `/* as in the HTML tab */`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly page = signal(1);',
    '  protected readonly pageSize = signal(10);',
    '  protected readonly items = signal<Item[]>([/* 137 of them */]);',
    '',
    '  // No `totalPages` computed to write, and none to keep in sync with the size select:',
    '  // the paginator derives the page count from totalRecords and pageSize itself.',
    '}',
  ].join('\n');

  protected readonly overviewHtml = '<gog-paginator [(page)]="page" [totalPages]="totalPages()" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `<gog-paginator [(page)]="page" [totalPages]="totalPages()" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly page = signal(1);',
    '  protected readonly totalPages = signal(20);',
    '}',
  ].join('\n');

  protected readonly windowModeHtml = [
    '<gog-paginator',
    '  [(page)]="page"',
    '  [totalPages]="totalPages()"',
    '  [visiblePages]="5"',
    '  [showFirstPage]="true"',
    '  [showLastPage]="true"',
    '/>',
  ].join('\n');
  protected readonly windowModeTs = [
    "import { Component, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `',
    '    <gog-paginator',
    '      [(page)]="page"',
    '      [totalPages]="totalPages()"',
    '      [visiblePages]="5"',
    '      [showFirstPage]="true"',
    '      [showLastPage]="true"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly page = signal(10);',
    '  protected readonly totalPages = signal(20);',
    '}',
  ].join('\n');

  protected readonly ellipsisModeHtml = [
    '<gog-paginator',
    '  [(page)]="page"',
    '  [totalPages]="totalPages()"',
    '  rangeMode="ellipsis"',
    '  [siblingCount]="1"',
    '/>',
  ].join('\n');
  protected readonly ellipsisModeTs = [
    "import { Component, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `',
    '    <gog-paginator',
    '      [(page)]="page"',
    '      [totalPages]="totalPages()"',
    '      rangeMode="ellipsis"',
    '      [siblingCount]="1"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly page = signal(10);',
    '  protected readonly totalPages = signal(20);',
    '}',
  ].join('\n');

  protected readonly sizesHtml = [
    '@for (sizeOption of sizes; track sizeOption) {',
    '  <gog-paginator [totalPages]="5" [page]="page()" [size]="sizeOption" />',
    '}',
  ].join('\n');
  protected readonly sizesTs = [
    "import { Component, signal } from '@angular/core';",
    "import { GogSize, PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `',
    '    @for (sizeOption of sizes; track sizeOption) {',
    '      <gog-paginator [totalPages]="5" [page]="page()" [size]="sizeOption" />',
    '    }',
    '  `,',
    '})',
    'export class ExampleComponent {',
    "  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];",
    '  protected readonly page = signal(2);',
    '}',
  ].join('\n');

  protected readonly fullWidthHtml = [
    '<gog-paginator [totalPages]="5" [page]="2" />',
    '<gog-paginator [totalPages]="5" [page]="2" [fullWidth]="false" />',
  ].join('\n');
  protected readonly fullWidthTs = [
    "import { Component } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `',
    '    <gog-paginator [totalPages]="5" [page]="2" />',
    '    <gog-paginator [totalPages]="5" [page]="2" [fullWidth]="false" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected readonly disabledHtml =
    '<gog-paginator [(page)]="page" [totalPages]="8" [disabled]="true" />';
  protected readonly disabledTs = [
    "import { Component, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `<gog-paginator [(page)]="page" [totalPages]="8" [disabled]="true" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly page = signal(3);',
    '}',
  ].join('\n');

  protected readonly listHtml = [
    '<ul>',
    '  @for (item of visibleItems(); track item) {',
    '    <li>{{ item }}</li>',
    '  }',
    '</ul>',
    '<gog-paginator [(page)]="page" [totalPages]="totalPages()" />',
  ].join('\n');
  protected readonly listTs = [
    "import { Component, computed, signal } from '@angular/core';",
    "import { PaginatorComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [PaginatorComponent],',
    '  template: `',
    '    <ul>',
    '      @for (item of visibleItems(); track item) {',
    '        <li>{{ item }}</li>',
    '      }',
    '    </ul>',
    '    <gog-paginator [(page)]="page" [totalPages]="totalPages()" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  private readonly pageSize = 4;',
    "  private readonly items = ['Apple', 'Banana', 'Cherry', /* ... */];",
    '  protected readonly page = signal(1);',
    '  protected readonly totalPages = computed(() =>',
    '    Math.max(1, Math.ceil(this.items.length / this.pageSize)),',
    '  );',
    '  protected readonly visibleItems = computed(() => {',
    '    const start = (this.page() - 1) * this.pageSize;',
    '    return this.items.slice(start, start + this.pageSize);',
    '  });',
    '}',
  ].join('\n');
}
