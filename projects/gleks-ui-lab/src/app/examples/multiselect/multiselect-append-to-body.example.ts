import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `
    <gog-multiselect
      label="Country (fixed 240px / 160px panel)"
      [options]="countries"
      [appendToBody]="true"
      dropdownWidth="240px"
      dropdownMaxHeight="160px"
      [(value)]="compactPanelValue"
    />
  `,
})
export class MultiselectAppendToBodyExample {
  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly compactPanelValue = signal<(string | number)[]>([]);
}
