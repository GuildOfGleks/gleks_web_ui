import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [AccordionComponent, ButtonComponent, GogAccordionContentDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionControlledExample {
  protected readonly items: GogAccordionItem[] = [
    { id: 'billing', title: 'Billing', body: 'Update your card or billing address.' },
    { id: 'notifications', title: 'Notifications', body: 'Choose which emails you receive.' },
    { id: 'security', title: 'Security', body: 'Manage two-factor authentication and sessions.' },
  ];
  protected readonly openIds = signal<ReadonlySet<string | number>>(new Set());

  protected openAll(): void {
    // A disabled item cannot be opened by the user, so the app does not open it either.
    this.openIds.set(new Set(this.items.filter((item) => !item.disabled).map((item) => item.id)));
  }

  protected closeAll(): void {
    this.openIds.set(new Set());
  }
}
