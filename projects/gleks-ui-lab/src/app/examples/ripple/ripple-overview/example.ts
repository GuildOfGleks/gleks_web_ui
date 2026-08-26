import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogRippleDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogRippleDirective],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleOverviewExample {}
