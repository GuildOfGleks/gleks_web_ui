import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, IconComponent, GogBadgeDirective],
  template: `
    <gog-icon name="info" gogBadge badgeDot badgeAriaLabel="Unread updates" />
    <gog-button gogBadge badgeDot badgeVariant="success">Synced</gog-button>
  `,
})
export class BadgeDotExample {}
