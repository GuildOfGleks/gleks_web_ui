import { Component, signal } from '@angular/core';
import {
  GogDropdownChevronDirective,
  GogDropdownOption,
  IconComponent,
  SelectComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent, GogDropdownChevronDirective, IconComponent],
  template: `
    <gog-select [options]="sortOptions" [(value)]="sortValue">
      <ng-template gogDropdownChevron>
        <gog-icon name="sort" />
      </ng-template>
    </gog-select>

    <gog-select
      ariaLabel="Country (no visible label)"
      placeholder="Pick a country"
      [options]="countries"
      [(value)]="ariaOnlyValue"
    />
  `,
})
export class SelectChevronExample {
  protected readonly countries: GogDropdownOption[] = [
    { id: 'de', name: 'Germany' },
    { id: 'nl', name: 'Netherlands' },
    { id: 'ua', name: 'Ukraine' },
  ];
  protected readonly sortOptions: GogDropdownOption[] = [
    { id: 'newest', name: 'Newest first' },
    { id: 'oldest', name: 'Oldest first' },
  ];
  protected readonly sortValue = signal<string | number | null>('newest');
  protected readonly ariaOnlyValue = signal<string | number | null>(null);
}
