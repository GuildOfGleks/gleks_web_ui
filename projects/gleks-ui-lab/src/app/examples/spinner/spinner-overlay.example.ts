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
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
    .panel {
      display: grid;
      gap: 12px;
      min-height: 160px;
      align-content: center;
      padding: 20px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: color-mix(in srgb, var(--gog-surface-color) 88%, transparent);
    }
  `,
})
export class SpinnerOverlayExample {
  protected readonly loading = signal(true);
}
