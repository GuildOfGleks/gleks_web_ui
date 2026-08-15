import { Component } from '@angular/core';
import { DividerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent],
  template: `
    <p>Above the rule.</p>
    <gog-divider />
    <p>Below it.</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class DividerOverviewExample {}
