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
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AccordionComponent, GogAccordionContentDirective],
})
export class AccordionSizesExample {
  protected readonly sizeDemoItems: BasicItem[] = [
    { id: 'one', title: 'Sample section', body: 'Sample content for the size comparison.' },
  ];
  protected readonly sizeOption: GogSize = 'md';
}
