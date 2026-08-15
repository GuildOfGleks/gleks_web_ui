import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <gog-table [value]="rows" [showRowNumbers]="false" [fullWidth]="false" size="sm">
      <gog-column field="component" header="Component"></gog-column>
      <gog-column field="status" header="Status"></gog-column>
    </gog-table>
  `,
})
export class TableFullWidthExample {
  protected readonly rows = [/* ... */];
}
