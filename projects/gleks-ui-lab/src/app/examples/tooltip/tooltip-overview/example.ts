import { Component } from '@angular/core';
import { ChipComponent, GogTooltipDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [ChipComponent, GogTooltipDirective],
})
export class TooltipOverviewExample {
  protected readonly hint = 'Not visible to anyone else yet';
}
