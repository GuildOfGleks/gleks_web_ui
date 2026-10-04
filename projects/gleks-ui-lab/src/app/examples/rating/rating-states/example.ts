import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RatingComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [RatingComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStatesExample {}
