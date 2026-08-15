import { Component } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogAccordionToggleEvent,
} from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective],
  template: `
    <gog-accordion [items]="items" [expandFirst]="true" (gogToggle)="onToggle($event)">
      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class AccordionOverviewExample {
  protected readonly items: BasicItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
  ];

  protected onToggle(event: GogAccordionToggleEvent): void {
    console.log(event.item.title, event.open);
  }
}
