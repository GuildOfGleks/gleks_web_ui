import { StepperComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const STEPPER_API: readonly DocApi[] = [
  {
    type: StepperComponent,
    inputs: [
      { name: 'steps', type: 'readonly GogStep[]', default: '[]' },
      { name: 'activeIndex', type: 'number (model)', default: '0' },
      { name: 'linear', type: 'boolean', default: 'true' },
      { name: 'orientation', type: 'GogOrientation', default: "'horizontal'" },
      { name: 'size', type: 'GogSize', default: "'md'" },
      {
        name: 'ariaLabel',
        type: 'string | undefined',
        default: "undefined ('Progress', GOG_CONFIG.labels.stepper)",
      },
    ],
    outputs: [{ name: 'activeIndexChange', payload: 'number' }],
  },
];
