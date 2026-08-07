import { Directive, inject, input, TemplateRef } from '@angular/core';

export interface GogTableBodyContext<T> {
  $implicit: T;
  index: number;
}

export interface GogTableHeaderContext {
  $implicit: never;
}

/**
 * Marks a `<ng-template>` inside `<gog-table>` with a field name and optional type:
 *
 * ```html
 * <ng-template template="status" type="body" let-row>…</ng-template>
 * ```
 *
 * @deprecated since 21.3.0 (2026-08-07) — declare the template inside its own column with
 * `gogColumnBody` / `gogColumnHeader` instead. Removed in 21.5.0.
 *
 * The field name here is a string the compiler cannot check, so a typo silently renders the
 * default cell rather than failing; the column-scoped directives bind structurally and carry a
 * typed context. Migration:
 *
 * ```html
 * <!-- before -->
 * <gog-column field="status" />
 * <ng-template template="status" type="body" let-row>…</ng-template>
 *
 * <!-- after -->
 * <gog-column field="status">
 *   <ng-template gogColumnBody let-row>…</ng-template>
 * </gog-column>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- deprecated legacy selector, see above
  selector: '[template]',
})
export class TemplateDirective {
  readonly template = input.required<string>();
  readonly type = input<'body' | 'header'>('body');

  readonly templateRef = inject(TemplateRef<unknown>);

  static ngTemplateContextGuard<T>(
    _dir: TemplateDirective,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogTableBodyContext<T> | GogTableHeaderContext {
    return true;
  }
}
