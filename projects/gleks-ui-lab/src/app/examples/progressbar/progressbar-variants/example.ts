import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogProgressbarMode, GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarVariantsExample {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'info',
    'success',
    'warning',
    'danger',
  ];
  protected readonly modes: GogProgressbarMode[] = ['determinate', 'buffer', 'indeterminate'];
}
