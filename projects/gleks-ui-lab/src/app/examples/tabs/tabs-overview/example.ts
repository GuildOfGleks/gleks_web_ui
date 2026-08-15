import { Component, signal } from '@angular/core';
import { TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TabsComponent, TabComponent],
})
export class TabsOverviewExample {
  protected readonly activeIndex = signal(0);
}
