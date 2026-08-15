import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  template: ` <gog-button gogBadge="12" badgeAriaLabel="12 unread messages">Inbox</gog-button> `,
})
export class BadgeOverviewExample {}
