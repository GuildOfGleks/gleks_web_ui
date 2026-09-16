import {
  GogInputAddonEndDirective,
  GogInputAddonStartDirective,
  InputfieldComponent,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const INPUTFIELD_API: readonly DocApi[] = [
  {
    type: InputfieldComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'placeholder', type: 'string', default: "''" },
      { name: 'type', type: 'GogInputType', default: "'text'" },
      { name: 'autocomplete', type: 'string', default: "''" },
      { name: 'readonly', type: 'boolean', default: 'false' },
      { name: 'maxlength', type: 'number | null', default: 'null' },
      { name: 'minlength', type: 'number | null', default: 'null' },
      { name: 'pattern', type: 'string', default: "''" },
      { name: 'inputMode', type: 'GogInputMode | null', default: 'null' },
      { name: 'spellcheck', type: 'boolean | null', default: 'null' },
      { name: 'min', type: 'number | null', default: 'null' },
      { name: 'max', type: 'number | null', default: 'null' },
      { name: 'step', type: 'number | null', default: 'null' },
      {
        name: 'showSpinButtons',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.inputfield.showSpinButtons',
      },
      {
        name: 'incrementLabel',
        type: 'string | undefined',
        default: "'Increment'",
        config: 'GOG_CONFIG.labels.increment',
      },
      {
        name: 'decrementLabel',
        type: 'string | undefined',
        default: "'Decrement'",
        config: 'GOG_CONFIG.labels.decrement',
      },
      { name: 'errorMessage', type: 'string', default: "''" },
      {
        name: 'errorDisplay',
        type: 'GogErrorDisplay | undefined',
        default: "'manual'",
        config: 'GOG_CONFIG.control.errorDisplay',
      },
      { name: 'name', type: 'string', default: "''" },
      { name: 'inputId', type: 'string', default: "''" },
      { name: 'disabled', type: 'boolean', default: 'false' },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
      { name: 'fullWidth', type: 'boolean', default: 'true' },
      { name: 'iconStart', type: "GogIconName | ''", default: "''" },
      { name: 'iconEnd', type: "GogIconName | ''", default: "''" },
      {
        name: 'showPasswordLabel',
        type: 'string | undefined',
        default: "'Show password'",
        config: 'GOG_CONFIG.labels.showPassword',
      },
      {
        name: 'hidePasswordLabel',
        type: 'string | undefined',
        default: "'Hide password'",
        config: 'GOG_CONFIG.labels.hidePassword',
      },
      {
        name: 'clearable',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.control.clearable',
      },
      {
        name: 'clearAriaLabel',
        type: 'string | undefined',
        default: "'Clear'",
        config: 'GOG_CONFIG.labels.clear',
      },
      {
        name: 'floatLabel',
        type: 'GogFloatLabelVariant | undefined',
        default: "'none'",
        config: 'GOG_CONFIG.floatLabel.variant',
      },
      {
        name: 'floatLabelShowPlaceholder',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.floatLabel.showPlaceholder',
      },
      { name: 'value', type: 'string', default: "''" },
    ],
    outputs: [{ name: 'valueChange', payload: 'string' }],
  },
  {
    type: GogInputAddonStartDirective,
    inputs: [],
    outputs: [],
  },
  {
    type: GogInputAddonEndDirective,
    inputs: [],
    outputs: [],
  },
];
