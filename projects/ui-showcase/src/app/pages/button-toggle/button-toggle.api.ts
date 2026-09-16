import { ButtonToggleGroupComponent, GogButtonToggleOptionDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const BUTTON_TOGGLE_API: readonly DocApi[] = [
  {
    type: ButtonToggleGroupComponent,
    inputs: [
      { name: 'options', type: 'TOption[]', default: '[]' },
      { name: 'optionLabel', type: 'GogOptionAccessor<TOption, string>', default: "'name'" },
      {
        name: 'optionValue',
        type: 'GogOptionAccessor<TOption, unknown> | null',
        default: "'id'",
      },
      {
        name: 'optionDisabled',
        type: 'GogOptionAccessor<TOption, boolean>',
        default: "'disabled'",
      },
      {
        name: 'optionIcon',
        type: 'GogOptionAccessor<TOption, GogIconName | null> | null',
        default: 'null',
      },
      { name: 'multiple', type: 'boolean', default: 'false' },
      { name: 'appearance', type: 'GogButtonToggleAppearance', default: "'joined'" },
      { name: 'orientation', type: 'GogOrientation', default: "'horizontal'" },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'value', type: 'TValue | TValue[] | null', default: 'null' },
    ],
    outputs: [{ name: 'valueChange', payload: 'TValue | TValue[] | null' }],
  },
  {
    type: GogButtonToggleOptionDirective,
    inputs: [],
    outputs: [],
  },
];
