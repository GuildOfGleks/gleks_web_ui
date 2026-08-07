/**
 * How a collection-driven component reads one field off a consumer's own object.
 *
 * A `string` is a property name, or a dot-path into a nested one (`'profile.city'`). A function
 * is anything else. This is what lets `gog-select` / `gog-multiselect` take a consumer's real
 * DTO instead of forcing everything through a `{ id, name }` shape first.
 */
export type GogOptionAccessor<TOption, TResult> = string | ((option: TOption) => TResult);

/** Resolves `field` against `source`, following dot-paths (e.g. `"address.city"`). */
export function getByPath(source: unknown, field: string): unknown {
  if (!field.includes('.')) return (source as Record<string, unknown> | null)?.[field];

  let value: unknown = source;
  for (const key of field.split('.')) {
    if (value == null) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

/** Applies an accessor — a property path or a function — to one option. */
export function readOption<TOption, TResult>(
  option: TOption,
  accessor: GogOptionAccessor<TOption, TResult>,
): TResult {
  return typeof accessor === 'function'
    ? accessor(option)
    : (getByPath(option, accessor) as TResult);
}

/**
 * Whether two resolved option values refer to the same option.
 *
 * Primitives are compared as strings, so a `formControl` holding `'1'` still matches an option
 * whose value is the number `1` — the library behaved this way before option values could be
 * anything, and forms routinely stringify. Objects are compared by identity instead: coercing
 * them would make every plain object equal to every other (`"[object Object]"`).
 */
export function isSameOptionValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'object' || typeof b === 'object') return false;
  return String(a) === String(b);
}
