import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogProgressbarVariant, ProgressbarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ProgressbarComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarEdgeExample {
  protected readonly variants: GogProgressbarVariant[] = [
    'accent',
    'info',
    'success',
    'warning',
    'danger',
  ];
}
