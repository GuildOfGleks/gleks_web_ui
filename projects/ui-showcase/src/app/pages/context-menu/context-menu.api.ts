import {
  ContextMenuComponent,
  GogContextMenuContentDirective,
  GogContextMenuTriggerDirective,
} from '@guildofgleks/ui';

import type { DocApi } from '../../doc/doc-api';

export const CONTEXT_MENU_API: readonly DocApi[] = [
  {
    type: ContextMenuComponent,
    inputs: [{ name: 'ariaLabel', type: 'string', default: "''" }],
    outputs: [
      { name: 'gogOpened', payload: 'T | null' },
      { name: 'gogClosed', payload: 'void' },
    ],
  },
  {
    type: GogContextMenuTriggerDirective,
    inputs: [
      { name: 'gogContextMenu', type: 'ContextMenuComponent<T> (required)', default: '—' },
      { name: 'gogContextMenuData', type: 'T | null', default: 'null' },
      {
        name: 'gogContextMenuResolve',
        type: '((target: HTMLElement) => T | null | undefined) | null',
        default: 'null',
      },
      { name: 'gogContextMenuDisabled', type: 'boolean', default: 'false' },
    ],
    outputs: [],
  },
  {
    type: GogContextMenuContentDirective,
    inputs: [{ name: 'gogContextMenuContentTypeOf', type: 'readonly T[]', default: 'undefined' }],
    outputs: [],
  },
];
