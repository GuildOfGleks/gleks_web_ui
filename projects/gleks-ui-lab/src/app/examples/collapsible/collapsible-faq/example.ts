import { Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogCollapsibleTriggerDirective,
  GogCollapsibleContentDirective,
  IconComponent,
} from '@guildofgleks/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
  ],
})
export class CollapsibleFaqExample {
  protected readonly faqItems = signal<FaqItem[]>([
    {
      id: 'shipping',
      question: 'How long does shipping take?',
      answer: 'Two business days, by standard courier.',
      open: false,
    },
    {
      id: 'returns',
      question: 'What is the return policy?',
      answer: 'Thirty days from delivery, and returns are free.',
      open: false,
    },
  ]);

  protected setOpen(id: string, open: boolean): void {
    this.faqItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, open } : item)),
    );
  }
}
