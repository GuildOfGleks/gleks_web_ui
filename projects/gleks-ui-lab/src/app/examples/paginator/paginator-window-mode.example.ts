import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <gog-paginator
      [(page)]="page"
      [totalPages]="totalPages()"
      [visiblePages]="5"
      [showFirstPage]="true"
      [showLastPage]="true"
    />
  `,
})
export class PaginatorWindowModeExample {
  protected readonly page = signal(10);
  protected readonly totalPages = signal(20);
}
