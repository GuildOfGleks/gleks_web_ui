import { GogMaskDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const MASK_API: readonly DocApi[] = [
  {
    type: GogMaskDirective,
    inputs: [
      { name: 'gogMask', type: 'GogMask | null (required)', default: '—' },
      { name: 'gogMaskTokens', type: 'GogMaskTokens', default: '{}' },
      { name: 'gogMaskValue', type: 'GogMaskValue', default: "'raw'" },
    ],
    outputs: [{ name: 'gogMaskChange', payload: 'GogMaskState' }],
  },
];
