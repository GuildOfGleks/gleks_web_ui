import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogTooltipDirective],
})
export class TooltipPositionsExample {
  protected readonly positions: GogTooltipPosition[] = ['top', 'bottom', 'left', 'right'];
}
