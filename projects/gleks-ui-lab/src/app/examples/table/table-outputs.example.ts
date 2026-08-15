import { Component, signal } from '@angular/core';
import {
  GogColumn,
  GogTableRowClickEvent,
  GogTableSortEvent,
  TableComponent,
} from '@guildofgleks/ui';

interface Row {
  readonly component: string;
  readonly status: string;
  readonly owner: string;
}

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn],
  template: `
    <gog-table
      [value]="rows"
      [pageSize]="3"
      [interactiveRows]="true"
      (gogSortChange)="onSortChange($event)"
      (gogPageChange)="onPageChange($event)"
      (gogRowClick)="onRowClick($event)"
    >
      <gog-column field="component" header="Component" [sortable]="true" />
      <gog-column field="status" header="Status" [sortable]="true" />
    </gog-table>

    <p class="readout">{{ lastEvent() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class TableOutputsExample {
  protected readonly rows: Row[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
  ];

  protected readonly lastEvent = signal('No event yet.');

  protected onSortChange(sort: GogTableSortEvent): void {
    // The third click clears the sort: { field: '', direction: null }.
    this.lastEvent.set(`sort: ${sort.field || '(cleared)'} ${sort.direction ?? ''}`);
  }

  protected onPageChange(page: number): void {
    // 1-based. Never fires on first render, nor for the reset a new sort causes.
    this.lastEvent.set(`page: ${page}`);
  }

  protected onRowClick(event: GogTableRowClickEvent<Row>): void {
    this.lastEvent.set(`row click: ${event.row.component} (index ${event.index})`);
  }
}
