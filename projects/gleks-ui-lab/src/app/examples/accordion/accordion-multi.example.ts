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
    <gog-button (gogClick)="toggleMulti()"> Multi-open: {{ multi() ? 'on' : 'off' }} </gog-button>

    <gog-accordion [items]="multiItems" [multi]="multi()">
      <ng-template gogAccordionContent let-item>
        <p>{{ item.body }}</p>
      </ng-template>
    </gog-accordion>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
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
