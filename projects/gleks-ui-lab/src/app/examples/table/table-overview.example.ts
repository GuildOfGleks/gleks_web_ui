import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

interface Row {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <gog-table [value]="rows">
      <gog-column field="component" header="Component" [sortable]="true"></gog-column>
      <gog-column field="status" header="Status" [sortable]="true"></gog-column>
      <gog-column field="owner" header="Owner"></gog-column>
      <gog-column field="updated" header="Updated"></gog-column>
    </gog-table>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class TableOverviewExample {
  protected readonly rows: Row[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
  ];
}
