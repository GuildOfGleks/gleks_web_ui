import { Component } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogSize,
} from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective],
  template: `
    <gog-accordion [items]="sizeDemoItems" [size]="sizeOption" [expandFirst]="true">
      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
})
export class AccordionSizesExample {
  protected readonly sizeDemoItems: BasicItem[] = [
    { id: 'one', title: 'Sample section', body: 'Sample content for the size comparison.' },
  ];
  protected readonly sizeOption: GogSize = 'md';
}
