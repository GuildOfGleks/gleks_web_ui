import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
} from '@guildofgleks/ui/dialog';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOverviewExample {
  private readonly dialogs = inject(DialogService);
  protected readonly result = signal('none yet');

  protected confirm(): void {
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      component: ConfirmationDialogComponent,
      // The confirmation shows its question as a heading: name the dialog by it, not a title.
      ariaLabelledBy: 'delete-workspace-title',
      data: {
        title: 'Delete this workspace?',
        titleId: 'delete-workspace-title',
        description: 'Its projects and their history are removed for everyone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    void handle.afterClosed.then((confirmed) => this.result.set(String(confirmed)));
  }
}
