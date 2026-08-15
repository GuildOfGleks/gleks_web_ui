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
    <div class="case">
      <p class="case__label">Default — emptyPlaceholder is "-"</p>
      <gog-table [value]="sparseRows" [showRowNumbers]="false" size="sm">
        <gog-column field="component" header="Component" />
        <gog-column field="owner" header="Owner" />
      </gog-table>
    </div>

    <div class="case">
      <p class="case__label">emptyPlaceholder="Unassigned"</p>
      <gog-table
        [value]="sparseRows"
        [showRowNumbers]="false"
        emptyPlaceholder="Unassigned"
        size="sm"
      >
        <gog-column field="component" header="Component" />
        <gog-column field="owner" header="Owner" />
      </gog-table>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
    }
    .case {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .case__label {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class TableMissingValuesExample {
  protected readonly sparseRows: SparseRow[] = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: null },
    { component: 'Table', owner: 'Data' },
  ];
}
