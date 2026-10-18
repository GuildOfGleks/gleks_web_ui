import { GogPopoverTriggerDirective, PopoverComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const POPOVER_API: readonly DocApi[] = [
  {
    type: PopoverComponent,
    inputs: [
      { name: 'direction', type: 'GogDropdownDirection', default: "'auto'" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'ariaLabelledby', type: 'string', default: "''" },
    ],
    outputs: [
      { name: 'gogOpened', payload: 'void' },
      { name: 'gogClosed', payload: 'void' },
    ],
  },
  {
    type: GogPopoverTriggerDirective,
    inputs: [{ name: 'gogPopoverTrigger', type: 'PopoverComponent (required)', default: '—' }],
    outputs: [],
  },
];
