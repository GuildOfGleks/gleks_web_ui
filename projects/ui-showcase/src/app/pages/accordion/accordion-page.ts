import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
  IconComponent,
  type GogAccordionItem,
  type GogAccordionToggleEvent,
  type GogIconName,
  type GogSize,
} from '@guildofgleks/ui';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocCell, DocMatrix } from '../../doc/doc-matrix';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Labelled<T> {
  readonly name: string;
  readonly value: T;
}

interface FaqItem extends GogAccordionItem {
  readonly body: string;
}

interface StatusItem extends FaqItem {
  readonly icon: GogIconName;
  readonly subtitle: string;
}

interface A11yRow {
  readonly name: string;
  /** Which element's attributes the row prints. */
  readonly target: string;
}

/** Mutable: `items` takes `GogAccordionItem[]`, and a readonly array does not type-check. */
const FAQ: FaqItem[] = [
  { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days by standard courier.' },
  { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
  {
    id: 'warranty',
    title: 'Warranty',
    body: 'Not offered on this item.',
    disabled: true,
  },
];

@Component({
  selector: 'app-accordion-page',
  imports: [
    AccordionComponent,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    GogAccordionHeaderDirective,
    IconComponent,
    DocAttrs,
    DocCell,
    DocMatrix,
    DocPage,
    DocSection,
  ],
  templateUrl: './accordion-page.html',
  styleUrl: './accordion-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionPage {
  /** Open, closed and disabled, in that order, in every accordion of the States section. */
  protected readonly faq = FAQ;
  protected readonly firstOpen: ReadonlySet<string | number> = new Set(['shipping']);

  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly loadingStates: readonly Labelled<GogAccordionItem[]>[] = [
    { name: '[loading]="true", three items', value: FAQ },
    { name: '[loading]="true", items=[]', value: [] },
  ];
  protected readonly chevronAxis: readonly Labelled<boolean>[] = [
    { name: 'showChevron (default)', value: true },
    { name: '[showChevron]="false"', value: false },
  ];

  /** The single column of a matrix whose rows are the only axis. */
  protected readonly controlColumn = ['accordion'] as const;

  protected readonly statusItems: StatusItem[] = [
    {
      id: 'api',
      title: 'API',
      icon: 'success',
      subtitle: 'All endpoints responding',
      body: 'p99 latency is 118 ms across all regions.',
    },
    {
      id: 'database',
      title: 'Database',
      icon: 'warning',
      subtitle: 'Replica lag above threshold',
      body: 'The eu-west read replica is 4.2 s behind the primary.',
    },
    {
      id: 'queue',
      title: 'Queue',
      icon: 'error',
      subtitle: 'Consumers stopped',
      body: 'No messages have been consumed for 11 minutes.',
    },
  ];

  protected readonly singleOpen = signal<ReadonlySet<string | number>>(new Set());
  protected readonly multiOpen = signal<ReadonlySet<string | number>>(new Set());
  protected readonly lastToggle = signal('none yet');

  protected readonly a11yRows: readonly A11yRow[] = [
    { name: 'header — open', target: '.gog-accordion__item:nth-child(1) .gog-accordion__header' },
    { name: 'header — closed', target: '.gog-accordion__item:nth-child(2) .gog-accordion__header' },
    {
      name: 'header — disabled',
      target: '.gog-accordion__item:nth-child(3) .gog-accordion__header',
    },
    { name: 'body — closed', target: '.gog-accordion__item:nth-child(2) .gog-accordion__body' },
    { name: '[headingLevel]="3"', target: '[role=heading]' },
    { name: '[loading]="true"', target: 'gog-accordion' },
  ];

  protected ids(set: ReadonlySet<string | number>): string {
    return set.size === 0 ? '{}' : `{ ${[...set].join(', ')} }`;
  }

  protected onToggle(event: GogAccordionToggleEvent): void {
    this.lastToggle.set(`{ item: '${event.item.id}', open: ${event.open} }`);
  }

  protected closeAll(): void {
    this.multiOpen.set(new Set());
  }

  protected openAll(): void {
    this.multiOpen.set(new Set(FAQ.filter((item) => !item.disabled).map((item) => item.id)));
  }
}
