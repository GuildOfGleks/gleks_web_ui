import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogProgressbarMode, GogSize, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly modes: GogProgressbarMode[] = ['determinate', 'buffer', 'indeterminate'];
}
