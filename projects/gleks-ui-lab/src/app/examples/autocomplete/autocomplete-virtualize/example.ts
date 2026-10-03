import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AutocompleteComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AutocompleteComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteVirtualizeExample {
  /** 10 000 options: the eager field builds every row, the windowed one about twenty. */
  protected readonly cities = Array.from({ length: 10_000 }, (_, i) => ({
    id: i + 1,
    name: `City ${(i + 1).toLocaleString('en-US')}`,
  }));
}
