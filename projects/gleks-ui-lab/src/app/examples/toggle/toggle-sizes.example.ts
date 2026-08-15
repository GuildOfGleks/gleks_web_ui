import { Component, signal } from '@angular/core';
import { GogSize, ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-toggle [size]="sizeOption" [label]="sizeOption" [(checked)]="sizeState" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  `,
})
export class ToggleSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly sizeState = signal(true);
}
