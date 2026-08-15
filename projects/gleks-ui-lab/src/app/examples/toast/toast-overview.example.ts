import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastContainerComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `
    <gog-button (gogClick)="showToast()">Preview toast</gog-button>
    <!-- <gog-toast-container /> is mounted once at the root of the app, not here — see the
         import snippet above. Mounting a second one inside a scrolling container would pin the
         toasts to that container instead of the window. -->
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class ToastOverviewExample {
  private readonly toastService = inject(ToastService);

  protected showToast(): void {
    this.toastService.success('Saved successfully');
  }
}
