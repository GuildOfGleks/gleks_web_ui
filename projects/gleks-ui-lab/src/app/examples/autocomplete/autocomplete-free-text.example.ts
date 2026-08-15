import { Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  template: `
    <gog-autocomplete
      [forceSelection]="false"
      [options]="cities"
      (gogSearch)="draft.set($event)"
      [(value)]="freeText"
    />
  `,
})
export class AutocompleteFreeTextExample {
  protected readonly cities: City[] = [
    { id: 1, name: 'Amsterdam', country: 'Netherlands' },
    { id: 2, name: 'Barcelona', country: 'Spain' },
    { id: 3, name: 'Berlin', country: 'Germany' },
    { id: 4, name: 'Copenhagen', country: 'Denmark' },
    { id: 5, name: 'Kyiv', country: 'Ukraine' },
    { id: 6, name: 'Lisbon', country: 'Portugal' },
  ];
  protected readonly freeText = signal<number | null>(null);
  // With forceSelection off, read what the user typed from gogSearch, not from value.
  protected readonly draft = signal('');
}
