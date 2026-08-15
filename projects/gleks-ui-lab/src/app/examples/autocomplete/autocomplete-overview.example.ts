import { Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  template: `
    <gog-autocomplete
      label="City"
      placeholder="Start typing…"
      [options]="cities"
      [(value)]="city"
    />
  `,
})
export class AutocompleteOverviewExample {
  protected readonly cities = [
    { id: 1, name: 'Amsterdam', country: 'Netherlands' },
    { id: 2, name: 'Berlin', country: 'Germany' },
    // …
  ];
  protected readonly city = signal<number | null>(null);
}
