import { Component, inject, signal } from '@angular/core';
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
    <p class="readout">Last result: {{ lastResult() }}</p>
    <!-- <gog-dialog /> is mounted once at the root of the app, not here — see the import
         snippet above. This page mounts it in its own root component, and the StackBlitz
         project this example opens in does the same. -->
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
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
