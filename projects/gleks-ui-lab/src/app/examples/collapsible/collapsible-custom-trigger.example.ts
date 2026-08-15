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
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: var(--gog-surface-color);
      cursor: pointer;
    }
    .card-body {
      padding: 0 14px;
    }
  `,
})
export class CollapsibleCustomTriggerExample {
  protected readonly open = signal(false);
}
