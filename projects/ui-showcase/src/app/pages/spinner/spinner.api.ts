import { SpinnerComponent, SpinnerOverlayComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const SPINNER_API: readonly DocApi[] = [
  {
    type: SpinnerComponent,
    inputs: [
      { name: 'size', type: 'GogSize', default: "'md'" },
      {
        name: 'variant',
        type: 'GogSpinnerVariant | undefined',
        default: "'runic'",
        config: 'GOG_CONFIG.spinner.component, then GOG_CONFIG.spinner.variant',
      },
      { name: 'ariaLabel', type: 'string', default: "'Loading'" },
      { name: 'overlay', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
  {
    type: SpinnerOverlayComponent,
    inputs: [
      { name: 'loading', type: 'boolean', default: 'false' },
      { name: 'size', type: 'GogSize', default: "'md'" },
      {
        name: 'variant',
        type: 'GogSpinnerVariant | undefined',
        default: "'runic'",
        config: 'GOG_CONFIG.spinner.component, then GOG_CONFIG.spinner.variant',
      },
      { name: 'ariaLabel', type: 'string', default: "'Loading'" },
    ],
    outputs: [],
  },
];
