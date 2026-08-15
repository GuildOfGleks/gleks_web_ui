import { Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogCollapsibleTriggerDirective,
  GogCollapsibleContentDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    <gog-collapsible [(open)]="open">
      <button type="button" gogCollapsibleTrigger>
        {{ open() ? 'Hide details' : 'Show details' }}
      </button>
      <p gogCollapsibleContent>Ships within 2 business days via standard courier.</p>
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
export class CollapsibleOverviewExample {
  protected readonly open = signal(false);
}
