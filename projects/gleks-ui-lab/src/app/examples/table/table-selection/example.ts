import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSelectionExample {
  protected readonly rows = ROWS;
  protected readonly selection = signal<Row[]>([]);
  protected readonly names = computed(
    () =>
      this.selection()
        .map((row) => row.component)
        .join(', ') || 'nothing',
  );
}
