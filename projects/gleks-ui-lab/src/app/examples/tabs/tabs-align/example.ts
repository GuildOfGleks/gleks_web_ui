import { Component } from '@angular/core';
import { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TabsComponent, TabComponent],
})
export class TabsAlignExample {
  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
}
