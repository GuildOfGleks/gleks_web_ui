import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ButtonComponent,
  ChipComponent,
  GogTooltipDirective,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ChipComponent, GogTooltipDirective, IconComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipOverviewExample {}
