import { GogPanelFooterDirective, GogPanelHeaderDirective, PanelComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

/** The two directives mark where projected content goes and declare nothing a template binds. */
export const PANEL_API: readonly DocApi[] = [
  {
    type: PanelComponent,
    inputs: [
      { name: 'variant', type: 'GogSurfaceVariant', default: "'elevated'" },
      { name: 'size', type: 'GogSize', default: "'lg'" },
      { name: 'collapsible', type: 'boolean (booleanAttribute)', default: 'false' },
      { name: 'open', type: 'boolean (model)', default: 'true' },
      { name: 'disabled', type: 'boolean (booleanAttribute)', default: 'false' },
      { name: 'loading', type: 'boolean (booleanAttribute)', default: 'false' },
      { name: 'skeletonLines', type: 'number', default: '3' },
    ],
    outputs: [{ name: 'openChange', payload: 'boolean' }],
  },
  { type: GogPanelHeaderDirective, inputs: [], outputs: [] },
  { type: GogPanelFooterDirective, inputs: [], outputs: [] },
];
