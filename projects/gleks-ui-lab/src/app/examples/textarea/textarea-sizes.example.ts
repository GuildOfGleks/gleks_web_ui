import { Component } from '@angular/core';
import { GogSize, TextareaComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TextareaComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-textarea [size]="sizeOption" [label]="sizeOption" [rows]="2" />
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
export class TextareaSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
