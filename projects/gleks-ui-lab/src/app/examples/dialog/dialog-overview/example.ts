import { Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class DialogOverviewExample {
  private readonly dialogService = inject(DialogService);

  protected readonly lastResult = signal('Nothing yet.');

  protected async openConfirm(): Promise<void> {
    const handle = this.dialogService.open<boolean>({
      title: 'Delete workspace?',
      component: ConfirmationDialogComponent,
      role: 'alertdialog',
      data: {
        title: 'Delete workspace?',
        description: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    // `afterClosed` resolves with whatever the dialog closed with — `undefined` when it was
    // dismissed by Escape or a backdrop click rather than by one of its own buttons.
    const confirmed = await handle.afterClosed;
    this.lastResult.set(confirmed ? 'Confirmed' : 'Cancelled');
  }
}
