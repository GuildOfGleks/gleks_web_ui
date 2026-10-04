import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLinesExample {
  protected readonly lineCounts = [1, 2, 4];
}
