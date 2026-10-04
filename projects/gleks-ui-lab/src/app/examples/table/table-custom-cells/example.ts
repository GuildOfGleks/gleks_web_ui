import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GogTagVariant, IconComponent, TagComponent } from '@guildofgleks/ui';
import {
  GogColumn,
  GogColumnBodyDirective,
  GogColumnHeaderDirective,
  TableComponent,
} from '@guildofgleks/ui/table';

interface Row {
  component: string;
  status: string;
  owner: string | null;
  updated: string;
}

const ROWS: Row[] = [
  { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
  { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
  { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
  { component: 'Accordion', status: 'Planned', owner: null, updated: 'This week' },
  { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  { component: 'Toast', status: 'Ready', owner: 'Feedback', updated: 'This month' },
];

@Component({
  selector: 'app-example',
  imports: [
    GogColumn,
    GogColumnBodyDirective,
    GogColumnHeaderDirective,
    IconComponent,
    TableComponent,
    TagComponent,
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCustomCellsExample {
  protected readonly rows = ROWS;
  protected readonly variants: Partial<Record<string, GogTagVariant>> = {
    Ready: 'success',
    'In review': 'warning',
    Planned: 'info',
  };
}
