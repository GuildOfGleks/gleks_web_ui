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
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],
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
