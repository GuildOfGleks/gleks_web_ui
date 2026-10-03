import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AutocompleteComponent, GogFloatLabelVariant } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteFloatLabelExample {
  protected readonly variants: readonly GogFloatLabelVariant[] = ['none', 'in', 'on', 'over'];
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
}
