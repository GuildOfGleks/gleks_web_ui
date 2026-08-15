import { Component, computed, signal } from '@angular/core';
import { GogDropdownOption, MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [MultiselectComponent],
})
export class MultiselectOverviewExample {
  protected readonly selectedFeatures = signal<(string | number)[]>([]);
  protected readonly features: GogDropdownOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];

  // The value is an array of option `id`s, not of options — so labels need a lookup.
  protected readonly featureSummary = computed(() => {
    const ids = this.selectedFeatures();
    if (ids.length === 0) return 'nothing';
    return this.features
      .filter((option) => ids.includes(option.id))
      .map((option) => option.name)
      .join(', ');
  });
}
