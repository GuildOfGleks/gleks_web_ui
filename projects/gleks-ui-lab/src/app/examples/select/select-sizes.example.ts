import { Component, signal } from '@angular/core';
import { GogDropdownOption, GogSize, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-select
        [label]="'Size: ' + sizeOption"
        [size]="sizeOption"
        [options]="frameworks"
        [(value)]="sizeDemoValue"
      />
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
export class SelectSizesExample {
  protected readonly frameworks: GogDropdownOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];
  protected readonly sizeDemoValue = signal<string | number | null>('angular');
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
