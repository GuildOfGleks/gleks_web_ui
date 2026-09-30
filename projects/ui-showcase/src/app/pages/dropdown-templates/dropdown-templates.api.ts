import { GogDropdownChevronDirective, GogDropdownOptionDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

/**
 * Both directives hold a `TemplateRef` for the host component to render. The option directive's
 * one input only types the row's context and is never read at runtime.
 */
export const DROPDOWN_TEMPLATES_API: readonly DocApi[] = [
  {
    type: GogDropdownOptionDirective,
    inputs: [
      {
        name: 'gogDropdownOptionTypeOf',
        type: 'readonly TOption[] | undefined',
        default: 'undefined',
      },
    ],
    outputs: [],
  },
  { type: GogDropdownChevronDirective, inputs: [], outputs: [] },
];
