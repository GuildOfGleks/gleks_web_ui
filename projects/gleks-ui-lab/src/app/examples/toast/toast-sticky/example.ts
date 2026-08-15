import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent],
})
export class ToastStickyExample {
  private readonly toastService = inject(ToastService);

  protected showSticky(): void {
    this.toastService.show({
      message: 'Stays until dismissed or dismissAll() is called.',
      type: 'warning',
      isSticky: true,
    });
  }

  protected showLongDuration(): void {
    this.toastService.show({
      message: 'Auto-dismisses after 10s instead of the 4s default.',
      type: 'info',
      duration: 10000,
    });
  }

  protected dismissAll(): void {
    this.toastService.dismissAll();
  }
}
