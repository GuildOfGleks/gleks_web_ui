import { Component } from '@angular/core';
import { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabsComponent, TabComponent],
  template: `
    @for (alignment of alignments; track alignment) {
      <gog-tabs [align]="alignment">
        <gog-tab label="One">…</gog-tab>
        <gog-tab label="Two">…</gog-tab>
      </gog-tabs>
    }
  `,
})
export class TabsAlignExample {
  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
}
