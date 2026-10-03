import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

interface City {
  readonly id: number;
  readonly name: string;
  readonly country: string;
}

const CITIES: readonly City[] = [
  { id: 1, name: 'Amsterdam', country: 'Netherlands' },
  { id: 2, name: 'Antwerp', country: 'Belgium' },
  { id: 3, name: 'Berlin', country: 'Germany' },
  { id: 4, name: 'Hamburg', country: 'Germany' },
  { id: 5, name: 'Munich', country: 'Germany' },
  { id: 6, name: 'Lisbon', country: 'Portugal' },
  { id: 7, name: 'Porto', country: 'Portugal' },
  { id: 8, name: 'Vienna', country: 'Austria' },
];

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteServerExample {
  protected readonly results = signal<City[]>([]);
  protected readonly loading = signal(false);
  protected readonly query = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Stands in for an HTTP call that also matches on the country — a field the control cannot see. */
  protected search(query: string): void {
    this.query.set(query);
    this.loading.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      this.results.set(
        CITIES.filter(
          (city) =>
            city.name.toLowerCase().includes(needle) || city.country.toLowerCase().includes(needle),
        ),
      );
      this.loading.set(false);
    }, 400);
  }
}
