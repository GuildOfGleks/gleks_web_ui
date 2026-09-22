import { ProgressbarComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const PROGRESSBAR_API: readonly DocApi[] = [
  {
    type: ProgressbarComponent,
    inputs: [
      { name: 'value', type: 'number (0–100, clamped)', default: '0' },
      { name: 'buffer', type: 'number (0–100, clamped)', default: '0' },
      { name: 'mode', type: 'GogProgressbarMode', default: "'determinate'" },
      { name: 'variant', type: 'GogProgressbarVariant', default: "'accent'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'showValue', type: 'boolean', default: 'false' },
      { name: 'ariaLabel', type: 'string', default: "''" },
    ],
    outputs: [],
  },
];
