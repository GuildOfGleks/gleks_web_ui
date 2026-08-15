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
  imports: [
    AccordionComponent,
    GogAccordionHeaderDirective,
    GogAccordionChevronDirective,
    GogAccordionContentDirective,
    IconComponent,
  ],
  template: `
    <gog-accordion [items]="statusItems">
      <ng-template gogAccordionHeader let-item let-open="open">
        <gog-icon [name]="item.icon" />
        <span>{{ item.title }}</span>
        <span>{{ open ? 'Expanded' : item.subtitle }}</span>
      </ng-template>

      <ng-template gogAccordionChevron let-open="open">
        <gog-icon [name]="open ? 'chevron-up' : 'chevron-down'" />
      </ng-template>

      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
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
