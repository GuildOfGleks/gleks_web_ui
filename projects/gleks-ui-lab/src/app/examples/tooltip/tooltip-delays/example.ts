import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, GogTooltipDirective],
})
export class TooltipDelaysExample {}
