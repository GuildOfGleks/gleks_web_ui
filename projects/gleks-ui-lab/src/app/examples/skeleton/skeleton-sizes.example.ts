import { Component } from '@angular/core';
import { GogSize, SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-skeleton shape="circle" [size]="sizeOption" />
    }
  `,
})
export class SkeletonSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
