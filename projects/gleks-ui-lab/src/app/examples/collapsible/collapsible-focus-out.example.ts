import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
  ],
  template: `
    <gog-collapsible [(open)]="open" [collapseOnFocusOut]="true">
      <button type="button" gogCollapsibleTrigger>Filters</button>
      <div gogCollapsibleContent>
        <gog-button variant="outline">A focusable control</gog-button>
      </div>
    </gog-collapsible>
  `,
})
export class CollapsibleFocusOutExample {
  protected readonly open = signal(false);
}
