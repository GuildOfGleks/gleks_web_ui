import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  inject,
  input,
  TemplateRef,
} from '@angular/core';

export interface DocCellContext<R, C> {
  $implicit: R;
  row: R;
  col: C;
}

/**
 * The cell template of an `app-doc-matrix`, and the owner of its axes, so the template's
 * `let-` variables are typed by the values they iterate:
 *
 * ```html
 * <app-doc-matrix rowAxis="variant" colAxis="size">
 *   <ng-template appDocCell [rows]="variants" [cols]="sizes" let-variant let-size="col">
 *     <gog-button [variant]="variant" [size]="size">Label</gog-button>
 *   </ng-template>
 * </app-doc-matrix>
 * ```
 */
@Directive({ selector: 'ng-template[appDocCell]' })
export class DocCell<R, C> {
  readonly rows = input.required<readonly R[]>();
  readonly cols = input.required<readonly C[]>();
  readonly template = inject<TemplateRef<DocCellContext<R, C>>>(TemplateRef);

  static ngTemplateContextGuard<R, C>(
    _dir: DocCell<R, C>,
    _context: unknown,
  ): _context is DocCellContext<R, C> {
    return true;
  }
}

/**
 * Every combination of two axes, one cell each. A string value is printed as written in a
 * template; an object is printed by its `name`.
 */
@Component({
  selector: 'app-doc-matrix',
  imports: [NgTemplateOutlet],
  template: `
    @let c = cell();
    <div class="doc-matrix__scroll">
      <table class="doc-matrix">
        <thead>
          <tr>
            <th scope="col" class="doc-matrix__corner">
              <code>{{ rowAxis() }}</code>
              @if (colAxis()) {
                &#92; <code>{{ colAxis() }}</code>
              }
            </th>
            @for (col of c.cols(); track $index) {
              <th scope="col">
                <code>{{ label(col) }}</code>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of c.rows(); track $index) {
            <tr>
              <th scope="row">
                <code>{{ label(row) }}</code>
              </th>
              @for (col of c.cols(); track $index) {
                <td>
                  <ng-container
                    [ngTemplateOutlet]="c.template"
                    [ngTemplateOutletContext]="{ $implicit: row, row, col }"
                  />
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './doc-matrix.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocMatrix {
  readonly rowAxis = input.required<string>();
  /** Empty when the columns are not an axis but aspects of one row, e.g. `control` and `result`. */
  readonly colAxis = input('');
  protected readonly cell = contentChild.required(DocCell);

  protected label(value: unknown): string {
    if (typeof value === 'object' && value !== null && 'name' in value) return String(value.name);
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
}
