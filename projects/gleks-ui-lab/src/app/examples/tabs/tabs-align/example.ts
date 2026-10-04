import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabComponent, TabsComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsAlignExample {
  protected readonly aligns: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
}
