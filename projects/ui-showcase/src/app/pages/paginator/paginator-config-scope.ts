import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const PAGINATOR_SCOPE_CONFIG = {
  labels: {
    pagination: 'Seitennavigation',
    previousPage: 'Vorherige Seite',
    nextPage: 'Nächste Seite',
    rowsPerPage: 'Zeilen pro Seite',
  },
  paginator: { showPageSizeSelect: true, pageSizeOptions: [5, 25] },
};

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-paginator-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(PAGINATOR_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorConfigScope {}
