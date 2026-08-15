import { Component, viewChild } from '@angular/core';
import { ButtonComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ScrollComponent],
  template: `
    <div class="controls">
      <gog-button size="sm" (gogClick)="scroller().scrollToTop()">To top</gog-button>
      <gog-button size="sm" (gogClick)="scroller().scrollToBottom()">To bottom</gog-button>
    </div>

    <gog-scroll class="box" ariaLabel="Rows">
      @for (row of rows; track row) {
        <p>{{ row }}</p>
      }
    </gog-scroll>
  `,
  styles: `
    .controls {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .box {
      display: block;
      height: 160px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      padding: 0 12px;
    }
  `,
})
export class ScrollMethodsExample {
  // Located by type rather than by name: one `gog-scroll` in the template, so there is nothing
  // to disambiguate, and the reference is typed without a generic.
  protected readonly scroller = viewChild.required(ScrollComponent);

  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
