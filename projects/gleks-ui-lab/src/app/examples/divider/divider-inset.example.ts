import { Component } from '@angular/core';
import { DividerComponent, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent, IconComponent],
  template: `
    <ul class="event-list">
      <li><gog-icon name="success" /> Order placed</li>
      <gog-divider [inset]="true" />
      <li><gog-icon name="clock" /> Awaiting payment</li>
    </ul>
  `,
})
export class DividerInsetExample {}
