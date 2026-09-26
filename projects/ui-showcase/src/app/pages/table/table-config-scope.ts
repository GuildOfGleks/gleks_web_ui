import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

/** The config the Configuration section renders its content under. Shown verbatim on the page. */
export const TABLE_SCOPE_CONFIG = {
  labels: {
    total: 'Gesamt',
    tablePagination: 'Tabellenseiten',
    selectRow: 'Zeile auswählen',
    selectAllRows: 'Alle Zeilen dieser Seite auswählen',
  },
};

/** `providers`, not `viewProviders`, so projected content resolves this config. */
@Component({
  selector: 'app-table-config-scope',
  template: '<ng-content />',
  providers: [provideGogConfig(TABLE_SCOPE_CONFIG)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableConfigScope {}
