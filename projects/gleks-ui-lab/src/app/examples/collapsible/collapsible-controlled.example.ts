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
    <div class="controls">
      <gog-button size="sm" (gogClick)="open.set(true)">Open</gog-button>
      <gog-button size="sm" variant="outline" (gogClick)="open.set(false)">Close</gog-button>
    </div>

    <gog-collapsible [(open)]="open">
      <div gogCollapsibleContent class="panel">
        <p>No gogCollapsibleTrigger anywhere — [open] is driven entirely from outside.</p>
      </div>
    </gog-collapsible>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    /* Spacing on the inner <p>, not on the collapsing element — see the overview example. */
    .panel {
      margin: 0;
    }
    .panel p {
      margin: 0;
      padding: 12px 14px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: var(--gog-surface-color);
    }
  `,
})
export class CollapsibleControlledExample {
  protected readonly open = signal(false);
}
