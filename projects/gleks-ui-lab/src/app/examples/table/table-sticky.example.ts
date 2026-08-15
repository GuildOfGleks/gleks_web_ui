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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class TableStickyExample {
  protected readonly rows = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },
    { component: 'Toast', status: 'Ready', owner: 'Feedback' },
    { component: 'Tabs', status: 'In review', owner: 'Navigation' },
  ];
}
