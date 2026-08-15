import { Component, signal } from '@angular/core';
import { ButtonToggleGroupComponent, GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonToggleGroupComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-button-toggle-group [size]="sizeOption" [options]="views" [(value)]="sizeView" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  `,
})
export class ButtonToggleSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly views = [
    { id: 'list', name: 'List' },
    { id: 'grid', name: 'Grid' },
    { id: 'calendar', name: 'Calendar' },
  ];
  protected readonly sizeView = signal<unknown>('list');
}
