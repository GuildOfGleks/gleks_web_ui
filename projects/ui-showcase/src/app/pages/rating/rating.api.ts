import { RatingComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const RATING_API: readonly DocApi[] = [
  {
    type: RatingComponent,
    inputs: [
      { name: 'value', type: 'number | null (model)', default: 'null (not rated)' },
      { name: 'max', type: 'number', default: '5' },
      { name: 'readonly', type: 'boolean', default: 'false' },
      { name: 'clearable', type: 'boolean', default: 'false' },
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'errorMessage', type: 'string', default: "''" },
      {
        name: 'errorDisplay',
        type: 'GogErrorDisplay | undefined',
        default: "'manual'",
        config: 'GOG_CONFIG.control.errorDisplay',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
    ],
    outputs: [{ name: 'valueChange', payload: 'number | null' }],
  },
];
