import { ChipComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const CHIP_API: readonly DocApi[] = [
  {
    type: ChipComponent,
    inputs: [
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'shape', type: 'GogTagShape', default: "'rounded'" },
      { name: 'clickable', type: 'boolean', default: 'true' },
      { name: 'selected', type: 'boolean | null (model)', default: 'null' },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'removable', type: 'boolean', default: 'false' },
      { name: 'removeAriaLabel', type: 'string', default: "'Remove chip'" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'iconName', type: 'GogIconName | null', default: 'null' },
      { name: 'avatarUrl', type: 'string | null', default: 'null' },
      { name: 'avatarAlt', type: 'string', default: "''" },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
    ],
    outputs: [
      { name: 'gogClick', payload: 'MouseEvent | KeyboardEvent' },
      { name: 'selectedChange', payload: 'boolean | null' },
      { name: 'gogRemove', payload: 'void' },
    ],
  },
];
