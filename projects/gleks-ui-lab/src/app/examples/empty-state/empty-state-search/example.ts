import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  ButtonComponent,
  CardComponent,
  InputfieldComponent,
} from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    GogEmptyStateActionsDirective,
    InputfieldComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateSearchExample {
  private readonly invoices = ['INV-1041 Acme', 'INV-1042 Globex', 'INV-1043 Initech'];
  protected readonly query = signal('');
  protected readonly matches = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.invoices.filter((invoice) => invoice.toLowerCase().includes(query));
  });
}
