import { Component } from '@angular/core';
import { GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn],
})
export class TableFullWidthExample {
  protected readonly rows = [
    { component: 'Buttons', status: 'Ready' },
    { component: 'Checkbox', status: 'Ready' },
    { component: 'Table', status: 'In review' },
    { component: 'Accordion', status: 'Planned' },
  ];
}
