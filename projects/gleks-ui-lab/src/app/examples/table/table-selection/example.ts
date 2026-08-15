import { Component, signal } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

interface Row {
  readonly component: string;
  readonly status: string;
  readonly owner: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableSelectionExample {
  protected readonly rows: Row[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
  ];

  // Always an array — in "single" mode it simply holds zero or one row, so there is
  // one shape to read rather than a T | T[] | null union to narrow on every access.
  protected readonly selection = signal<Row[]>([]);
}
