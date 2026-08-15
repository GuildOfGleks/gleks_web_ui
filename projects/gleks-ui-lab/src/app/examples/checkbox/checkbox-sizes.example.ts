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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class CheckboxSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
