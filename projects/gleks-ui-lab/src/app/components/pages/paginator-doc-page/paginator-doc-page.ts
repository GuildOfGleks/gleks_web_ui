import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { PAGINATOR_EXAMPLES } from '../../../examples/paginator/sources.generated';
import { PaginatorConfigExample } from '../../../examples/paginator/paginator-config/example';
import { PaginatorOverviewExample } from '../../../examples/paginator/paginator-overview/example';
import { PaginatorRangesExample } from '../../../examples/paginator/paginator-ranges/example';
import { PaginatorRecordsExample } from '../../../examples/paginator/paginator-records/example';
import { PaginatorShrinkExample } from '../../../examples/paginator/paginator-shrink/example';
import { PaginatorSizesExample } from '../../../examples/paginator/paginator-sizes/example';
import { PaginatorStatesExample } from '../../../examples/paginator/paginator-states/example';
import { PaginatorWidthExample } from '../../../examples/paginator/paginator-width/example';

const API_INPUTS: readonly ApiRow[] = [
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
    type: 'readonly number[] | undefined',
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

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'pageChange',
    type: 'number',
    description:
      'The new page, on a press — and when a shrinking page count pulls the page back. Comes from the page model input.',
  },
  {
    name: 'pageSizeChange',
    type: 'number',
    description:
      'The new page size, from the rows-per-page select. Comes from the pageSize model input.',
  },
];

@Component({
  selector: 'app-paginator-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './paginator-doc-page.html',
  styleUrl: './paginator-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'paginator')?.tokens ?? [];

  protected readonly sources = PAGINATOR_EXAMPLES;
  protected readonly examples = {
    overview: PaginatorOverviewExample,
    sizes: PaginatorSizesExample,
    states: PaginatorStatesExample,
    ranges: PaginatorRangesExample,
    records: PaginatorRecordsExample,
    shrink: PaginatorShrinkExample,
    width: PaginatorWidthExample,
    config: PaginatorConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { PaginatorComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [PaginatorComponent],\n})\n```";
}
