import { Component, signal } from '@angular/core';
import { ButtonComponent, GogColumn, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn, ButtonComponent],
  template: `
    <gog-button (gogClick)="toggleLoading()">Toggle loading</gog-button>
    <gog-table [value]="rows" [loading]="loading()">
      <gog-column field="component" header="Component"></gog-column>
      <gog-column field="status" header="Status"></gog-column>
    </gog-table>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class TableLoadingExample {
  protected readonly loading = signal(false);
  protected readonly rows = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },
    { component: 'Toast', status: 'Ready', owner: 'Feedback' },
    { component: 'Tabs', status: 'In review', owner: 'Navigation' },
  ];

  protected toggleLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }
}
