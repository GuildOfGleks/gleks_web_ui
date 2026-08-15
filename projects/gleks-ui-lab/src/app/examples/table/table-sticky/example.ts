import { Component } from '@angular/core';
import { GogColumn, ScrollComponent, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn, ScrollComponent],
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
    { component: 'Tooltip', status: 'Ready', owner: 'Overlays' },
    { component: 'Dialog', status: 'Ready', owner: 'Overlays' },
    { component: 'Select', status: 'In review', owner: 'Forms' },
    { component: 'Slider', status: 'Ready', owner: 'Forms' },
    { component: 'Paginator', status: 'Planned', owner: 'Data' },
  ];
}
