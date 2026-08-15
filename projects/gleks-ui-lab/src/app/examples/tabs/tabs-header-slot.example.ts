import { Component } from '@angular/core';
import { GogTabHeaderDirective, TabComponent, TabsComponent, TagComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabsComponent, TabComponent, GogTabHeaderDirective, TagComponent],
  template: `
    <gog-tabs ariaLabel="Inbox">
      <ng-template gogTabHeader let-tab let-active="active">
        <span>{{ tab.label() }}</span>
        @if (active) {
          <gog-tag variant="info" size="xsm">now</gog-tag>
        }
      </ng-template>

      <gog-tab label="Unread">…</gog-tab>
      <gog-tab label="Archived">…</gog-tab>
    </gog-tabs>
  `,
})
export class TabsHeaderSlotExample {}
