import { Component } from '@angular/core';
import { GogSize, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-tag [size]="sizeOption" variant="success">Available</gog-tag>
    }
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
export class TagSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
