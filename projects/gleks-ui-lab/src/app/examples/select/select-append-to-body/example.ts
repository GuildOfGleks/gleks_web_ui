import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SelectComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAppendToBodyExample {
  protected readonly countries = Array.from({ length: 20 }, (_, i) => ({
    id: `country-${i + 1}`,
    name: `Country ${i + 1}`,
  }));
}
