import { GogTooltipDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TOOLTIP_API: readonly DocApi[] = [
  {
    type: GogTooltipDirective,
    inputs: [
      { name: 'gogTooltip', type: 'string | TemplateRef<unknown> | null', default: 'null' },
      {
        name: 'gogTooltipPosition',
        type: 'GogTooltipPosition | undefined',
        default: "'auto'",
        config: 'GOG_CONFIG.tooltip.position',
      },
      {
        name: 'gogTooltipShowDelay',
        type: 'number | undefined',
        default: '300',
        config: 'GOG_CONFIG.tooltip.showDelay',
      },
      {
        name: 'gogTooltipHideDelay',
        type: 'number | undefined',
        default: '100',
        config: 'GOG_CONFIG.tooltip.hideDelay',
      },
      { name: 'gogTooltipDisabled', type: 'boolean', default: 'false' },
      { name: 'gogTooltipClass', type: 'string', default: "''" },
    ],
    outputs: [],
  },
];
