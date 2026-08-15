import { Component } from '@angular/core';
import { TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `
    <gog-tag shape="rounded" variant="success" iconName="check">Available</gog-tag>
    <gog-tag shape="pill" variant="success" iconName="check">Available</gog-tag>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class TagShapesExample {}
