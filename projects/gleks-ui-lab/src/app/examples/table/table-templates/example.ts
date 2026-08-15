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
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [
    TableComponent,
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    TagComponent,
  ],
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
