import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogScrollOverscrollBehavior, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollOverscrollExample {
  protected readonly behaviors: GogScrollOverscrollBehavior[] = ['auto', 'contain'];
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
