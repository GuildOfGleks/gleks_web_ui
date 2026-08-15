import { Component } from '@angular/core';
import { DividerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent],
  template: `
    <div class="toolbar">
      <button>Cut</button>
      <gog-divider orientation="vertical" />
      <button>Copy</button>
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
    .toolbar {
      display: flex;
      align-items: center;
      /* A vertical divider stretches to the row when the row defines a height, */
      /* otherwise it falls back to --gog-divider-vertical-length. */
      height: 32px;
    }
  `,
})
export class DividerVerticalExample {}
