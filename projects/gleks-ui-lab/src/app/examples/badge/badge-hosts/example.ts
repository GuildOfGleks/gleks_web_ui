import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogButtonDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective, GogButtonDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeHostsExample {}
