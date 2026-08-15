import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll style="height: 200px" ariaLabel="Example list">
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
  `,
})
export class ScrollOverviewExample {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
