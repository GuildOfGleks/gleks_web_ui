import { CheckboxComponent, GogCheckboxIconDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const CHECKBOX_API: readonly DocApi[] = [
  {
    type: CheckboxComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'checked', type: 'boolean (model)', default: 'false' },
      { name: 'indeterminate', type: 'boolean', default: 'false' },
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
  { type: GogCheckboxIconDirective, inputs: [], outputs: [] },
];
