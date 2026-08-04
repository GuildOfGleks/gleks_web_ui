import { InjectionToken, Provider } from '@angular/core';

import { GogScrollOverscrollBehavior, GogScrollSize } from './types';

/**
 * App-wide defaults for the handful of component inputs where that actually makes sense —
 * timing/behavior knobs a whole app typically wants to set once (a house style for how long
 * scrollbars stay visible, how aggressively buttons debounce clicks), not visual ones.
 * Visual defaults (colors, radii, animation *durations expressed in CSS*) already have a
 * global mechanism: the `--gog-*` custom properties in `styles/theme.css`. This is only for
 * inputs that can't be a CSS token because a component reads them in TypeScript (a
 * `setTimeout` delay, an RxJS `timer` duration) — see `styling.instructions.md` and
 * `gleks-ui-library.instructions.md`'s "Global configuration" section for the line between
 * the two and for how to add a new field here when a component needs one.
 *
 * Every field is optional at every level: set only the ones you want to change from the
 * component's own built-in default. An instance's own input, when set, always wins over
 * this — this only fills in what the instance didn't specify itself.
 */
export interface GogGlobalConfig {
  scroll?: {
    autoHide?: boolean;
    hideDelay?: number;
    size?: GogScrollSize;
    overscrollBehavior?: GogScrollOverscrollBehavior;
  };
  button?: {
    debounce?: number;
  };
}

/**
 * Resolves to `{}` — every field falls through to its component's own hardcoded default —
 * until a `provideGogConfig(...)` call overrides it somewhere in the injector tree.
 */
export const GOG_CONFIG = new InjectionToken<GogGlobalConfig>('GOG_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});

/**
 * Sets app-wide (or subtree-wide, if placed in a route's or component's own `providers`
 * instead of the bootstrap config) defaults for every `@guildofgleks/ui` component that
 * reads `GOG_CONFIG` — one call instead of a separate injection token per setting:
 *
 * ```ts
 * // app.config.ts
 * providers: [
 *   provideGogConfig({
 *     scroll: { hideDelay: 1000 },
 *     button: { debounce: 500 },
 *   }),
 * ]
 * ```
 *
 * Providing this again further down the injector tree (a route, a single component's own
 * `providers`) replaces the whole object for that subtree rather than merging with the
 * parent's — pass everything you want in effect there, not just the one field you're
 * changing.
 */
export function provideGogConfig(config: GogGlobalConfig): Provider {
  return { provide: GOG_CONFIG, useValue: config };
}
