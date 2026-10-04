import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DividerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [DividerComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerVerticalExample {}
