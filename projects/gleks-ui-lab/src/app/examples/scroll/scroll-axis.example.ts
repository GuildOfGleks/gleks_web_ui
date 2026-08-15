import { Component } from '@angular/core';
import { ScrollComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ScrollComponent],
  template: `
    <gog-scroll axis="both" style="height: 160px; width: 320px">
      <div style="width: 600px;">…</div>
    </gog-scroll>
  `,
})
export class ScrollAxisExample {}
