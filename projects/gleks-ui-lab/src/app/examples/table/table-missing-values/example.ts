import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

interface SparseRow {
  component: string;
  owner: string | null;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableMissingValuesExample {
  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
    { component: 'Table', owner: 'Data' },
  ];
}
