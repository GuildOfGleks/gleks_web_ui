import { BreadcrumbsComponent, GogBreadcrumbDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const BREADCRUMBS_API: readonly DocApi[] = [
  {
    type: BreadcrumbsComponent,
    inputs: [
      { name: 'maxItems', type: 'number | null', default: 'null (never collapse)' },
      { name: 'itemsBefore', type: 'number', default: '1' },
      { name: 'itemsAfter', type: 'number', default: '2' },
      { name: 'separatorIcon', type: 'GogIconName', default: "'chevron-right'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      {
        name: 'ariaLabel',
        type: 'string | undefined',
        default: "undefined ('Breadcrumb', GOG_CONFIG.labels.breadcrumbs)",
      },
    ],
    outputs: [],
  },
  { type: GogBreadcrumbDirective, inputs: [], outputs: [] },
];
