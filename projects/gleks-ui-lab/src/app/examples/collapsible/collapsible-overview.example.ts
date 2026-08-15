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
      <button type="button" gogCollapsibleTrigger class="trigger">
        <span>{{ open() ? 'Hide details' : 'Show details' }}</span>
        <gog-icon name="chevron-down" class="chevron" />
      </button>

      <div gogCollapsibleContent class="panel">
        <p>Ships within 2 business days via standard courier.</p>
      </div>
    </gog-collapsible>

    <p class="readout">Open: {{ open() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    /* The component renders no box of its own, so the trigger is styled here — a bare
       <button> would otherwise show up as the browser's default grey control. */
    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: var(--gog-surface-color);
      color: var(--gog-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--gog-hover-color);
    }
    .trigger:focus-visible {
      outline: var(--gog-focus-ring-width) solid var(--gog-focus-ring-color);
      outline-offset: 2px;
    }
    .chevron {
      transition: transform var(--gog-duration-base) var(--gog-easing);
    }
    /* --open is set by gogCollapsibleTrigger itself; nothing here tracks state. */
    .trigger.gog-collapsible__trigger--open .chevron {
      transform: rotate(180deg);
    }
    /* Spacing goes on the inner element, never on the one carrying gogCollapsibleContent:
       that one collapses to max-height: 0, and its own margin or padding survives the
       collapse as a visible empty strip under the trigger. */
    .panel {
      margin: 0;
    }
    .panel p {
      margin: 0;
      padding: 12px 14px 0;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class CollapsibleOverviewExample {
  protected readonly open = signal(false);
}
