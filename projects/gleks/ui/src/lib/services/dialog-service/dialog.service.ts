import { DOCUMENT } from '@angular/common';
import { Injectable, TemplateRef, inject, signal, Type } from '@angular/core';
import { GogIconName } from '../../components/icon/icon.component';

export interface DialogConfig {
  title?: string;
  component: Type<unknown>;
  data?: unknown;
  modal?: boolean;
  closable?: boolean;
  draggable?: boolean;
  closeIconName?: GogIconName;
  closeIconTemplate?: TemplateRef<unknown> | null;
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
  zIndex: number;
  offsetX: number;
  offsetY: number;
  config: DialogConfig;
  resolve: (result: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly document = inject(DOCUMENT);
  readonly dialogs = signal<OpenDialog[]>([]);
  private nextId = 0;
  private nextZIndex = 1000;
  private modalDialogCount = 0;
  private bodyOverflowBeforeLock: string | null = null;
  private focusedBeforeOpen: HTMLElement | null = null;

  open<TResult = unknown>(config: DialogConfig): DialogHandle<TResult> {
    const id = ++this.nextId;
    const zIndex = config.zIndex ?? this.nextZIndex++;
    this.nextZIndex = Math.max(this.nextZIndex, zIndex + 1);

    let resolveAfterClosed!: (result: TResult | undefined) => void;

    const afterClosed = new Promise<TResult | undefined>((resolve) => {
      resolveAfterClosed = resolve;
    });

    const dialog: OpenDialog = {
      id,
      zIndex,
      offsetX: 0,
      offsetY: 0,
      config,
      resolve: (result) => resolveAfterClosed(result as TResult | undefined),
    };

    if (config.modal !== false && this.modalDialogCount === 0) {
      this.focusedBeforeOpen =
        this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
      this.lockBodyScroll();
    }

    if (config.modal !== false) {
      this.modalDialogCount += 1;
    }

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

    if (dialog.config.modal !== false) {
      this.modalDialogCount = Math.max(0, this.modalDialogCount - 1);
    }

    if (this.modalDialogCount === 0) {
      this.unlockBodyScroll();
    }

    if (this.dialogs().length === 0) {
      this.restoreFocus();
    }
  }

  closeAll(result?: unknown): void {
    const dialogs = this.dialogs();
    dialogs.forEach((dialog) => dialog.resolve(result));
    this.dialogs.set([]);
    this.modalDialogCount = 0;
    this.unlockBodyScroll();
    this.restoreFocus();
  }

  updatePosition(dialogId: number, offsetX: number, offsetY: number): void {
    this.dialogs.update((list) =>
      list.map((dialog) => (dialog.id === dialogId ? { ...dialog, offsetX, offsetY } : dialog)),
    );
  }

  private lockBodyScroll(): void {
    if (this.bodyOverflowBeforeLock !== null) return;
    this.bodyOverflowBeforeLock = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    if (this.bodyOverflowBeforeLock === null) return;
    this.document.body.style.overflow = this.bodyOverflowBeforeLock;
    this.bodyOverflowBeforeLock = null;
  }

  private restoreFocus(): void {
    const element = this.focusedBeforeOpen;
    this.focusedBeforeOpen = null;
    if (!element || !this.document.contains(element)) return;
    element.focus({ preventScroll: true });
  }
}
