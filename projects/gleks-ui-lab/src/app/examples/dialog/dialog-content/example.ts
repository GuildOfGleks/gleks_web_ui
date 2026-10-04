import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DialogService } from '@guildofgleks/ui/dialog';
import { RenameDialog, type RenameData, type RenameResult } from './rename-dialog';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentExample {
  private readonly dialogs = inject(DialogService);
  protected readonly result = signal('none yet');

  protected rename(): void {
    const handle = this.dialogs.open<RenameResult, RenameData>({
      title: 'Rename report',
      component: RenameDialog,
      data: { name: 'Q3 revenue' },
      width: '28rem',
    });
    void handle.afterClosed.then((value) => this.result.set(JSON.stringify(value) ?? 'undefined'));
  }
}
