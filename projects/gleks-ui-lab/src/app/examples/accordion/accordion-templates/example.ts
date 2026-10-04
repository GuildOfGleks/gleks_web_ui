import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
  GogAccordionItem,
  IconComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    AccordionComponent,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    GogAccordionHeaderDirective,
    IconComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionTemplatesExample {
  protected readonly services: GogAccordionItem[] = [
    {
      id: 'api',
      title: 'API',
      icon: 'success',
      color: 'var(--gog-success-color)',
      subtitle: 'all endpoints responding',
      body: 'p99 latency is 118ms across all regions.',
    },
    {
      id: 'database',
      title: 'Database',
      icon: 'warning',
      color: 'var(--gog-warning-color)',
      subtitle: 'replica lag above threshold',
      body: 'The eu-west read replica is 4.2s behind primary.',
    },
    {
      id: 'cache',
      title: 'Cache',
      icon: 'error',
      color: 'var(--gog-danger-color)',
      subtitle: 'cluster unreachable',
      body: 'Connection to the cache cluster timed out.',
    },
  ];
  protected readonly faq: GogAccordionItem[] = [
    {
      id: 'shipping',
      title: 'Shipping',
      body: 'Ships within 2 business days via standard courier.',
    },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days of delivery.' },
  ];
}
