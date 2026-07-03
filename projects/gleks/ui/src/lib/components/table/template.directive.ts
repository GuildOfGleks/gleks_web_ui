import { Directive, inject, input, TemplateRef } from '@angular/core';

export interface GogTableBodyContext<T> {
  $implicit: T;
  index: number;
}

export interface GogTableHeaderContext {
  $implicit: never;
}

/**
 * Marks a <ng-template> inside <gog-table> with a field name and optional type.
 *
 * Usage:
 *   <ng-template template="status" type="body" let-row>...</ng-template>
 *   <ng-template template="status" type="header">...</ng-template>
 */
@Directive({
  selector: '[template]',
})
export class TemplateDirective {
  readonly template = input.required<string>();
  readonly type = input<'body' | 'header'>('body');

  readonly templateRef = inject(TemplateRef<unknown>);

  static ngTemplateContextGuard<T>(
    _dir: TemplateDirective,
    ctx: unknown,
  ): ctx is GogTableBodyContext<T> | GogTableHeaderContext {
    return true;
  }
}
