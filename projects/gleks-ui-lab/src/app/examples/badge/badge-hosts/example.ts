import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AvatarComponent,
  ButtonComponent,
  GogBadgeDirective,
  GogButtonDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AvatarComponent, ButtonComponent, GogBadgeDirective, GogButtonDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeHostsExample {}
