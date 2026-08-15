import { Component, signal } from '@angular/core';
import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [TableComponent, GogColumn, ButtonComponent],
})
export class TableEmptyExample {
  protected readonly showEmpty = signal(false);
  protected readonly rows = [
    { component: 'Buttons', owner: 'Design' },
    { component: 'Checkbox', owner: 'Forms' },
    { component: 'Table', owner: 'Data' },
    { component: 'Accordion', owner: 'Navigation' },
  ];
}
