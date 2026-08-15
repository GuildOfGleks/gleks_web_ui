import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogBadgePosition } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogBadgeDirective],
  template: `
    @for (position of positions; track position) {
      <gog-button gogBadge="4" [badgePosition]="position">{{ position }}</gog-button>
    }
  `,
})
export class BadgePositionsExample {
  protected readonly positions: GogBadgePosition[] = [
    'top-end',
    'top-start',
    'bottom-end',
    'bottom-start',
  ];
}
