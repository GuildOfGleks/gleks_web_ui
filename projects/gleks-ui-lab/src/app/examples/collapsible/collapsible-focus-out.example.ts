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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      max-width: 420px;
    }
  `,
})
export class CollapsibleFocusOutExample {
  protected readonly open = signal(false);
}
