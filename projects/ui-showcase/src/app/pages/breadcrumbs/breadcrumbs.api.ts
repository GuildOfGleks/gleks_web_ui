import {
  BreadcrumbsComponent,
  GogBreadcrumbDirective,
  GogBreadcrumbItemDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const BREADCRUMBS_API: readonly DocApi[] = [
  {
    type: BreadcrumbsComponent,
    inputs: [
      { name: 'items', type: 'readonly T[]', default: '[] (use *gogBreadcrumb)' },
      { name: 'itemLabel', type: 'GogOptionAccessor<T, string>', default: "'label'" },
      {
        name: 'itemHref',
        type: 'GogOptionAccessor<T, string | null | undefined>',
        default: "'href'",
      },
      {
        name: 'itemIcon',
        type: 'GogOptionAccessor<T, GogIconName | null | undefined>',
        default: "'icon'",
      },
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
    outputs: [{ name: 'gogItemClick', payload: 'GogBreadcrumbClick<T>' }],
  },
  { type: GogBreadcrumbDirective, inputs: [], outputs: [] },
  {
    type: GogBreadcrumbItemDirective,
    inputs: [{ name: 'gogBreadcrumbItemTypeOf', type: 'readonly T[]', default: 'undefined' }],
    outputs: [],
  },
];
