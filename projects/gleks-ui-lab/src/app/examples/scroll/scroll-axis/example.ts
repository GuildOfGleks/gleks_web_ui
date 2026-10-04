import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChipComponent, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ChipComponent, ScrollComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollAxisExample {
  protected readonly items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
}
