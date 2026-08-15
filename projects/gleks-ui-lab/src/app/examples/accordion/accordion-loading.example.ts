import { Component, signal } from '@angular/core';
import { AccordionComponent, ButtonComponent, GogAccordionItem } from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, ButtonComponent],
  template: `
    <gog-button (gogClick)="toggleLoading()">Toggle loading</gog-button>

    <gog-accordion [items]="items" [loading]="isAccordionLoading()" />
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
