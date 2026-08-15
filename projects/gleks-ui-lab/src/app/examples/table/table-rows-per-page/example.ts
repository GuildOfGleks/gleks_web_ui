import { Component, signal } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableRowsPerPageExample {
  protected readonly rows = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: 'Forms' },
    { component: 'Table', owner: 'Data' },
    { component: 'Accordion', owner: 'Navigation' },
    { component: 'Spinner', owner: 'Feedback' },
    { component: 'Toast', owner: 'Feedback' },
  ];

  // `pageSize` is a model on both the table and the paginator, which is exactly what lets
  // the select write back through the table without a go-between signal.
  protected readonly rowsPerPage = signal(2);
}
