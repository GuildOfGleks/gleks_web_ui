import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

interface Item {
  readonly id: number;
}

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <gog-paginator
      [(page)]="page"
      [(pageSize)]="pageSize"
      [totalRecords]="items().length"
      [showPageSizeSelect]="true"
      [pageSizeOptions]="[10, 20, 50]"
    />
    <p>Page {{ page() }}, {{ pageSize() }} per page, {{ items().length }} records.</p>
  `,
})
export class PaginatorRecordsExample {
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly items = signal<Item[]>(
    Array.from({ length: 137 }, (_, index) => ({ id: index + 1 })),
  );

  // No `totalPages` computed to write, and none to keep in sync with the size select: the
  // paginator derives the page count from totalRecords and pageSize itself.
}
