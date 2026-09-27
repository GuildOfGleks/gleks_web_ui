import { ConfirmationDialogComponent, DialogComponent } from '@guildofgleks/ui/dialog';

import type { DocApi } from '../../doc/doc-api';

/** Neither component has inputs: everything a dialog is comes from `DialogService.open(config)`. */
export const DIALOG_API: readonly DocApi[] = [
  { type: DialogComponent, inputs: [], outputs: [] },
  { type: ConfirmationDialogComponent, inputs: [], outputs: [] },
];

/** `DialogConfig`, the object `DialogService.open()` takes. Read against `dialog.service.ts`. */
export const DIALOG_CONFIG_ROWS: readonly {
  readonly name: string;
  readonly type: string;
  readonly default: string;
}[] = [
  { name: 'component', type: 'Type<unknown> (required)', default: '—' },
  { name: 'title', type: 'string', default: 'undefined — no heading, no aria-labelledby' },
  { name: 'data', type: 'TData', default: 'undefined — read with inject(DIALOG_DATA)' },
  { name: 'modal', type: 'boolean', default: 'true' },
  { name: 'closable', type: 'boolean', default: 'true' },
  { name: 'draggable', type: 'boolean', default: 'true — needs a header to drag by' },
  { name: 'role', type: "'dialog' | 'alertdialog'", default: "'dialog'" },
  { name: 'width', type: 'string', default: "'auto'" },
  { name: 'maxWidth', type: 'string', default: "'90vw'" },
  { name: 'closeIconName', type: 'GogIconName', default: "'close'" },
  { name: 'closeIconTemplate', type: 'TemplateRef<unknown> | null', default: 'null' },
  {
    name: 'closeAriaLabel',
    type: 'string',
    default: "GOG_CONFIG.labels.closeDialog, then 'Close dialog'",
  },
  { name: 'zIndex', type: 'number', default: '1000, then one higher per dialog' },
];
