import { Component, signal } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    @if (loading()) {
      <gog-spinner [overlay]="true" size="lg" ariaLabel="Loading page" />
    }
  `,
})
export class SpinnerFullscreenExample {
  protected readonly loading = signal(true);
}
