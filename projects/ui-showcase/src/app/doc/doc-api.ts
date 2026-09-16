import { ChangeDetectionStrategy, Component, computed, input, type Type } from '@angular/core';

import { exportName } from '../registry/registry';

export interface DocInput {
  readonly name: string;
  /** As declared, e.g. `GogSize | undefined`. */
  readonly type: string;
  /** The value an instance ends up with when nothing sets the input. */
  readonly default: string;
  /** Where an unset value comes from before the default, e.g. `GOG_CONFIG.control.size`. */
  readonly config?: string;
}

export interface DocOutput {
  readonly name: string;
  readonly payload: string;
}

/**
 * The public API of one component or directive. Names are checked against the compiled class by
 * `pages/pages.spec.ts`; types and defaults are written by hand and are what the spec cannot see.
 */
export interface DocApi {
  readonly type: Type<unknown>;
  readonly inputs: readonly DocInput[];
  readonly outputs: readonly DocOutput[];
}

@Component({
  selector: 'app-doc-api',
  template: `
    <h3>{{ symbol() }}</h3>
    <div class="doc-api__scroll">
      <table class="doc-api">
        <colgroup>
          <col class="doc-api__name" />
          <col class="doc-api__type" />
          <col class="doc-api__default" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Input</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Unset reads</th>
          </tr>
        </thead>
        <tbody>
          @for (row of api().inputs; track row.name) {
            <tr>
              <th scope="row">
                <code>{{ row.name }}</code>
              </th>
              <td>
                <code>{{ row.type }}</code>
              </td>
              <td>
                <code>{{ row.default }}</code>
              </td>
              <td>
                <code>{{ row.config ?? '—' }}</code>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4">No inputs.</td>
            </tr>
          }
        </tbody>
        <thead>
          <tr>
            <th scope="col">Output</th>
            <th scope="col" colspan="3">Payload</th>
          </tr>
        </thead>
        <tbody>
          @for (row of api().outputs; track row.name) {
            <tr>
              <th scope="row">
                <code>{{ row.name }}</code>
              </th>
              <td colspan="3">
                <code>{{ row.payload }}</code>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4">No outputs.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './doc-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocApiTable {
  readonly api = input.required<DocApi>();
  protected readonly symbol = computed(() => exportName(this.api().type));
}
