import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastActionsExample {
  private readonly toasts = inject(ToastService);

  protected readonly lastEvent = signal('nothing yet');

  protected move(): void {
    const id = this.toasts.success('Moved 3 files to Archive.', {
      actions: [
        {
          label: 'Undo',
          // Pressing an action does not close the toast: an Undo dismisses it itself.
          onClick: (toast) => {
            this.toasts.dismiss(toast.id);
            this.lastEvent.set(`Undo pressed on ${toast.id.slice(0, 8)}…`);
          },
        },
      ],
    });
    this.lastEvent.set(`show() returned ${id.slice(0, 8)}…`);
  }
}
