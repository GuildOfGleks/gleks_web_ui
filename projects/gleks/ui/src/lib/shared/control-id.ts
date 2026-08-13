/**
 * Per-prefix counter behind every auto-generated DOM id in the library.
 *
 * A form control needs a real `id` whether or not the consumer supplied one: without it a
 * `<label for>` cannot point at the field (so clicking the label does not focus it, and
 * assistive tech gets no accessible name), and `aria-describedby` cannot point at the error
 * message. Making the consumer pass `inputId` for that is a trap — the field looks fine and is
 * quietly inaccessible.
 *
 * Counters are keyed by prefix rather than shared, so ids stay stable per component type
 * (`gog-input-1`, `gog-slider-1`) instead of depending on how many *other* controls happened to
 * be constructed first. That also keeps them predictable in tests and diffs.
 *
 * SSR/hydration-safe by construction: the server and the client walk the same component tree in
 * the same order, so both arrive at the same ids. Do not seed this with randomness for that
 * reason.
 */
const counters = new Map<string, number>();

/** Returns the next id for `prefix`, e.g. `nextGogControlId('gog-input')` → `'gog-input-3'`. */
export function nextGogControlId(prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, next);
  return `${prefix}-${next}`;
}
