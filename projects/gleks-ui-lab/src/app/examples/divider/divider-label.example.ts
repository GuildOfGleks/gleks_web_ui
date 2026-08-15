import { Component } from '@angular/core';
import { DividerComponent, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent, IconComponent, TagComponent],
  template: `
    <gog-divider>OR</gog-divider>

    <gog-divider>
      <gog-icon name="info" />
      Shipping details
    </gog-divider>

    <gog-divider><gog-tag variant="warning">Draft</gog-tag></gog-divider>
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
export class DividerLabelExample {}
