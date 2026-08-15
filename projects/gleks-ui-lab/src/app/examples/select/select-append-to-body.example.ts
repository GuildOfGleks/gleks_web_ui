import { Component, signal } from '@angular/core';
import { GogDropdownOption, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  template: `
    <gog-select
      label="Country (fixed 220px / 160px panel)"
      [options]="countries"
      [appendToBody]="true"
      dropdownWidth="220px"
      dropdownMaxHeight="160px"
      [(value)]="compactPanelValue"
    />
  `,
})
export class SelectAppendToBodyExample {
  protected readonly countries: GogDropdownOption[] = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i}`,
    name: `Country ${i + 1}`,
  }));
  protected readonly compactPanelValue = signal<string | number | null>(null);
}
