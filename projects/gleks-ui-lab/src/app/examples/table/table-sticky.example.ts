import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <div style="max-height: 260px; overflow-y: auto;">
      <gog-table [value]="rows" [stickyHeader]="true">
        <gog-column field="component" header="Component"></gog-column>
        <gog-column field="status" header="Status"></gog-column>
        <gog-column field="owner" header="Owner"></gog-column>
      </gog-table>
    </div>
  `,
})
export class TableStickyExample {
  protected readonly rows = [/* six or more rows, so the container actually scrolls */];
}
