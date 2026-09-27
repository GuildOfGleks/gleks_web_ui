import { ToastComponent, ToastContainerComponent } from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const TOAST_API: readonly DocApi[] = [
  {
    type: ToastComponent,
    inputs: [
      { name: 'toast', type: 'Toast (required)', default: '—' },
      { name: 'isFront', type: 'boolean', default: 'true' },
    ],
    outputs: [{ name: 'dismissed', payload: 'string — the toast id' }],
  },
  {
    type: ToastContainerComponent,
    inputs: [{ name: 'maxVisiblePerPosition', type: 'number', default: '5' }],
    outputs: [],
  },
];

/** `ToastConfig`, the object `ToastService.show()` takes. Read against `toast-service.ts`. */
export const TOAST_CONFIG_ROWS: readonly {
  readonly name: string;
  readonly type: string;
  readonly default: string;
}[] = [
  { name: 'message', type: 'string (required)', default: '—' },
  { name: 'type', type: 'ToastType', default: "'info'" },
  { name: 'iconName', type: 'GogIconName', default: "the type's own glyph" },
  { name: 'iconTemplate', type: 'TemplateRef<unknown> | null', default: 'null' },
  { name: 'actions', type: 'ToastAction[]', default: '[]' },
  { name: 'isSticky', type: 'boolean', default: 'false' },
  { name: 'duration', type: 'number', default: 'GOG_CONFIG.toast.duration, then 4000' },
  {
    name: 'position',
    type: 'ToastPosition',
    default: "GOG_CONFIG.toast.position, then 'bottom-right'",
  },
  {
    name: 'dedupeKey',
    type: 'string',
    default: 'derived from message, type, icon, position and action labels',
  },
];
