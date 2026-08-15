import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastContainerComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ToastContainerComponent],
  template: `
    <gog-button (gogClick)="showToast()">Preview toast</gog-button>
    <gog-toast-container />
  `,
})
export class ToastOverviewExample {
  private readonly toastService = inject(ToastService);

  protected showToast(): void {
    this.toastService.success('Saved successfully');
  }
}
