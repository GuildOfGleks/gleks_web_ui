import { Directive, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'column',
})
export class Column<T = unknown> {
  readonly field = input.required<keyof T & string>();
  readonly header = input<string>('');
  readonly sortable = input<boolean>(false);
  /** Fixed width, e.g. "120px" or "20%" */
  readonly width = input<string>('');
  /** Min width, e.g. "80px" */
  readonly minWidth = input<string>('');
  /** Max width, e.g. "300px" */
  readonly maxWidth = input<string>('');
}
