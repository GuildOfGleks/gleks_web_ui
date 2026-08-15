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
export class AccordionMultiExample {
  protected readonly multi = signal(false);
  protected readonly multiItems: BasicItem[] = [
    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },
    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },
  ];

  protected toggleMulti(): void {
    this.multi.update((current) => !current);
  }
}
