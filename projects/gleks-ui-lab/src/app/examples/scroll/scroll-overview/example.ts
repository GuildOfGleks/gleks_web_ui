import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollOverviewExample {
  protected readonly items = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);
}
