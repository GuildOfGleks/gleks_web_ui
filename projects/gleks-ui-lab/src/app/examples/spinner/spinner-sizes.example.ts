import { Component } from '@angular/core';
import { GogSize, SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-spinner [size]="sizeOption" [ariaLabel]="'Loading ' + sizeOption" />
    }
  `,
})
export class SpinnerSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
