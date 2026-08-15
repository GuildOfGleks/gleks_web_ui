import { Component } from '@angular/core';
import { CheckboxComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-checkbox [size]="sizeOption" [label]="sizeOption" [checked]="true" />
    }
  `,
})
export class CheckboxSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
