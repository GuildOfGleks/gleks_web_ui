import { Component, signal } from '@angular/core';
import { AutocompleteComponent, GogDropdownOptionDirective } from '@guildofgleks/ui';

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent, GogDropdownOptionDirective],
  template: `
    <gog-autocomplete label="City" [options]="cities" [(value)]="slotCity">
      <ng-template gogDropdownOption let-option let-label="label">
        <strong>{{ label }}</strong>
        <small>{{ asCity(option).country }}</small>
      </ng-template>
    </gog-autocomplete>
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
export class AutocompleteSlotExample {
  protected readonly cities: City[] = [
    { id: 1, name: 'Amsterdam', country: 'Netherlands' },
    { id: 2, name: 'Barcelona', country: 'Spain' },
    { id: 3, name: 'Berlin', country: 'Germany' },
    { id: 4, name: 'Copenhagen', country: 'Denmark' },
    { id: 5, name: 'Kyiv', country: 'Ukraine' },
    { id: 6, name: 'Lisbon', country: 'Portugal' },
  ];
  protected readonly slotCity = signal<number | null>(null);
  protected asCity(option: unknown): City {
    return option as City;
  }
}
