import { AutocompleteComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const AUTOCOMPLETE_API: readonly DocApi[] = [
  {
    type: AutocompleteComponent,
    inputs: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'ariaLabel', type: 'string', default: "''" },
      { name: 'placeholder', type: 'string', default: "'Select...'" },
      { name: 'inputId', type: 'string', default: "''" },
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
      { name: 'value', type: 'TValue (model)', default: 'null' },
      { name: 'filterLocal', type: 'boolean', default: 'true' },
      {
        name: 'filterMatch',
        type: '((option: TOption, query: string) => boolean) | null',
        default: 'null',
      },
      { name: 'emptyMessage', type: 'string', default: "'No matches'" },
      {
        name: 'minLength',
        type: 'number | undefined',
        default: '1',
        config: 'GOG_CONFIG.autocomplete.minLength',
      },
      {
        name: 'openOnFocus',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.autocomplete.openOnFocus',
      },
      {
        name: 'searchDebounce',
        type: 'number | undefined',
        default: '300',
        config: 'GOG_CONFIG.autocomplete.searchDebounce',
      },
      { name: 'forceSelection', type: 'boolean', default: 'true' },
      { name: 'loading', type: 'boolean', default: 'false' },
      {
        name: 'clearable',
        type: 'boolean | undefined',
        default: 'false',
        config: 'GOG_CONFIG.control.clearable',
      },
      {
        name: 'clearAriaLabel',
        type: 'string | undefined',
        default: "'Clear selection'",
        config: 'GOG_CONFIG.labels.clearSelection',
      },
      // The four rows below are inherited from GogDropdownBase and read by nothing here: this
      // panel has no search box, because the trigger is one. See the Options section.
      {
        name: 'filter',
        type: 'boolean | undefined',
        default: 'false (inert)',
        config: 'GOG_CONFIG.dropdown.filter',
      },
      { name: 'filterPlaceholder', type: 'string', default: "'Search...' (inert)" },
      {
        name: 'filterPosition',
        type: 'GogDropdownFilterPosition | undefined',
        default: "'top' (inert)",
        config: 'GOG_CONFIG.dropdown.filterPosition',
      },
      { name: 'filterEmptyMessage', type: 'string', default: "'No matches' (inert)" },
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
    outputs: [
      { name: 'valueChange', payload: 'TValue' },
      { name: 'gogSearch', payload: 'string (the query, debounced)' },
      { name: 'gogLoadMore', payload: 'void' },
    ],
  },
];
