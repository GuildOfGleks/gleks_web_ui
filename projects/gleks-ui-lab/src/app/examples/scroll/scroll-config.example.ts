import { Component } from '@angular/core';
import { ScrollComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  // In an app this goes in `appConfig.providers` and applies everywhere. Provided on the
  // component here so the defaults are scoped to this example — that scoping is itself the
  // point: a lazy feature can set its own without touching the rest of the app.
  providers: [
    provideGogConfig({
      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },
    }),
  ],
  template: `
    <gog-scroll class="box" ariaLabel="Rows">
      @for (row of rows; track row) {
        <p>{{ row }}</p>
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
      height: 160px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      padding: 0 12px;
    }
  `,
})
export class ScrollConfigExample {
  protected readonly rows = Array.from({ length: 30 }, (_, index) => `Row ${index + 1}`);
}
