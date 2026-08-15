import { Component } from '@angular/core';
import { GogSize, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-progressbar [size]="sizeOption" [value]="65" [ariaLabel]="sizeOption" />
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
export class ProgressbarSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
