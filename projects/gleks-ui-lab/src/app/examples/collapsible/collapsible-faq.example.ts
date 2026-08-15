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
  imports: [
    CollapsibleComponent,
    GogCollapsibleTriggerDirective,
    GogCollapsibleContentDirective,
    IconComponent,
  ],
  template: `
    <div class="list">
      @for (item of faqItems(); track item.id) {
        <gog-collapsible [open]="item.open" (openChange)="setOpen(item.id, $event)">
          <button type="button" gogCollapsibleTrigger class="trigger">
            <span>{{ item.question }}</span>
            <gog-icon name="chevron-down" class="chevron" />
          </button>

          <div gogCollapsibleContent class="panel">
            <p>{{ item.answer }}</p>
          </div>
        </gog-collapsible>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    /* One bordered list, rows divided rather than spaced — with no gap between rows an open
       panel reads as belonging to the question above it. */
    .list {
      border: 1px solid var(--gog-border-color);
      border-radius: var(--gog-radius);
      overflow: hidden;
    }
    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 12px 14px;
      border: 0;
      background: transparent;
      color: var(--gog-text-color);
      font: inherit;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
    }
    .trigger:hover {
      background: var(--gog-hover-color);
    }
    .trigger:focus-visible {
      outline: var(--gog-focus-ring-width) solid var(--gog-focus-ring-color);
      outline-offset: calc(var(--gog-focus-ring-width) * -1);
    }
    gog-collapsible + gog-collapsible .trigger {
      border-top: 1px solid var(--gog-border-color);
    }
    .chevron {
      color: var(--gog-muted-text-color);
      transition: transform var(--gog-duration-base) var(--gog-easing);
    }
    .trigger.gog-collapsible__trigger--open .chevron {
      transform: rotate(180deg);
      color: var(--gog-accent-color);
    }
    /* Spacing on the inner <p>, not on the collapsing element — see the overview example. */
    .panel {
      margin: 0;
    }
    .panel p {
      margin: 0;
      padding: 0 14px 14px;
      color: var(--gog-muted-text-color);
    }
  `,
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
