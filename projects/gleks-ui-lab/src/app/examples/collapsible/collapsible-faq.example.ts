import { Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogCollapsibleTriggerDirective,
  GogCollapsibleContentDirective,
} from '@guildofgleks/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-example',
  imports: [CollapsibleComponent, GogCollapsibleTriggerDirective, GogCollapsibleContentDirective],
  template: `
    @for (item of faqItems(); track item.id) {
      <gog-collapsible [open]="item.open" (openChange)="setOpen(item.id, $event)">
        <button type="button" gogCollapsibleTrigger>{{ item.question }}</button>
        <p gogCollapsibleContent>{{ item.answer }}</p>
      </gog-collapsible>
    }
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
export class CollapsibleFaqExample {
  protected readonly faqItems = signal<FaqItem[]>([
    {
      id: 'shipping',
      question: 'How long does shipping take?',
      answer: '2 business days.',
      open: false,
    },
    {
      id: 'returns',
      question: 'What is the return policy?',
      answer: '30 days, free.',
      open: false,
    },
  ]);

  protected setOpen(id: string, open: boolean): void {
    this.faqItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, open } : item)),
    );
  }
}
