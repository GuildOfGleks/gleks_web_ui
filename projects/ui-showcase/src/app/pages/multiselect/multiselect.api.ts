import { GogMultiselectClearIconDirective, MultiselectComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const MULTISELECT_API: readonly DocApi[] = [
  {
    type: MultiselectComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'placeholder', type: 'string', default: "'Select...'" },
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
      { name: 'value', type: 'TValue[] (model)', default: '[]' },
      {
        name: 'clearable',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.control.clearable',
      },
      {
        name: 'clearAriaLabel',
        type: 'string | undefined',
        default: "'Clear selection'",
        config: 'GOG_CONFIG.labels.clearSelection',
      },
      { name: 'showControls', type: 'boolean', default: 'false' },
      { name: 'controlsPosition', type: "'top' | 'bottom'", default: "'top'" },
      {
        name: 'selectAllLabel',
        type: 'string | undefined',
        default: "'Select all'",
        config: 'GOG_CONFIG.labels.selectAll',
      },
      {
        name: 'clearAllLabel',
        type: 'string | undefined',
        default: "'Clear'",
        config: 'GOG_CONFIG.labels.clearAll',
      },
      {
        name: 'filter',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.dropdown.filter',
      },
      { name: 'filterPlaceholder', type: 'string', default: "'Search...'" },
      {
        name: 'filterPosition',
        type: 'GogDropdownFilterPosition | undefined',
        default: "'top'",
        config: 'GOG_CONFIG.dropdown.filterPosition',
      },
      { name: 'filterEmptyMessage', type: 'string', default: "'No matches'" },
      {
        name: 'filterMatch',
        type: '((option: TOption, query: string) => boolean) | null',
        default: 'null',
      },
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
      { name: 'fullWidth', type: 'boolean', default: 'true' },
      { name: 'minWidth', type: 'string | null', default: 'null' },
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
      {
        name: 'dropdownDirection',
        type: 'GogDropdownDirection | undefined',
        default: "'auto'",
        config: 'GOG_CONFIG.dropdown.direction',
      },
      { name: 'dropdownWidth', type: 'string | null', default: 'null' },
      { name: 'dropdownMaxHeight', type: 'string | null', default: 'null' },
      { name: 'dropdownZIndex', type: 'number | null', default: 'null' },
      {
        name: 'appendToBody',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.dropdown.appendToBody',
      },
      {
        name: 'virtualize',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.dropdown.virtualize',
      },
      {
        name: 'ripple',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.ripple.enabled',
      },
    ],
    outputs: [{ name: 'valueChange', payload: 'TValue[]' }],
  },
  {
    type: GogMultiselectClearIconDirective,
    inputs: [],
    outputs: [],
  },
];
