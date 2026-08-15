import { Component } from '@angular/core';
import { GogTabContentDirective, TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabsComponent, TabComponent, GogTabContentDirective],
  template: `
    <gog-tabs ariaLabel="Reports">
      <gog-tab label="Summary">
        <p>Rendered with the page. Type here, switch tabs and come back — the value survives.</p>
        <input placeholder="Type something" />
      </gog-tab>

      <gog-tab label="Expensive report">
        <!-- Wrapped in an ng-template carrying gogTabContent, so nothing inside is created
             until this tab is first opened. Put anything costly here: a chart, a table, a
             component that fetches on init. -->
        <ng-template gogTabContent>
          <p>Created the first time this tab was opened, not with the page.</p>
        </ng-template>
      </gog-tab>
    </gog-tabs>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class TabsLazyExample {}
