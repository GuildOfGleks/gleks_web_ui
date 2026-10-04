import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PaginatorComponent, provideGogConfig } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [PaginatorComponent],
  // Usually in app.config.ts; here on the component, so it reaches only its own paginator.
  providers: [
    provideGogConfig({
      labels: {
        pagination: 'Seitennavigation',
        previousPage: 'Vorherige Seite',
        nextPage: 'Nächste Seite',
        rowsPerPage: 'Zeilen pro Seite',
        page: (page, isCurrent) => (isCurrent ? `Seite ${page}` : `Gehe zu Seite ${page}`),
      },
      paginator: { showPageSizeSelect: true, pageSizeOptions: [5, 25] },
    }),
  ],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorConfigExample {
  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
}
