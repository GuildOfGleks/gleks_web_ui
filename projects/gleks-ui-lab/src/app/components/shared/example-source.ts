/**
 * The three files of one documentation example, as text.
 *
 * Produced by `scripts/generate-example-sources.mjs` from the example's own folder, never typed
 * by hand — see that script's header for what typing them by hand cost.
 *
 * A field is empty when the example genuinely has no such file: a `provideGogConfig` example is
 * TypeScript only. `app-code-tabs` says so in the tab rather than hiding it.
 */
export interface ExampleSource {
  readonly html: string;
  readonly ts: string;
  readonly css: string;
}
