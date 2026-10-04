import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogScrollSize, ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollStatesExample {
  protected readonly sizes: GogScrollSize[] = ['normal', 'thin'];
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
