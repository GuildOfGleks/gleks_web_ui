import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <div class="case">
      <p class="case__label">Default — fills its container</p>
      <gog-table [value]="rows" [showRowNumbers]="false" size="sm">
        <gog-column field="component" header="Component" />
        <gog-column field="status" header="Status" />
      </gog-table>
    </div>

    <div class="case">
      <p class="case__label">[fullWidth]="false" — shrinks to its columns</p>
      <!-- The table is table-layout: fixed, so it splits its width evenly between columns
           instead of measuring the text. Shrink-to-fit therefore needs the column widths
           stated: without them the header of the widest column is cut off. -->
      <gog-table [value]="rows" [showRowNumbers]="false" [fullWidth]="false" size="sm">
        <gog-column field="component" header="Component" width="140px" />
        <gog-column field="status" header="Status" width="110px" />
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
export class TableFullWidthExample {
  protected readonly rows = [
    { component: 'Buttons', status: 'Ready' },
    { component: 'Checkbox', status: 'Ready' },
    { component: 'Table', status: 'In review' },
    { component: 'Accordion', status: 'Planned' },
  ];
}
