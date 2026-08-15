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
    <gog-collapsible [(open)]="open" [disabled]="true">
      <button type="button" gogCollapsibleTrigger>Unavailable section</button>
      <p gogCollapsibleContent>You should never see this — the trigger is inert.</p>
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
export class CollapsibleDisabledExample {
  protected readonly open = signal(false);
}
