import { Component } from '@angular/core';
import { ChipComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-chip [size]="sizeOption">{{ sizeOption }}</gog-chip>
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
export class ChipSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
