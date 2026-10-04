import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RatingComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RatingComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingClearableExample {
  protected readonly outOfTen = signal<number | null>(7);
  protected readonly clearable = signal<number | null>(4);
}
