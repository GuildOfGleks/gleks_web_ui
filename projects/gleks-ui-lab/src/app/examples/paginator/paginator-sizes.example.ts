import { Component, signal } from '@angular/core';
import { GogSize, PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    @for (sizeOption of sizes; track sizeOption) {
      <gog-paginator [totalPages]="5" [page]="page()" [size]="sizeOption" />
    }
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
export class PaginatorSizesExample {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly page = signal(2);
}
