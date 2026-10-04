import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RatingComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RatingComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingReadonlyExample {
  protected readonly values: readonly (number | null)[] = [0, 1.2, 2.5, 3.7, 4.3, 5, null];
}
