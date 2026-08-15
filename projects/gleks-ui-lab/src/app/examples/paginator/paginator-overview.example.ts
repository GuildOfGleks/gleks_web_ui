import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `<gog-paginator [(page)]="page" [totalPages]="totalPages()" />`,
})
export class PaginatorOverviewExample {
  protected readonly page = signal(1);
  protected readonly totalPages = signal(20);
}
