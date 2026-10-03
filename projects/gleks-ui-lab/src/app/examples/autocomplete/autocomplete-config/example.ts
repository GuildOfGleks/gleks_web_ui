import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AutocompleteComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own fields.
  providers: [
    provideGogConfig({
      control: { size: 'lg' },
      autocomplete: { minLength: 2, openOnFocus: false, searchDebounce: 1000 },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteConfigExample {
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
  protected readonly searches = signal(0);
}
