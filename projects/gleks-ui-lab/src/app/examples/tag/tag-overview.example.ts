import { Component } from '@angular/core';
import { TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `<gog-tag variant="success" iconName="check">In stock</gog-tag>`,
})
export class TagOverviewExample {}
