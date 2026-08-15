import { Component } from '@angular/core';
import { GogTabsAlign, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabsComponent, TabComponent],
  template: `
    @for (alignment of alignments; track alignment) {
      <p class="label">align: {{ alignment }}</p>
      <gog-tabs [align]="alignment">
        <gog-tab label="One">Panel one — the alignment above is {{ alignment }}.</gog-tab>
        <gog-tab label="Two">Panel two.</gog-tab>
      </gog-tabs>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .label {
      margin: 0 0 4px;
      color: var(--gog-muted-text-color);
      font-size: var(--gog-text-sm);
    }
  `,
})
export class TabsAlignExample {
  protected readonly alignments: GogTabsAlign[] = ['start', 'center', 'end', 'stretch'];
}
