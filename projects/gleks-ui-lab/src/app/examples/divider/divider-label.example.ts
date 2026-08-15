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
})
export class DividerLabelExample {}
