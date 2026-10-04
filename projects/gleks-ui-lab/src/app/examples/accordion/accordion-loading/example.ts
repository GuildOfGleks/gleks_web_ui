import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionLoadingExample {
  protected readonly loading = signal(true);
  protected readonly items: GogAccordionItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
    { id: 'warranty', title: 'Warranty', body: 'Not offered on this item.', disabled: true },
  ];
}
