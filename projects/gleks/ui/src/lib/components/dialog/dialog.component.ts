import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, Injector } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DIALOG_DATA, DIALOG_REF } from './dialog.tokens';
import { DialogService, OpenDialog } from '../../services/dialog-service/dialog.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'gog-dialog',
  imports: [NgComponentOutlet, IconComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  protected readonly dialogService = inject(DialogService);
  private readonly parentInjector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly injectorCache = new WeakMap<OpenDialog, Injector>();
  private readonly backdropPress = new Set<number>();
  private readonly focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  constructor() {
    effect(() => {
      const dialogs = this.dialogService.dialogs();
      const openIds = new Set(dialogs.map((dialog) => dialog.id));
      for (const dialogId of this.backdropPress) {
        if (!openIds.has(dialogId)) {
          this.backdropPress.delete(dialogId);
        }
      }
      if (dialogs.length === 0) return;
      queueMicrotask(() => this.focusTopDialog());
    });
  }

  protected getInjector(dialog: OpenDialog): Injector {
    if (!this.injectorCache.has(dialog)) {
      this.injectorCache.set(
        dialog,
        Injector.create({
          parent: this.parentInjector,
          providers: [
            { provide: DIALOG_DATA, useValue: dialog.config.data },
            {
              provide: DIALOG_REF,
              useValue: {
                close: (result?: unknown) => this.dialogService.close(dialog, result),
              },
            },
          ],
        }),
      );
    }
    return this.injectorCache.get(dialog)!;
  }

  protected getTitleId(dialog: OpenDialog): string {
    return `gog-dialog-title-${dialog.id}`;
  }

  protected close(dialog: OpenDialog): void {
    this.backdropPress.delete(dialog.id);
    this.dialogService.close(dialog, undefined);
  }

  protected closeIfClosable(dialog: OpenDialog): void {
    if (dialog.config.closable !== false) this.close(dialog);
  }

  protected panelZ(dialog: OpenDialog): number {
    return dialog.zIndex;
  }

  protected onBackdropPointerDown(event: PointerEvent, dialog: OpenDialog): void {
    if (dialog.config.closable === false) return;
    if (event.target === event.currentTarget) {
      this.backdropPress.add(dialog.id);
    }
  }

  protected onBackdropPointerUp(event: PointerEvent, dialog: OpenDialog): void {
    if (dialog.config.closable === false) return;
    const shouldClose = this.backdropPress.has(dialog.id) && event.target === event.currentTarget;
    this.backdropPress.delete(dialog.id);
    if (shouldClose) {
      this.close(dialog);
    }
  }

  protected onPanelKeydown(event: KeyboardEvent, dialog: OpenDialog, panel: HTMLElement): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeIfClosable(dialog);
      return;
    }

    if (dialog.config.modal === false || event.key !== 'Tab') return;

    const focusables = this.getFocusableElements(panel);
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const currentIndex = focusables.indexOf(this.dialogDocument.activeElement as HTMLElement);
    const lastIndex = focusables.length - 1;
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? lastIndex
        : currentIndex - 1
      : currentIndex === -1 || currentIndex === lastIndex
        ? 0
        : currentIndex + 1;

    event.preventDefault();
    focusables[nextIndex].focus({ preventScroll: true });
  }

  protected startDrag(event: PointerEvent, dialog: OpenDialog): void {
    if (dialog.config.draggable === false) return;
    if (event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest('button')) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = dialog.offsetX;
    const initialY = dialog.offsetY;

    const move = (moveEvent: PointerEvent) => {
      this.dialogService.updatePosition(
        dialog.id,
        initialX + (moveEvent.clientX - startX),
        initialY + (moveEvent.clientY - startY),
      );
    };

    const stop = () => {
      this.dialogDocument.removeEventListener('pointermove', move);
      this.dialogDocument.removeEventListener('pointerup', stop);
      this.dialogDocument.removeEventListener('pointercancel', stop);
    };

    this.dialogDocument.addEventListener('pointermove', move);
    this.dialogDocument.addEventListener('pointerup', stop);
    this.dialogDocument.addEventListener('pointercancel', stop);
    event.preventDefault();
  }

  protected trackDialog(_: number, entry: OpenDialog): number {
    return entry.id;
  }

  protected isDraggable(dialog: OpenDialog): boolean {
    return dialog.config.draggable !== false && (dialog.config.title !== undefined || dialog.config.closable !== false);
  }

  private get dialogDocument(): Document {
    return this.host.nativeElement.ownerDocument;
  }

  private focusTopDialog(): void {
    const dialogs = this.dialogService.dialogs();
    const topDialog = dialogs[dialogs.length - 1];
    if (!topDialog) return;

    const panel = (this.host.nativeElement as HTMLElement).querySelector(`[data-dialog-id="${topDialog.id}"]`) as HTMLElement | null;
    if (!panel) return;

    const focusables = this.getFocusableElements(panel);
    (focusables[0] ?? panel).focus({ preventScroll: true });
  }

  private getFocusableElements(panel: HTMLElement): HTMLElement[] {
    return Array.from(panel.querySelectorAll<HTMLElement>(this.focusableSelector)).filter(
      (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1 && this.isVisible(element),
    );
  }

  private isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}
