import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabComponent, TabsComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsOverviewExample {
  protected readonly activeIndex = signal(0);
  protected readonly lastChange = signal<number | null>(null);
}
