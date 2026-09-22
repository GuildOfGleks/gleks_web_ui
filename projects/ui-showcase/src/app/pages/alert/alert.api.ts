import { AlertComponent, GogAlertIconDirective } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const ALERT_API: readonly DocApi[] = [
  {
    type: AlertComponent,
    inputs: [
      { name: 'severity', type: 'GogSeverity', default: "'accent'" },
      { name: 'heading', type: 'string | undefined', default: 'undefined' },
      { name: 'dismissible', type: 'boolean', default: 'false' },
      {
        name: 'iconName',
        type: 'GogIconName | null | undefined',
        default: 'undefined (from severity)',
      },
      {
        name: 'live',
        type: 'GogAlertLive | undefined',
        default: "undefined ('assertive' for danger and warning, else 'polite')",
      },
    ],
    outputs: [{ name: 'dismissed', payload: 'void' }],
  },
  { type: GogAlertIconDirective, inputs: [], outputs: [] },
];
