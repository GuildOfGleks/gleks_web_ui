import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DialogService } from '@guildofgleks/ui/dialog';
import { StackDialog, type StackData } from './stack-dialog';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogStackExample {
  private readonly dialogs = inject(DialogService);
  protected readonly result = signal('none yet');

  protected open(): void {
    const handle = this.dialogs.open<unknown, StackData>({
      title: 'Stacked 1',
      component: StackDialog,
      data: { depth: 1 },
      width: '26rem',
    });
    void handle.afterClosed.then((value) => this.result.set(String(value)));
  }
}
