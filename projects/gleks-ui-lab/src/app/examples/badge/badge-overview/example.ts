import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogBadgeDirective],
})
export class BadgeOverviewExample {}
