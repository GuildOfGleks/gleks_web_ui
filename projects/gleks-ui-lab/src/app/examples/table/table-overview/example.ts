import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

interface Row {
  component: string;
  status: string;
  owner: string;
  updated: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableOverviewExample {
  // Enough rows that clicking a sortable header visibly reorders something — two rows can be
  // sorted, but not convincingly.
  protected readonly rows: Row[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design', updated: 'Today' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
    { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation', updated: 'This week' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
  ];
}
