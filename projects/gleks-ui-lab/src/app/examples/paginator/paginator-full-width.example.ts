import { Component } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `
    <gog-paginator [totalPages]="5" [page]="2" />
    <gog-paginator [totalPages]="5" [page]="2" [fullWidth]="false" />
  `,
})
export class PaginatorFullWidthExample {}
