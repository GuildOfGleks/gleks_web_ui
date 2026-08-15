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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .event-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 320px;
    }
    .event-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
    }
  `,
})
export class DividerInsetExample {}
