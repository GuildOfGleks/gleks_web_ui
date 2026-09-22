import { GogRippleDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const RIPPLE_API: readonly DocApi[] = [
  {
    type: GogRippleDirective,
    inputs: [
      { name: 'rippleDisabled', type: 'boolean', default: 'false' },
      { name: 'rippleCentred', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
];
