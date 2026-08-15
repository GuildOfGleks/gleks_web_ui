import { Component, signal } from '@angular/core';
import { AccordionComponent, ButtonComponent, GogAccordionItem } from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AccordionComponent, ButtonComponent],
})
export class AccordionLoadingExample {
  protected readonly isAccordionLoading = signal(false);
  protected readonly items: BasicItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
  ];

  protected toggleLoading(): void {
    this.isAccordionLoading.update((current) => !current);
  }
}
