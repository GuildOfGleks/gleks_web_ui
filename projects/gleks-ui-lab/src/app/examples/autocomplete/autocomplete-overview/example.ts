import { Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AutocompleteComponent],
})
export class AutocompleteOverviewExample {
  protected readonly cities = [
    { id: 1, name: 'Amsterdam', country: 'Netherlands' },
    { id: 2, name: 'Berlin', country: 'Germany' },
    // …
  ];
  protected readonly city = signal<number | null>(null);
}
