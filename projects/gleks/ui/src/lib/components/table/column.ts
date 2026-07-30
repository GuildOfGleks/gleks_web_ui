import { Directive, input } from '@angular/core';

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

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'column',
})
export class Column {
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
}
