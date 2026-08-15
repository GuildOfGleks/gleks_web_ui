import { Component, signal } from '@angular/core';
import { ButtonComponent, SpinnerOverlayComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SpinnerOverlayComponent],
  template: `
    <gog-button size="sm" variant="outline" (gogClick)="loading.set(!loading())">
      loading: {{ loading() }}
    </gog-button>

    <gog-spinner-overlay [loading]="loading()" size="lg" variant="ring" ariaLabel="Loading content">
      <div class="panel">
        <h3>Monthly report</h3>
        <p>Turn the overlay off and this content is interactive again.</p>
        <a href="#overlay">A link, to prove the overlay really blocks it</a>
      </div>
    </gog-spinner-overlay>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .panel {
      display: grid;
      gap: 8px;
      min-height: 160px;
      align-content: center;
      padding: 20px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: color-mix(in srgb, var(--gog-surface-color) 88%, transparent);
    }
    .panel h3 {
      margin: 0;
    }
    .panel p {
      margin: 0;
      color: var(--gog-muted-text-color);
    }
  `,
})
export class SpinnerOverlayExample {
  protected readonly loading = signal(true);
}
