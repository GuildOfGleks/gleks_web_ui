import { Component } from '@angular/core';
import { GogTagIconDirective, IconComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TagComponent, IconComponent, GogTagIconDirective],
  template: `
    <gog-tag variant="success">
      <ng-template gogTagIcon>
        <gog-icon name="checkbox-checked" />
      </ng-template>
      Featured
    </gog-tag>
  `,
})
export class TagCustomIconExample {}
