import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `
    <gog-button (gogClick)="showSticky()">Sticky toast</gog-button>
    <gog-button (gogClick)="showLongDuration()">10s duration</gog-button>
    <gog-button (gogClick)="dismissAll()">Dismiss all</gog-button>
  `,
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
