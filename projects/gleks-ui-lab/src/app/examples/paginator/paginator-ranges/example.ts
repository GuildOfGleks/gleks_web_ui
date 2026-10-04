import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorRangesExample {
  protected readonly windowPage = signal(10);
  protected readonly pinnedPage = signal(10);
  protected readonly threePage = signal(10);
  protected readonly ellipsisPage = signal(10);
  protected readonly siblingPage = signal(10);
}
