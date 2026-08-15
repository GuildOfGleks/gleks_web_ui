import { Component, signal } from '@angular/core';
import { PaginatorComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  template: `<gog-paginator [(page)]="page" [totalPages]="8" [disabled]="true" />`,
})
export class PaginatorDisabledExample {
  protected readonly page = signal(3);
}
