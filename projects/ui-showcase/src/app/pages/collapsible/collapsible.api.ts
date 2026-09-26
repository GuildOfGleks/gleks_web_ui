import {
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const COLLAPSIBLE_API: readonly DocApi[] = [
  {
    type: CollapsibleComponent,
    inputs: [
      { name: 'open', type: 'boolean (model)', default: 'false' },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'collapseOnFocusOut', type: 'boolean', default: 'false' },
    ],
    outputs: [{ name: 'openChange', payload: 'boolean' }],
  },
  {
    type: GogCollapsibleTriggerDirective,
    inputs: [
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
    ],
    outputs: [],
  },
  { type: GogCollapsibleContentDirective, inputs: [], outputs: [] },
];
