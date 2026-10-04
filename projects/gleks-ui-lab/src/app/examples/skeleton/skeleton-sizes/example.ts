import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogSize, GogSkeletonShape, SkeletonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly shapes: GogSkeletonShape[] = ['text', 'circle', 'rect'];
}
