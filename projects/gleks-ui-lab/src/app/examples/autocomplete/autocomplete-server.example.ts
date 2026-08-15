import { Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

const ALL_CITIES: City[] = [
  { id: 1, name: 'Amsterdam', country: 'Netherlands' },
  { id: 2, name: 'Barcelona', country: 'Spain' },
  { id: 3, name: 'Berlin', country: 'Germany' },
  { id: 4, name: 'Copenhagen', country: 'Denmark' },
  { id: 5, name: 'Kyiv', country: 'Ukraine' },
  { id: 6, name: 'Lisbon', country: 'Portugal' },
];

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  template: `
    <gog-autocomplete
      label="City"
      [options]="results()"
      [loading]="loading()"
      [filterLocal]="false"
      (gogSearch)="search($event)"
      [(value)]="city"
    />
  `,
})
export class AutocompleteServerExample {
  protected readonly results = signal<City[]>([]);
  protected readonly loading = signal(false);
  protected readonly city = signal<number | null>(null);

  // `filterLocal: false` hands filtering to you. `gogSearch` is already debounced by
  // `searchDebounce` (300 ms by default), so this is one request per pause in typing.
  protected search(query: string): void {
    this.loading.set(true);
    // Your HTTP call goes here — a timeout stands in for it so the example runs anywhere.
    setTimeout(() => {
      const term = query.toLowerCase();
      this.results.set(ALL_CITIES.filter((city) => city.name.toLowerCase().includes(term)));
      this.loading.set(false);
    }, 400);
  }
}
