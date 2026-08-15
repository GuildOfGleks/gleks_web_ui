import { Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogCollapsibleTriggerDirective,
  GogCollapsibleContentDirective,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
  ],
  template: `
    <gog-collapsible [(open)]="open">
      <div class="card-header" gogCollapsibleTrigger>
        <span>Order #4471</span>
        <gog-icon [name]="open() ? 'chevron-up' : 'chevron-down'" />
      </div>
      <div gogCollapsibleContent class="card-body">
        <p>3 items — shipped Aug 4, arriving Aug 6.</p>
      </div>
    </gog-collapsible>
  `,
})
export class CollapsibleCustomTriggerExample {
  protected readonly open = signal(false);
}
