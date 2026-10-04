import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RatingComponent, type GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RatingComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
