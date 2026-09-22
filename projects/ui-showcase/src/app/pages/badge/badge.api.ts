import { GogBadgeDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const BADGE_API: readonly DocApi[] = [
  {
    type: GogBadgeDirective,
    inputs: [
      { name: 'gogBadge', type: 'string | number | null', default: 'null' },
      { name: 'badgeVariant', type: 'GogTagVariant', default: "'danger'" },
      { name: 'badgePosition', type: 'GogBadgePosition', default: "'top-end'" },
      { name: 'badgeDot', type: 'boolean', default: 'false' },
      { name: 'badgeMax', type: 'number', default: '99' },
      { name: 'badgeHidden', type: 'boolean', default: 'false' },
      { name: 'badgeAriaLabel', type: 'string', default: "''" },
    ],
    outputs: [],
  },
];
