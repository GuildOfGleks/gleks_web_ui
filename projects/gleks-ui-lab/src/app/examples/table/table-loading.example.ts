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
})
export class TableLoadingExample {
  protected readonly loading = signal(false);
  protected readonly rows = [/* ... */];

  protected toggleLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1200);
  }
}
