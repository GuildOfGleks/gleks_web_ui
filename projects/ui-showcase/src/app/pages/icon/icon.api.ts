import { IconComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const ICON_API: readonly DocApi[] = [
  {
    type: IconComponent,
    inputs: [
      { name: 'name', type: 'GogIconName', default: "'close'" },
      { name: 'template', type: 'TemplateRef<unknown> | null', default: 'null' },
      { name: 'title', type: 'string', default: "''" },
      { name: 'ariaHidden', type: 'boolean', default: 'true' },
    ],
    outputs: [],
  },
];
