import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

interface SparseRow {
  component: string;
  owner: string | null;
}

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <gog-table [value]="sparseRows" [showRowNumbers]="false" size="sm">
      <gog-column field="component" header="Component"></gog-column>
      <gog-column field="owner" header="Owner"></gog-column>
    </gog-table>

    <gog-table [value]="sparseRows" [showRowNumbers]="false" emptyPlaceholder="N/A" size="sm">
      <gog-column field="component" header="Component"></gog-column>
      <gog-column field="owner" header="Owner"></gog-column>
    </gog-table>
  `,
})
export class TableMissingValuesExample {
  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
  ];
}
