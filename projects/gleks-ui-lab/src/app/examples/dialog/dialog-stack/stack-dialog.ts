import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';
import { DIALOG_DATA, DialogService } from '@guildofgleks/ui/dialog';

export interface StackData {
  readonly depth: number;
}

/** A body that opens another dialog: it injects DialogService like any other consumer. */
@Component({
  selector: 'app-stack-dialog',
  imports: [ButtonComponent],
  templateUrl: './stack-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackDialog {
  protected readonly data = inject<StackData>(DIALOG_DATA);
  protected readonly dialogs = inject(DialogService);

  protected openAnother(): void {
    const depth = this.data.depth + 1;
    this.dialogs.open<unknown, StackData>({
      title: `Stacked ${depth}`,
      component: StackDialog,
      data: { depth },
      width: '26rem',
    });
  }
}
