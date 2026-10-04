import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RatingComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RatingComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingOverviewExample {
  protected readonly score = signal<number | null>(3);
}
