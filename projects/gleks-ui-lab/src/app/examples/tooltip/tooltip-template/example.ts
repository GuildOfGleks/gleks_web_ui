import { Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ButtonComponent, TagComponent, GogTooltipDirective],
})
export class TooltipTemplateExample {}
