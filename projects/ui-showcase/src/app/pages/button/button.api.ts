import { ButtonComponent, GogButtonDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const BUTTON_API: readonly DocApi[] = [
  {
    type: ButtonComponent,
    inputs: [
      { name: 'variant', type: 'GogVariant', default: "'primary'" },
      { name: 'severity', type: 'GogSeverity', default: "'accent'" },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'fullWidth', type: 'boolean', default: 'false' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'" },
      { name: 'loading', type: 'boolean', default: 'false' },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
      {
        name: 'debounce',
        type: 'number | undefined',
        default: '300',
        config: 'GOG_CONFIG.button.debounce',
      },
      { name: 'ariaLabel', type: 'string | null', default: 'null' },
      { name: 'ariaPressed', type: "boolean | 'mixed' | null", default: 'null' },
      { name: 'ariaExpanded', type: 'boolean | null', default: 'null' },
      { name: 'ariaControls', type: 'string | null', default: 'null' },
      { name: 'ariaHasPopup', type: 'GogAriaHasPopup | null', default: 'null' },
    ],
    outputs: [{ name: 'gogClick', payload: 'MouseEvent' }],
  },
  {
    type: GogButtonDirective,
    inputs: [
      { name: 'variant', type: 'GogVariant', default: "'primary'" },
      { name: 'severity', type: 'GogSeverity', default: "'accent'" },
      {
        name: 'size',
        type: 'GogSize | undefined',
        default: "'md'",
        config: 'GOG_CONFIG.control.size',
      },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
      { name: 'fullWidth', type: 'boolean (booleanAttribute)', default: 'false' },
    ],
    outputs: [],
  },
];
