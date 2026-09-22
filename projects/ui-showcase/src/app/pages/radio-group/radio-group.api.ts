import { RadioGroupComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const RADIO_GROUP_API: readonly DocApi[] = [
  {
    type: RadioGroupComponent,
    inputs: [
      { name: 'options', type: 'GogRadioOption[]', default: '[]' },
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'name', type: 'string', default: "'' (a unique name per instance)" },
      { name: 'value', type: 'string | number | null (model)', default: 'null' },
      { name: 'orientation', type: 'GogOrientation', default: "'vertical'" },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      { name: 'errorMessage', type: 'string', default: "''" },
      {
        name: 'errorDisplay',
        type: 'GogErrorDisplay | undefined',
        default: "'manual'",
        config: 'GOG_CONFIG.control.errorDisplay',
      },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
    ],
    outputs: [{ name: 'valueChange', payload: 'string | number | null' }],
  },
];
