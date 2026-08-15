import { Component } from '@angular/core';
import { GogSize, InputfieldComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-inputfield [size]="sizeOption" [label]="sizeOption" [placeholder]="sizeOption" />
    }
  `,
})
export class InputfieldSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
