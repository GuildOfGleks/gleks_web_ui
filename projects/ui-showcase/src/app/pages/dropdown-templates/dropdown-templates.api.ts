import { GogDropdownChevronDirective, GogDropdownOptionDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

/**
 * Both directives are pure markers: they hold a `TemplateRef` for the host component to render
 * and declare nothing a template can bind. What a consumer writes is the context the row
 * template receives, which the page's Context section documents.
 */
export const DROPDOWN_TEMPLATES_API: readonly DocApi[] = [
  { type: GogDropdownOptionDirective, inputs: [], outputs: [] },
  { type: GogDropdownChevronDirective, inputs: [], outputs: [] },
];
