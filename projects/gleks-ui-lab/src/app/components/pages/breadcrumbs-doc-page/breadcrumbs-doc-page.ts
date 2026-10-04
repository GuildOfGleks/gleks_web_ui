import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { BREADCRUMBS_EXAMPLES } from '../../../examples/breadcrumbs/sources.generated';
import { BreadcrumbsOverviewExample } from '../../../examples/breadcrumbs/breadcrumbs-overview/example';
import { BreadcrumbsSizesExample } from '../../../examples/breadcrumbs/breadcrumbs-sizes/example';
import { BreadcrumbsCollapseExample } from '../../../examples/breadcrumbs/breadcrumbs-collapse/example';
import { BreadcrumbsSeparatorExample } from '../../../examples/breadcrumbs/breadcrumbs-separator/example';
import { BreadcrumbsRtlExample } from '../../../examples/breadcrumbs/breadcrumbs-rtl/example';
import { BreadcrumbsNarrowExample } from '../../../examples/breadcrumbs/breadcrumbs-narrow/example';

const BREADCRUMBS_INPUTS: readonly ApiRow[] = [
  {
    name: 'maxItems',
    type: 'number | null',
    default: 'null',
    description:
      'Past this many items the middle collapses into a … button. Unset, the trail never collapses.',
  },
  {
    name: 'itemsBefore',
    type: 'number',
    default: '1',
    description: 'Items kept before the … while collapsed.',
  },
  {
    name: 'itemsAfter',
    type: 'number',
    default: '2',
    description: 'Items kept after it — the current page and its parent.',
  },
  {
    name: 'separatorIcon',
    type: 'GogIconName',
    default: "'chevron-right'",
    description: 'Drawn between items, and mirrored under dir="rtl".',
  },
  {
    name: 'size',
    type: 'GogSize',
    default: "'md'",
    description: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'.",
  },
  {
    name: 'ariaLabel',
    type: 'string | undefined',
    default: 'undefined',
    description: 'Names the landmark. Unset, GOG_CONFIG.labels.breadcrumbs, then "Breadcrumb".',
  },
];

const BREADCRUMBS_DIRECTIVES: readonly ApiRow[] = [
  {
    name: '*gogBreadcrumb',
    type: 'your <a> or <span>',
    description:
      'One item. Structural, so the trail receives a template and can stamp each item in its own <li> and leave the middle out while collapsed; the element stays yours.',
  },
];

@Component({
  selector: 'app-breadcrumbs-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './breadcrumbs-doc-page.html',
  styleUrl: './breadcrumbs-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsDocPage {
  protected readonly breadcrumbsInputs = BREADCRUMBS_INPUTS;
  protected readonly breadcrumbsDirectives = BREADCRUMBS_DIRECTIVES;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'breadcrumbs')?.tokens ?? [];

  protected readonly sources = BREADCRUMBS_EXAMPLES;
  protected readonly examples = {
    overview: BreadcrumbsOverviewExample,
    sizes: BreadcrumbsSizesExample,
    collapse: BreadcrumbsCollapseExample,
    separator: BreadcrumbsSeparatorExample,
    rtl: BreadcrumbsRtlExample,
    narrow: BreadcrumbsNarrowExample,
  };

  protected readonly importSnippet = [
    '```typescript',
    "import { BreadcrumbsComponent, GogBreadcrumbDirective } from '@guildofgleks/ui';",
    '',
    '@Component({',
    '  // ...',
    '  imports: [BreadcrumbsComponent, GogBreadcrumbDirective],',
    '})',
    '```',
  ].join('\n');
}
