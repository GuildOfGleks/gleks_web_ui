import { Component } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionChevronDirective,
  GogAccordionContentDirective,
  GogAccordionHeaderDirective,
  GogAccordionItem,
  GogIconName,
  IconComponent,
} from '@guildofgleks/ui';

interface StatusItem extends GogAccordionItem {
  icon: GogIconName;
  subtitle: string;
  body: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    AccordionComponent,
    GogAccordionHeaderDirective,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    IconComponent,
  ],
})
export class AccordionCustomHeaderExample {
  protected readonly statusItems: StatusItem[] = [
    {
      id: 'api',
      title: 'API',
      icon: 'success',
      subtitle: 'All endpoints responding normally',
      body: 'p99 latency is 118ms across all regions.',
    },
    {
      id: 'database',
      title: 'Database',
      icon: 'warning',
      subtitle: 'Replica lag above threshold',
      body: 'The eu-west read replica is 4.2s behind primary.',
    },
  ];
}
