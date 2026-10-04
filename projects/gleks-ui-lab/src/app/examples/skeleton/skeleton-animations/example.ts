import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogSkeletonAnimation, GogSkeletonShape, SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonAnimationsExample {
  protected readonly animations: GogSkeletonAnimation[] = ['pulse', 'wave', 'none'];
  protected readonly shapes: GogSkeletonShape[] = ['text', 'circle', 'rect'];
}
