import { Component } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <gog-paginator [totalPages]="5" [page]="2" />
    <gog-paginator [totalPages]="5" [page]="2" [fullWidth]="false" />
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
export class PaginatorFullWidthExample {}
