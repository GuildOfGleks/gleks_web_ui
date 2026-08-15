import { Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AutocompleteComponent],
})
export class AutocompleteDtoExample {
  protected readonly cities: City[] = [
    { id: 1, name: 'Amsterdam', country: 'Netherlands' },
    { id: 2, name: 'Barcelona', country: 'Spain' },
    { id: 3, name: 'Berlin', country: 'Germany' },
    { id: 4, name: 'Copenhagen', country: 'Denmark' },
    { id: 5, name: 'Kyiv', country: 'Ukraine' },
    { id: 6, name: 'Lisbon', country: 'Portugal' },
  ];
  // The same object reference you passed in comes back out.
  protected readonly cityObject = signal<City | null>(null);
}
