import { Component, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@guildofgleks/ui';

interface BasicItem extends GogAccordionItem {
  body: string;
}

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],
  template: `
    <gog-button (gogClick)="expandAll()">Expand all</gog-button>
    <gog-button (gogClick)="collapseAll()">Collapse all</gog-button>

    <gog-accordion [items]="multiItems" [multi]="true" [(openIds)]="openIds">
      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
})
export class AccordionControlledExample {
  protected readonly multiItems: BasicItem[] = [
    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },
    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },
  ];
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());

  protected expandAll(): void {
    this.openIds.set(new Set(this.multiItems.map((item) => item.id)));
  }

  protected collapseAll(): void {
    this.openIds.set(new Set());
  }
}
