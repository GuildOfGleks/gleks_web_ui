import { Component, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  template: `<gog-multiselect
    label="Features"
    [options]="features"
    [(value)]="selectedFeatures"
  />`,
})
export class MultiselectOverviewExample {
  protected readonly selectedFeatures = signal<(string | number)[]>([]);
  protected readonly features: GogDropdownOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];
}
