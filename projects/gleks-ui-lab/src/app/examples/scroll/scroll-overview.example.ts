import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll class="box" ariaLabel="Example list">
      @for (item of items; track item) {
        <p>{{ item }}</p>
      }
    </gog-scroll>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    gog-scroll p {
      margin: 0;
      padding: 8px 0;
      border-bottom: 1px solid var(--gog-border-color);
    }
    .box {
      height: 200px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      padding: 0 12px;
    }
  `,
})
export class ScrollOverviewExample {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
