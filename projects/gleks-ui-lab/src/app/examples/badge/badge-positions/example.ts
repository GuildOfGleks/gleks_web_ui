import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, GogBadgePosition } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogBadgeDirective],
})
export class BadgePositionsExample {
  protected readonly positions: GogBadgePosition[] = [
    'top-end',
    'top-start',
    'bottom-end',
    'bottom-start',
  ];
}
