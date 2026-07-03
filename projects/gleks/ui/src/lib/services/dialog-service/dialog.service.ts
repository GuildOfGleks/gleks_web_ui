import { Injectable, signal, Type } from '@angular/core';

export interface DialogConfig {
  title?: string;
  component: Type<unknown>;
  data?: unknown;
  modal?: boolean;
  closable?: boolean;
  width?: string;
  maxWidth?: string;
  /** ARIA role for the dialog panel. Use 'alertdialog' for confirmation prompts. Default: 'dialog' */
  role?: 'dialog' | 'alertdialog';
  /** z-index of the dialog backdrop. Dropdowns inside get zIndex+10. Default: 1000 */
  zIndex?: number;
}

export interface DialogHandle<TResult = unknown> {
  close(result?: TResult): void;
  readonly afterClosed: Promise<TResult | undefined>;
}

export interface OpenDialog {
  id: number;
  config: DialogConfig;
  resolve: (result: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly dialogs = signal<OpenDialog[]>([]);
  private nextId = 0;

  open<TResult = unknown>(config: DialogConfig): DialogHandle<TResult> {
    const id = ++this.nextId;
    let resolveAfterClosed!: (result: TResult | undefined) => void;

    const afterClosed = new Promise<TResult | undefined>((resolve) => {
      resolveAfterClosed = resolve;
    });

    const dialog: OpenDialog = {
      id,
      config,
      resolve: (result) => resolveAfterClosed(result as TResult | undefined),
    };

    this.dialogs.update((list) => [...list, dialog]);

    return {
      close: (result?: TResult) => this.close(dialog, result),
      afterClosed,
    };
  }

  close(dialog: OpenDialog, result?: unknown): void {
    if (!this.dialogs().some((entry) => entry.id === dialog.id)) return;
    dialog.resolve(result);
    this.dialogs.update((list) => list.filter((entry) => entry.id !== dialog.id));
  }

  closeAll(result?: unknown): void {
    const dialogs = this.dialogs();
    dialogs.forEach((dialog) => dialog.resolve(result));
    this.dialogs.set([]);
  }
}
