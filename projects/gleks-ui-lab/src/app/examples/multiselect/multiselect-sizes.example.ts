import { Component, signal } from '@angular/core';
import { GogDropdownOption, GogSize, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-multiselect
        [label]="'Size: ' + sizeOption"
        [size]="sizeOption"
        [options]="features"
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
export class MultiselectSizesExample {
  protected readonly features: GogDropdownOption[] = [
    { id: 'sso', name: 'SSO' },
    { id: 'audit', name: 'Audit log' },
  ];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly sizeDemoValue = signal<(string | number)[]>(['toast']);
}
