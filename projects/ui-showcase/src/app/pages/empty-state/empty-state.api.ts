import {
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  GogEmptyStateMediaDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const EMPTY_STATE_API: readonly DocApi[] = [
  {
    type: EmptyStateComponent,
    inputs: [
      { name: 'heading', type: 'string', default: "''" },
      {
        name: 'headingLevel',
        type: 'GogEmptyStateHeadingLevel | null',
        default: 'null (styled text, not a heading)',
      },
      { name: 'iconName', type: 'GogIconName | null', default: 'null' },
      { name: 'live', type: "'polite' | 'off'", default: "'polite'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
    ],
    outputs: [],
  },
  { type: GogEmptyStateMediaDirective, inputs: [], outputs: [] },
  { type: GogEmptyStateActionsDirective, inputs: [], outputs: [] },
];
