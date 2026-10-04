import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogBadgeDirective, GogRippleDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogBadgeDirective, GogRippleDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RippleBadgeExample {}
