import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, CollapsibleComponent, GogCollapsibleContentDirective],
  template: `
    <gog-button (gogClick)="open.set(true)">Open</gog-button>
    <gog-button (gogClick)="open.set(false)">Close</gog-button>

    <gog-collapsible [(open)]="open">
      <p gogCollapsibleContent>
        No gogCollapsibleTrigger anywhere — [open] is driven entirely from outside.
      </p>
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
export class CollapsibleControlledExample {
  protected readonly open = signal(false);
}
