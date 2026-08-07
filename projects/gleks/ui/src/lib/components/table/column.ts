import { Directive, TemplateRef, contentChild, inject, input } from '@angular/core';

/** Case-insensitive, numeric-aware (`"item2" < "item10"`) — the sensible default for text. */
const defaultCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Default comparator: locale-aware for strings via `Intl.Collator`, `<`/`>` otherwise. */
export function defaultCompare(a: unknown, b: unknown): number {
  if (typeof a === 'string' && typeof b === 'string') {
    return defaultCollator.compare(a, b);
  }
  if (a === b) return 0;
  return (a as number | string) < (b as number | string) ? -1 : 1;
}

/** Context handed to a `gogColumnBody` template. */
export interface GogColumnBodyContext<T> {
  /** The row object. */
  $implicit: T;
  /** Alias for `$implicit`, for templates that prefer naming it. */
  row: T;
  /** Index within the currently rendered page, not the whole data set. */
  index: number;
  /** The already-resolved cell value for this column's `field`. */
  value: unknown;
}

/** Context handed to a `gogColumnHeader` template. */
export interface GogColumnHeaderContext {
  /** The column's own `header` text, so a custom header can decorate rather than replace it. */
  $implicit: string;
  field: string;
}

/**
 * Custom cell markup for one column:
 *
 * ```html
 * <gog-column field="status" header="Status">
 *   <ng-template gogColumnBody let-row let-value="value">
 *     <gog-tag [variant]="row.ok ? 'success' : 'danger'">{{ value }}</gog-tag>
 *   </ng-template>
 * </gog-column>
 * ```
 */
@Directive({ selector: '[gogColumnBody]' })
export class GogColumnBodyDirective<T = unknown> {
  readonly templateRef = inject<TemplateRef<GogColumnBodyContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: GogColumnBodyDirective<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogColumnBodyContext<T> {
    return true;
  }
}

/** Custom header markup for one column — see `GogColumnBodyDirective` for the shape. */
@Directive({ selector: '[gogColumnHeader]' })
export class GogColumnHeaderDirective {
  readonly templateRef = inject<TemplateRef<GogColumnHeaderContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: GogColumnHeaderDirective,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogColumnHeaderContext {
    return true;
  }
}

/**
 * One column of `gog-table`. Cell and header markup are projected as `gogColumnBody` /
 * `gogColumnHeader` templates inside the column itself, so the column owning them is
 * structural rather than looked up by a matching string.
 */
@Directive({
  // Deliberately element selectors, not attributes: a column is a structural child of the
  // table, and `<gog-column field="x">` reads as markup rather than as a decorated element.
  // `column` is the pre-21.3.0 name, kept working for one migration window.
  // @deprecated since 21.3.0 (2026-08-07) — use `gog-column` instead. Removed in 21.5.0.
  // eslint-disable-next-line @angular-eslint/directive-selector -- see above
  selector: 'gog-column, column',
})
export class GogColumn {
  /** Field name, or a dot-path into a nested property (e.g. `"address.city"`). */
  readonly field = input.required<string>();
  readonly header = input<string>('');
  readonly sortable = input<boolean>(false);
  /** Fixed width, e.g. "120px" or "20%" */
  readonly width = input<string>('');
  /** Min width, e.g. "80px" */
  readonly minWidth = input<string>('');
  /** Max width, e.g. "300px" */
  readonly maxWidth = input<string>('');
  /** Custom sort comparator for this column. Defaults to `defaultCompare`. */
  readonly comparator = input<((a: unknown, b: unknown) => number) | null>(null);

  readonly bodyTemplate = contentChild(GogColumnBodyDirective);
  readonly headerTemplate = contentChild(GogColumnHeaderDirective);
}

/**
 * @deprecated since 21.3.0 (2026-08-07) — use `GogColumn` instead. Removed in 21.5.0.
 * The same class under its old, unprefixed name.
 */
export const Column = GogColumn;
/**
 * @deprecated since 21.3.0 (2026-08-07) — use `GogColumn` instead. Removed in 21.5.0.
 */
export type Column = GogColumn;
