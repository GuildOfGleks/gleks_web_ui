import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogPanelHeaderDirective, PanelComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogPanelHeaderDirective, PanelComponent],
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelOverviewExample {}
