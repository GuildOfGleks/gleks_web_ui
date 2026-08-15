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
 * Keyed by the component class itself rather than by its name: a name is a string to keep in
 * step, and would break under a minifier that renames classes.
 */
export const EXAMPLE_SOURCES = new InjectionToken<ReadonlyMap<unknown, string>>('EXAMPLE_SOURCES');

export function provideExampleSources(sources: ReadonlyMap<unknown, string>): Provider {
  return { provide: EXAMPLE_SOURCES, useValue: sources };
}
