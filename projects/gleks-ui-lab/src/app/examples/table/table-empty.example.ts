import { Component, signal } from '@angular/core';
import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn, ButtonComponent],
  template: `
    <gog-button (gogClick)="showEmpty.set(!showEmpty())">Toggle</gog-button>
    <gog-table [value]="showEmpty() ? [] : rows">
      <gog-column field="component" header="Component"></gog-column>
      <gog-column field="owner" header="Owner"></gog-column>
    </gog-table>
  `,
})
export class TableEmptyExample {
  protected readonly showEmpty = signal(false);
  protected readonly rows = [/* ... */];
}
