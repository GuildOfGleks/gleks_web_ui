import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabComponent, TabsComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsVerticalExample {}
