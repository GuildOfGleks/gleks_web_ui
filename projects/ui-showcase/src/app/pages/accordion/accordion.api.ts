import {
  AccordionComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

/**
 * The three directives go on an `<ng-template>` and declare nothing a template binds; what each
 * template receives as its context is on the page, in Content.
 */
export const ACCORDION_API: readonly DocApi[] = [
  {
    type: AccordionComponent,
    inputs: [
      { name: 'items', type: 'GogAccordionItem[]', default: '[]' },
      { name: 'size', type: 'GogSize', default: "'lg'" },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
      { name: 'expandFirst', type: 'boolean', default: 'false' },
      { name: 'multi', type: 'boolean', default: 'false' },
      { name: 'loading', type: 'boolean', default: 'false' },
      { name: 'skeletonCount', type: 'number', default: '3' },
      { name: 'showChevron', type: 'boolean', default: 'true' },
      { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6 | undefined', default: 'undefined' },
      { name: 'openIds', type: 'ReadonlySet<string | number> (model)', default: 'new Set()' },
    ],
    outputs: [
      { name: 'openIdsChange', payload: 'ReadonlySet<string | number>' },
      { name: 'gogToggle', payload: 'GogAccordionToggleEvent' },
    ],
  },
  { type: GogAccordionHeaderDirective, inputs: [], outputs: [] },
  { type: GogAccordionContentDirective, inputs: [], outputs: [] },
  { type: GogAccordionChevronDirective, inputs: [], outputs: [] },
];
