import {
  GogTabContentDirective,
  GogTabHeaderDirective,
  TabComponent,
  TabsComponent,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TABS_API: readonly DocApi[] = [
  {
    type: TabsComponent,
    inputs: [
      { name: 'activeIndex', type: 'number (model)', default: '0' },
      { name: 'align', type: 'GogTabsAlign', default: "'start'" },
      { name: 'orientation', type: 'GogOrientation', default: "'horizontal'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      { name: 'ariaLabel', type: 'string', default: "''" },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
      { name: 'scrollActiveIntoView', type: 'boolean', default: 'true' },
      {
        name: 'showScrollTrack',
        type: 'boolean | undefined',
        default: '!scrollActiveIntoView',
      },
    ],
    outputs: [
      { name: 'activeIndexChange', payload: 'number' },
      { name: 'gogTabChange', payload: 'number' },
    ],
  },
  {
    type: TabComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'iconName', type: 'GogIconName | null', default: 'null' },
      { name: 'disabled', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
  { type: GogTabHeaderDirective, inputs: [], outputs: [] },
  { type: GogTabContentDirective, inputs: [], outputs: [] },
];
