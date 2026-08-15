import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `
    <gog-button (gogClick)="openConfirm()">Delete workspace</gog-button>
    <!-- <gog-dialog /> is mounted once at the root of the app, not here — see the import
         snippet above. This page mounts it in its own root component, and the StackBlitz
         project this example opens in does the same. -->
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
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
