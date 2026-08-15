import { Component, signal } from '@angular/core';
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
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AccordionComponent, GogAccordionContentDirective],
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

  protected readonly lastToggled = signal('No section toggled yet.');

  protected onToggle(event: GogAccordionToggleEvent): void {
    this.lastToggled.set(`${event.item.title} ${event.open ? 'opened' : 'closed'}`);
  }
}
