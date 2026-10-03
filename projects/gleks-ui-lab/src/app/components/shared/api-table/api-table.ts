import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SinceBadgeComponent } from '../since-badge/since-badge';

/**
 * One row of an API table. `type` is the input's type, an output's payload or a slot's context;
 * `default` is shown only for inputs.
 */
export interface ApiRow {
  readonly name: string;
  readonly type?: string;
  readonly default?: string;
  readonly description: string;
  readonly since?: string;
}

/** Which table: it picks the column set, so every page's tables read the same way. */
export type ApiTableKind = 'inputs' | 'outputs' | 'slots' | 'methods' | 'directives' | 'tokens';

interface Column {
  readonly label: string;
  readonly field: 'name' | 'type' | 'default' | 'description';
}

const COLUMNS: Record<ApiTableKind, readonly Column[]> = {
  inputs: [
    { label: 'Name', field: 'name' },
    { label: 'Type', field: 'type' },
    { label: 'Default', field: 'default' },
    { label: 'Description', field: 'description' },
  ],
  outputs: [
    { label: 'Name', field: 'name' },
    { label: 'Payload', field: 'type' },
    { label: 'Description', field: 'description' },
  ],
  slots: [
    { label: 'Directive', field: 'name' },
    { label: 'Context', field: 'type' },
    { label: 'Description', field: 'description' },
  ],
  directives: [
    { label: 'Selector', field: 'name' },
    { label: 'Goes on', field: 'type' },
    { label: 'Description', field: 'description' },
  ],
  methods: [
    { label: 'Signature', field: 'name' },
    { label: 'Description', field: 'description' },
  ],
  tokens: [
    { label: 'Token', field: 'name' },
    { label: 'Description', field: 'description' },
  ],
};

/**
 * The API reference table every component page uses (`docs/lab-component-pages.md`, D8), so
 * column order, `since` chips and wrapping are the same everywhere and a fix lands once.
 */
@Component({
  selector: 'app-api-table',
  imports: [SinceBadgeComponent],
  templateUrl: './api-table.html',
  styleUrl: './api-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiTableComponent {
  readonly rows = input.required<readonly ApiRow[]>();
  readonly kind = input<ApiTableKind>('inputs');

  protected readonly columns = computed(() => COLUMNS[this.kind()]);
}
