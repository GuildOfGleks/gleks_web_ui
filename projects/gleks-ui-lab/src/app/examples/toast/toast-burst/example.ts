import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class ToastBurstExample {
  private readonly toastService = inject(ToastService);

  protected showBurst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toastService.info(`Queued toast ${index}`, { position: 'top-right' });
    }
  }
}
