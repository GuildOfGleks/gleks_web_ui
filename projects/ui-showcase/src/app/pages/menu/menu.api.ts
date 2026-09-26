import { GogMenuItemDirective, GogMenuTriggerDirective, MenuComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const MENU_API: readonly DocApi[] = [
  {
    type: MenuComponent,
    inputs: [
      { name: 'direction', type: 'GogDropdownDirection', default: "'auto'" },
      { name: 'ariaLabel', type: 'string', default: "''" },
    ],
    outputs: [{ name: 'gogClosed', payload: 'void' }],
  },
  {
    type: GogMenuTriggerDirective,
    inputs: [{ name: 'gogMenuTrigger', type: 'MenuComponent (required)', default: '—' }],
    outputs: [],
  },
  {
    type: GogMenuItemDirective,
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
];
