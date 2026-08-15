import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <gog-table [value]="rows" [pageSize]="3" [showTotal]="true" totalPosition="left">
      <gog-column field="component" header="Component" [sortable]="true"></gog-column>
      <gog-column field="status" header="Status" [sortable]="true"></gog-column>
      <gog-column field="owner" header="Owner"></gog-column>
    </gog-table>
  `,
})
export class TablePaginationExample {
  protected readonly rows = [/* ... */];
}
