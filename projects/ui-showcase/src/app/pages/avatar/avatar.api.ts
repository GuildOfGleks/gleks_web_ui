import { AvatarComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const AVATAR_API: readonly DocApi[] = [
  {
    type: AvatarComponent,
    inputs: [
      { name: 'src', type: 'string | null', default: 'null' },
      { name: 'name', type: 'string', default: "''" },
      { name: 'initials', type: 'string | undefined', default: 'undefined (from name)' },
      { name: 'iconName', type: 'GogIconName', default: "'user'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'shape', type: 'GogAvatarShape', default: "'circle'" },
      { name: 'decorative', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
];
