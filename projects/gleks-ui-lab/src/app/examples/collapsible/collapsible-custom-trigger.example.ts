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
      <!-- Still a <button>, because gogCollapsibleTrigger only wires (click) and the ARIA
           attributes — it adds no tabindex, no role and no key handling. On a <div> that
           leaves the trigger unreachable by keyboard. Put the directive on a natively
           focusable element and style that element however the design needs. -->
      <button type="button" gogCollapsibleTrigger class="card-header">
        <span class="card-header__title">Order #4471</span>
        <span class="card-header__meta">3 items · $86.40</span>
        <gog-icon [name]="open() ? 'chevron-up' : 'chevron-down'" />
      </button>

      <div gogCollapsibleContent class="card-body">
        <p>Shipped Aug 4 by standard courier, arriving Aug 6.</p>
      </div>
    </gog-collapsible>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    /* Nothing about this looks like a button any more — which is the point of the example. */
    .card-header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 4px 12px;
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      background: var(--gog-surface-color);
      color: var(--gog-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .card-header:hover {
      background: var(--gog-hover-color);
    }
    .card-header:focus-visible {
      outline: var(--gog-focus-ring-width) solid var(--gog-focus-ring-color);
      outline-offset: 2px;
    }
    .card-header__title {
      font-weight: 600;
    }
    .card-header__meta {
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
    /* Spacing on the inner <p>, not on the element carrying gogCollapsibleContent: that one
       collapses to max-height: 0, and its own padding survives as an empty strip. */
    .card-body {
      margin: 0;
    }
    .card-body p {
      margin: 0;
      padding: 12px 14px 0;
      color: var(--gog-muted-text-color);
    }
  `,
})
export class CollapsibleCustomTriggerExample {
  protected readonly open = signal(false);
}
