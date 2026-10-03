import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDebounceExample {
  protected readonly cities = [
    { id: 1, name: 'Amsterdam' },
    { id: 2, name: 'Athens' },
    { id: 3, name: 'Barcelona' },
    { id: 4, name: 'Berlin' },
    { id: 5, name: 'Bratislava' },
    { id: 6, name: 'Brussels' },
    { id: 7, name: 'Budapest' },
    { id: 8, name: 'Dublin' },
    { id: 9, name: 'Lisbon' },
    { id: 10, name: 'Zagreb' },
  ];
  protected readonly searches = signal({ slow: 0, eager: 0 });
  protected readonly last = signal({ slow: '', eager: '' });

  protected record(key: 'slow' | 'eager', query: string): void {
    this.searches.update((s) => ({ ...s, [key]: s[key] + 1 }));
    this.last.update((l) => ({ ...l, [key]: query }));
  }
}
