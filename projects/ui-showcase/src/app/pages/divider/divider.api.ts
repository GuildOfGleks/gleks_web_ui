import { DividerComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const DIVIDER_API: readonly DocApi[] = [
  {
    type: DividerComponent,
    inputs: [
      { name: 'orientation', type: 'GogOrientation', default: "'horizontal'" },
      { name: 'variant', type: 'GogDividerVariant', default: "'solid'" },
      { name: 'inset', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
];
