import { GogTagIconDirective, TagComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TAG_API: readonly DocApi[] = [
  {
    type: TagComponent,
    inputs: [
      { name: 'variant', type: 'GogTagVariant', default: "'info'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'shape', type: 'GogTagShape', default: "'rounded'" },
      { name: 'iconName', type: 'GogIconName | null', default: 'null' },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
  { type: GogTagIconDirective, inputs: [], outputs: [] },
];
