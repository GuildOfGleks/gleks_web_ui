import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, DialogComponent],
  template: `
    <gog-button (gogClick)="openConfirm()">Delete workspace</gog-button>
    <gog-dialog />
  `,
})
export class DialogOverviewExample {
  private readonly dialogService = inject(DialogService);

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

    const confirmed = await handle.afterClosed;
    console.log(confirmed ? 'Confirmed' : 'Cancelled');
  }
}
