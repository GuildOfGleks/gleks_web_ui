import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
  IconComponent,
  InputfieldComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
    InputfieldComponent,
  ],
  template: `
    <gog-collapsible [(open)]="open" [collapseOnFocusOut]="true">
      <button type="button" gogCollapsibleTrigger class="trigger">
        <span>Filters</span>
        <gog-icon name="chevron-down" class="chevron" />
      </button>

      <div gogCollapsibleContent class="panel">
        <div class="fields">
          <gog-inputfield label="Keyword" placeholder="rope" [(value)]="keyword" />
          <gog-button size="sm" variant="outline">Apply</gog-button>
        </div>
      </div>
    </gog-collapsible>

    <!-- Something to Tab *to*: without a focus target after the panel there is nothing to
         demonstrate, since the collapse is triggered by focus leaving. -->
    <gog-button size="sm" variant="ghost">Tab here to close the panel</gog-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      max-width: 420px;
    }
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
    .trigger.gog-collapsible__trigger--open .chevron {
      transform: rotate(180deg);
    }
    /* Spacing on the inner element, not on the collapsing one — see the overview example. */
    .panel {
      margin: 0;
    }
    .fields {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 0 0;
    }
  `,
})
export class CollapsibleFocusOutExample {
  protected readonly open = signal(false);
  protected readonly keyword = signal('');
}
