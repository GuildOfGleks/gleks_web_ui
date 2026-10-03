import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiselectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [MultiselectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectControlsExample {
  protected readonly countries = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i + 1}`,
    name: `Country ${i + 1}`,
  }));
}
