import { Component } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective],
  template: `
    <gog-accordion [items]="items" [headingLevel]="3">
      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
})
export class AccordionHeadingLevelExample {
  protected readonly items: BasicItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
  ];
}
