import { Component } from '@angular/core';
import { TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `
    <gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>
    <gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>
  `,
})
export class TagShapesExample {}
