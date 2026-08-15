import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <gog-paginator [(page)]="page" [totalPages]="totalPages()" />
    <p class="readout">Page {{ page() }} of {{ totalPages() }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .readout {
      margin: 0;
      color: var(--gog-muted-text-color);
      font-size: 0.9em;
    }
  `,
})
export class PaginatorOverviewExample {
  protected readonly page = signal(1);
  protected readonly totalPages = signal(20);
}
