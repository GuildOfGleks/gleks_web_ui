import { Component } from '@angular/core';
import { ButtonComponent, GogBadgeDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, IconComponent, GogBadgeDirective],
})
export class BadgeDotExample {}
