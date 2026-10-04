import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, GogTooltipDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, GogTooltipDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDelaysExample {}
