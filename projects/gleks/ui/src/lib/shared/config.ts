import { InjectionToken, Provider } from '@angular/core';

import {
  GogFloatLabelVariant,
  GogScrollOverscrollBehavior,
  GogScrollSize,
  GogTooltipPosition,
} from './types';

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
  tooltip?: {
    showDelay?: number;
    hideDelay?: number;
    position?: GogTooltipPosition;
  };
  /** Applies to `gog-inputfield`, `gog-select`, `gog-multiselect` and `gog-textarea`. */
  floatLabel?: {
    variant?: GogFloatLabelVariant;
    /**
     * Whether the field's own `placeholder` reappears once its label has floated out of
     * the way. Defaults to `false` — the placeholder stays hidden the whole time a float
     * label is active, since the resting label already occupies that space.
     */
    showPlaceholder?: boolean;
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

/**
 * The library's precedence rule for a configurable input, in one place: an instance's own
 * input wins, then the app-wide `GOG_CONFIG` value, then the component's built-in default.
 *
 * Every configurable input resolves through this rather than repeating the `??` chain, so the
 * order can't drift between components — a component that accidentally checked the config
 * first would silently ignore the input on that one control only, which is close to invisible
 * in review. Kept a plain function (no `inject`) so it works anywhere: inside a `computed`, in
 * a composition class like `GogFloatLabelState`, and in unit tests without an injector.
 *
 * ```ts
 * private readonly globalConfig = inject(GOG_CONFIG);
 * protected readonly resolvedDebounce = computed(() =>
 *   resolveConfigured(this.debounce(), this.globalConfig.button?.debounce, DEFAULT_DEBOUNCE),
 * );
 * ```
 */
export function resolveConfigured<T>(
  instanceValue: T | undefined,
  configuredValue: T | undefined,
  fallback: T,
): T {
  return instanceValue ?? configuredValue ?? fallback;
}
