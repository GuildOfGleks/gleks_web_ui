import { ChangeDetectionStrategy, Component, inject, Injector } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DIALOG_DATA, DIALOG_REF } from './dialog.tokens';
import { DialogService, OpenDialog } from '../../services/dialog-service/dialog.service';

@Component({
  selector: 'gog-dialog',
  imports: [NgComponentOutlet],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  protected readonly dialogService = inject(DialogService);
  private readonly parentInjector = inject(Injector);

  private readonly injectorCache = new WeakMap<OpenDialog, Injector>();

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
    this.dialogService.close(dialog, undefined);
  }

  protected closeIfClosable(dialog: OpenDialog): void {
    if (dialog.config.closable !== false) this.close(dialog);
  }

  protected panelZ(dialog: OpenDialog): number {
    return dialog.config.zIndex ?? 1000;
  }

  protected onBackdropClick(event: MouseEvent, dialog: OpenDialog): void {
    if (!dialog.config.closable) return;
    if (event.target === event.currentTarget) {
      this.close(dialog);
    }
  }

  protected trackDialog(_: number, entry: OpenDialog): number {
    return entry.id;
  }
}
