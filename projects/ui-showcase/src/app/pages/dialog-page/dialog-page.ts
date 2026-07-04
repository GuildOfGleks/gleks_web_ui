import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  ToastService,
} from '@gleks/ui';

@Component({
  selector: 'app-dialog-page',
  imports: [ButtonComponent, DialogComponent],
  templateUrl: './dialog-page.html',
  styleUrl: './dialog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPage {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly lastDialogResult = signal('No dialog opened yet.');

  protected openConfirmDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Delete workspace?',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Delete workspace?',
        description: 'This action removes the demo item from the showcase state.',
        confirmText: 'Delete',
        cancelText: 'Keep it',
      },
      role: 'alertdialog',
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 34rem)',
    });

    void ref.afterClosed.then((confirmed) => {
      this.lastDialogResult.set(confirmed ? 'Confirmed deletion' : 'Cancelled deletion');
      this.toastService.show({
        message: confirmed ? 'Workspace deleted' : 'Workspace kept',
        type: confirmed ? 'success' : 'info',
      });
    });
  }
}
