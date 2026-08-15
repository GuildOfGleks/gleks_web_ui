import { Component } from '@angular/core';
import {
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  GogTagVariant,
  TableComponent,
  TagComponent,
} from '@guildofgleks/ui';

const STATUS_VARIANTS: Record<string, GogTagVariant> = {
  Ready: 'success',
  'In review': 'warning',
  Planned: 'info',
};

interface Row {
  readonly component: string;
  readonly status: string;
  readonly owner: string;
}

@Component({
  selector: 'app-example',
  imports: [
    TableComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    TagComponent,
  ],
  template: `
    <gog-table [value]="rows" [showRowNumbers]="false">
      <gog-column field="component" header="Component" [sortable]="true"></gog-column>

      <gog-column field="status" header="Status">
        <ng-template gogColumnHeader let-header>
          <span class="status-header">{{ header }}</span>
        </ng-template>
        <ng-template gogColumnBody let-row let-value="value">
          <gog-tag [variant]="statusVariant(asRow(row).status)" size="sm">{{ value }}</gog-tag>
        </ng-template>
      </gog-column>

      <gog-column field="owner" header="Owner"></gog-column>
    </gog-table>
  `,
})
export class TableTemplatesExample {
  protected readonly rows: Row[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
  ];

  // The slot hands the row back as unknown, so narrow it once here.
  protected asRow(row: unknown): Row {
    return row as Row;
  }

  protected statusVariant(status: string): GogTagVariant {
    return STATUS_VARIANTS[status] ?? 'info';
  }
}
