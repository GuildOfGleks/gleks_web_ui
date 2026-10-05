import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  ButtonComponent,
  EmptyStateComponent,
  GogEmptyStateActionsDirective,
  InputfieldComponent,
} from '@guildofgleks/ui';
import { GogColumn, GogTableEmptyDirective, TableComponent } from '@guildofgleks/ui/table';

interface Invoice {
  id: string;
  customer: string;
  total: string;
}

const INVOICES: Invoice[] = [
  { id: 'INV-1041', customer: 'Acme', total: '€1 200' },
  { id: 'INV-1042', customer: 'Globex', total: '€640' },
  { id: 'INV-1043', customer: 'Initech', total: '€2 310' },
];

@Component({
  selector: 'app-example',
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    GogColumn,
    GogEmptyStateActionsDirective,
    GogTableEmptyDirective,
    InputfieldComponent,
    TableComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEmptyExample {
  protected readonly query = signal('Umbrella');
  protected readonly matches = computed(() => {
    const query = this.query().trim().toLowerCase();
    return INVOICES.filter((invoice) =>
      `${invoice.id} ${invoice.customer}`.toLowerCase().includes(query),
    );
  });
}
