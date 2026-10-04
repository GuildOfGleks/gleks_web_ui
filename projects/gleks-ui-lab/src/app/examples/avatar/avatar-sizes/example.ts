import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent, SkeletonComponent, type GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AvatarComponent, SkeletonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
}
