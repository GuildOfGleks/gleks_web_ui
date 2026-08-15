import { Component, signal } from '@angular/core';
import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn, ButtonComponent],
  template: `
    <gog-button size="sm" variant="outline" (gogClick)="showEmpty.set(!showEmpty())">
      {{ showEmpty() ? 'Show the rows' : 'Empty the table' }}
    </gog-button>

    <gog-table [value]="showEmpty() ? [] : rows">
      <gog-column field="component" header="Component" />
      <gog-column field="owner" header="Owner" />
    </gog-table>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    gog-table {
      align-self: stretch;
    }
  `,
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
