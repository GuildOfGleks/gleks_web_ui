import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogAccordionToggleEvent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionOverviewExample {
  protected readonly items: GogAccordionItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
    { id: 'warranty', title: 'Warranty', body: 'Not offered on this item.', disabled: true },
  ];
  protected readonly lastToggle = signal('none yet');

  protected onToggle(event: GogAccordionToggleEvent): void {
    this.lastToggle.set(`${event.item.title} ${event.open ? 'opened' : 'closed'}`);
  }
}
