import { Component, signal } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    <div class="product-grid">
      @for (placeholder of [0, 1, 2, 3]; track placeholder) {
        <div class="product-card">
          <gog-skeleton shape="rect" height="120px" />
          <gog-skeleton shape="text" width="80%" />
          <gog-skeleton shape="text" width="30%" size="sm" />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
      max-width: 620px;
    }
    .product-card {
      display: grid;
      gap: 8px;
    }
  `,
})
export class SkeletonProductsExample {
  protected readonly loading = signal(true);
}
