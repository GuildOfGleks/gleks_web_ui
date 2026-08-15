import { Component } from '@angular/core';
import { IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  template: `<gog-icon name="check" />`,
})
export class IconOverviewExample {}
