import { Component, signal } from '@angular/core';
import { SpinnerOverlayComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerOverlayComponent],
  template: `
    <gog-spinner-overlay [loading]="loading()" size="lg" variant="ring" ariaLabel="Loading content">
      <div class="panel"><!-- any content --></div>
    </gog-spinner-overlay>
  `,
})
export class SpinnerOverlayExample {
  protected readonly loading = signal(true);
}
