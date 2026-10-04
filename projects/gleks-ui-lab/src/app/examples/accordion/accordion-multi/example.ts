import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  AccordionComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  ToggleComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, GogAccordionContentDirective, ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionMultiExample {
  protected readonly items: GogAccordionItem[] = [
    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },
    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },
    { id: 'security', title: 'Security', body: 'Manage two-factor authentication and sessions.' },
  ];
  protected readonly multi = signal(false);
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());
  protected readonly openList = computed(() => [...this.openIds()].join(', ') || 'none');
}
