import { ToggleComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TOGGLE_API: readonly DocApi[] = [
  {
    type: ToggleComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'checked', type: 'boolean (model)', default: 'false' },
      { name: 'labelPosition', type: "'start' | 'end'", default: "'end'" },
      { name: 'onLabel', type: 'string', default: "''" },
      { name: 'offLabel', type: 'string', default: "''" },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
    ],
    outputs: [{ name: 'checkedChange', payload: 'boolean' }],
  },
];
