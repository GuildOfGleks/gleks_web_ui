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
})
export class DividerOverviewExample {}
