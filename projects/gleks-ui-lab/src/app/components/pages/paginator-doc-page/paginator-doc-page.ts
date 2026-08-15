import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogSize } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { PAGINATOR_EXAMPLE_SOURCES } from '../../../examples/paginator/sources.generated';
import { PaginatorDisabledExample } from '../../../examples/paginator/paginator-disabled/example';
import { PaginatorEllipsisModeExample } from '../../../examples/paginator/paginator-ellipsis-mode/example';
import { PaginatorFullWidthExample } from '../../../examples/paginator/paginator-full-width/example';
import { PaginatorListExample } from '../../../examples/paginator/paginator-list/example';
import { PaginatorOverviewExample } from '../../../examples/paginator/paginator-overview/example';
import { PaginatorRecordsExample } from '../../../examples/paginator/paginator-records/example';
import { PaginatorSizesExample } from '../../../examples/paginator/paginator-sizes/example';
import { PaginatorWindowModeExample } from '../../../examples/paginator/paginator-window-mode/example';

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

@Component({
  selector: 'app-paginator-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  providers: [provideExampleSources(PAGINATOR_EXAMPLE_SOURCES)],
  templateUrl: './paginator-doc-page.html',
  styleUrl: './paginator-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorDocPage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly apiInputs = API_INPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'paginator')?.tokens ?? [];

  protected readonly windowPage = signal(10);
  protected readonly windowTotalPages = signal(20);

  protected readonly ellipsisPage = signal(10);
  protected readonly ellipsisTotalPages = signal(20);

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
  protected readonly importSnippet =
    "```typescript\nimport { PaginatorComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [PaginatorComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/paginator/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    disabled: PaginatorDisabledExample,
    ellipsisMode: PaginatorEllipsisModeExample,
    fullWidth: PaginatorFullWidthExample,
    list: PaginatorListExample,
    overview: PaginatorOverviewExample,
    records: PaginatorRecordsExample,
    sizes: PaginatorSizesExample,
    windowMode: PaginatorWindowModeExample,
  };
}
