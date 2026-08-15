import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  CollapsibleComponent,
  GogCollapsibleTriggerDirective,
  GogCollapsibleContentDirective,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
  ],
  template: `
    <gog-collapsible [(open)]="open" [disabled]="true">
      <button type="button" gogCollapsibleTrigger class="trigger">
        <span>Unavailable section</span>
        <gog-icon name="chevron-down" class="chevron" />
      </button>

      <div gogCollapsibleContent class="panel">
        <p>Opened from code, not by clicking the trigger.</p>
      </div>
    </gog-collapsible>

    <!-- The other half of the point: disabled stops the trigger, not the state. -->
    <gog-button size="sm" variant="outline" (gogClick)="open.set(!open())">
      Toggle from code
    </gog-button>
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
    }
    /* The directive sets aria-disabled rather than the disabled attribute, so the trigger stays
       reachable by keyboard and can announce itself. Styling follows that: dimmed, not hidden. */
    .trigger[aria-disabled='true'] {
      opacity: var(--gog-disabled-opacity);
      cursor: not-allowed;
    }
    .chevron {
      transition: transform var(--gog-duration-base) var(--gog-easing);
    }
    .trigger.gog-collapsible__trigger--open .chevron {
      transform: rotate(180deg);
    }
    .panel {
      margin: 0;
    }
    .panel p {
      margin: 0;
      padding: 12px 14px 0;
    }
  `,
})
export class CollapsibleDisabledExample {
  protected readonly open = signal(false);
}
