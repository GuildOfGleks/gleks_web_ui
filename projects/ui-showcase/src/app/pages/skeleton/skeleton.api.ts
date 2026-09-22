import { SkeletonComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const SKELETON_API: readonly DocApi[] = [
  {
    type: SkeletonComponent,
    inputs: [
      { name: 'shape', type: 'GogSkeletonShape', default: "'text'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'animation', type: 'GogSkeletonAnimation', default: "'pulse'" },
      { name: 'lines', type: 'number', default: '1' },
      { name: 'width', type: 'string | null', default: 'null' },
      { name: 'height', type: 'string | null', default: 'null' },
      { name: 'rounded', type: 'boolean', default: 'true' },
      { name: 'ariaLabel', type: 'string | null', default: 'null' },
    ],
    outputs: [],
  },
];
