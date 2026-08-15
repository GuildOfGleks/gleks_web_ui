import { Component } from '@angular/core';
import { IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  template: `
    <gog-icon name="success" style="--gog-icon-size: 16px" />
    <gog-icon name="success" style="--gog-icon-size: 24px" />
    <gog-icon name="success" style="--gog-icon-size: 40px" />
  `,
})
export class IconSizingExample {}
