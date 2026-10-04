import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CollapsibleComponent,
  GogButtonDirective,
  GogCollapsibleContentDirective,
  GogCollapsibleTriggerDirective,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    CollapsibleComponent,
    GogButtonDirective,
    GogCollapsibleContentDirective,
    GogCollapsibleTriggerDirective,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleListExample {
  protected readonly faq = signal([
    { id: 'shipping', title: 'Shipping', body: 'Ships within 2 business days.', open: false },
    { id: 'returns', title: 'Returns', body: 'Free returns within 30 days.', open: false },
    { id: 'warranty', title: 'Warranty', body: 'Two years on parts and labour.', open: false },
  ]);

  protected setOpen(id: string, open: boolean): void {
    this.faq.update((items) => items.map((item) => (item.id === id ? { ...item, open } : item)));
  }
}
