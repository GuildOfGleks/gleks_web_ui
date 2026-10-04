import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, TabComponent, TabsComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDisabledIndexExample {
  protected readonly activeIndex = signal(1);
}
