import { TextareaComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TEXTAREA_API: readonly DocApi[] = [
  {
    type: TextareaComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'placeholder', type: 'string', default: "''" },
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
      { name: 'readonly', type: 'boolean', default: 'false' },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
      { name: 'rows', type: 'number', default: '4' },
      { name: 'maxlength', type: 'number | null', default: 'null' },
      { name: 'minlength', type: 'number | null', default: 'null' },
      { name: 'spellcheck', type: 'boolean | null', default: 'null' },
      {
        name: 'resize',
        type: 'GogTextareaResize | undefined',
        default: "'vertical'",
        config: 'GOG_CONFIG.textarea.resize',
      },
      { name: 'fullWidth', type: 'boolean', default: 'true' },
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
];
