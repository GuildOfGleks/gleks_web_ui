import { InjectionToken, Provider } from '@angular/core';

/**
 * The `<app-example>` host looks the source text of the component it is rendering up in here,
 * so a page names each example exactly once — in the `[component]` binding — instead of pairing
 * it with a string that could drift.
 *
 * A page provides its own folder's generated map:
 *
 * ```ts
 * import { BUTTON_EXAMPLE_SOURCES } from '../../../examples/button/sources.generated';
 *
 * @Component({ providers: [provideExampleSources(BUTTON_EXAMPLE_SOURCES)] })
 * ```
 *
 * Each entry is the example's three files — `example.html`, `example.ts`, `example.css` — which
 * is what the card's tab strip shows and what StackBlitz writes into the project it opens.
 *
 * Keyed by the component class itself rather than by its name: a name is a string to keep in
 * step, and would break under a minifier that renames classes.
 */
export const EXAMPLE_SOURCES = new InjectionToken<ReadonlyMap<unknown, ExampleSource>>(
  'EXAMPLE_SOURCES',
);

/**
 * The three files an example is written in. All three always exist — an example that needs no
 * layout of its own still carries a `example.css` saying so, so the tab strip is the same shape
 * on every card and a reader never has to wonder whether a missing tab means "empty" or "not
 * shown". See `scripts/generate-example-sources.mjs`.
 */
export interface ExampleSource {
  readonly html: string;
  readonly ts: string;
  readonly css: string;
}

export function provideExampleSources(sources: ReadonlyMap<unknown, ExampleSource>): Provider {
  return { provide: EXAMPLE_SOURCES, useValue: sources };
}
