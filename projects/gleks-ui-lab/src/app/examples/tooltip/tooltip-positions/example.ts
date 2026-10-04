import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective, GogTooltipPosition } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPositionsExample {
  protected readonly positions: GogTooltipPosition[] = ['auto', 'top', 'bottom', 'left', 'right'];
}
