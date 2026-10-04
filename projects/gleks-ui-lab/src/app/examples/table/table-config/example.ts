import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';
import { GogColumn, TableComponent } from '@guildofgleks/ui/table';

interface Row {
  component: string;
  status: string;
  owner: string | null;
  updated: string;
}

const ROWS: Row[] = [
  { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
  { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
  { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
  { component: 'Accordion', status: 'Planned', owner: null, updated: 'This week' },
  { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  { component: 'Toast', status: 'Ready', owner: 'Feedback', updated: 'This month' },
];

@Component({
  selector: 'app-example',
  imports: [GogColumn, TableComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own tables.
  providers: [
    provideGogConfig({
      labels: {
        total: 'Gesamt',
        tableEmpty: 'Keine Daten',
        tablePagination: 'Tabellenseiten',
        selectRow: 'Zeile auswählen',
        selectAllRows: 'Alle Zeilen auswählen',
      },
      paginator: { showPageSizeSelect: true, pageSizeOptions: [3, 6] },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableConfigExample {
  protected readonly rows = ROWS;
}
