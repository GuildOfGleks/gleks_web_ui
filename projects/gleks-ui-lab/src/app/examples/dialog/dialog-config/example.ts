import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import {
  ConfirmationDialogComponent,
  DialogService,
  type ConfirmDialogData,
  type DialogConfig,
} from '@guildofgleks/ui/dialog';

interface Row {
  readonly name: string;
  readonly config: Omit<DialogConfig, 'component'>;
}

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfigExample {
  private readonly dialogs = inject(DialogService);
  protected readonly result = signal('none yet');

  protected readonly rows: Row[] = [
    { name: 'every default', config: { title: 'Archive project' } },
    { name: 'modal: false', config: { title: 'Archive project', modal: false } },
    { name: 'closable: false', config: { title: 'Archive project', closable: false } },
    { name: 'draggable: false', config: { title: 'Archive project', draggable: false } },
    { name: "role: 'alertdialog'", config: { title: 'Archive project', role: 'alertdialog' } },
    { name: 'no title', config: {} },
  ];

  protected open(row: Row): void {
    const handle = this.dialogs.open<boolean, ConfirmDialogData>({
      ...row.config,
      component: ConfirmationDialogComponent,
      data: {
        title: 'Archive this project?',
        description: `Opened with ${row.name}. Archived projects stay readable and can be restored.`,
        confirmText: 'Archive',
        cancelText: 'Cancel',
      },
    });
    void handle.afterClosed.then((value) => this.result.set(`${row.name} → ${String(value)}`));
  }
}
