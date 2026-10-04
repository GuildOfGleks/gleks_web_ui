import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeMaxExample {}
