import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class ToastActionsExample {
  private readonly toastService = inject(ToastService);

  protected showWithAction(): void {
    this.toastService.show({
      message: 'File deleted',
      type: 'info',
      actions: [
        { label: 'Undo', iconName: 'close', onClick: () => this.toastService.info('Undo clicked') },
      ],
    });
  }
}
