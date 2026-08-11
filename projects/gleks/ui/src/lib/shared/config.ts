import { InjectionToken, Provider, inject } from '@angular/core';

import {
  GogFloatLabelVariant,
  GogScrollOverscrollBehavior,
  GogScrollSize,
  GogSize,
  GogTooltipPosition,
} from './types';
// Type-only, so none of these pull a runtime dependency into this module — `config.ts` is
// imported by nearly every component and must stay free of import cycles.
import type { GogErrorDisplay } from './error-state';
import type { GogDropdownDirection } from './dropdown-position';
import type { GogDropdownFilterPosition } from './types';
import type { ToastPosition } from '../services/toast-service/toast-service';

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
  /**
   * Defaults for the interactive form controls — the two settings an app otherwise repeats on
   * literally every one of them: a compact app writes `size="sm"` everywhere, and a
   * Reactive-Forms app writes `errorDisplay="auto"` on every field.
   *
   * - `size` applies to `gog-button`, `gog-inputfield`, `gog-textarea`, `gog-select`,
   *   `gog-multiselect`, `gog-checkbox` and `gog-radio-group`. Deliberately **not** to
   *   `gog-table`, `gog-accordion` or `gog-paginator` (whose `size` means row/layout density
   *   and whose defaults differ), nor to `gog-spinner`, `gog-skeleton`, `gog-tag` or
   *   `gog-chip` (sized to fit whatever they sit next to, not to a form's density).
   * - `errorDisplay` applies to every control that renders a validation message:
   *   `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-radio-group`
   *   and `gog-slider`.
   *
   * A component's own built-in default still applies when this is unset, so setting `size`
   * here does not flatten the different defaults those excluded components have.
   */
  control?: {
    size?: GogSize;
    errorDisplay?: GogErrorDisplay;
    /**
     * Whether `gog-inputfield`, `gog-textarea`, `gog-select` and `gog-multiselect` offer a
     * clear button. The button only ever appears once the control actually has something to
     * clear, so switching this on app-wide adds no permanent chrome.
     *
     * Component defaults are `false`, except `gog-multiselect`, which had a clear button
     * before this input existed and keeps it.
     */
    clearable?: boolean;
  };
  /** Applies to `gog-select` and `gog-multiselect`. */
  dropdown?: {
    /**
     * Whether the panel is rendered into `<body>` instead of inline. Worth setting app-wide
     * for a layout whose dropdowns generally live inside scrollable or overflow-clipped
     * containers, which is the case this exists for.
     */
    appendToBody?: boolean;
    direction?: GogDropdownDirection;
    /** Whether the panel shows a search box. Off by default. */
    filter?: boolean;
    /** Which end of the panel the search box sticks to. `'top'` by default. */
    filterPosition?: GogDropdownFilterPosition;
  };
  /**
   * Applies to `gog-datepicker` and `gog-calendar`. Every field here is something an app sets
   * once rather than per field — a locale and a date format repeated on every date input is
   * exactly the boilerplate this config exists to remove.
   */
  datepicker?: {
    /** BCP-47 tag driving month and weekday names. */
    locale?: string;
    /** 0 = Sunday … 6 = Saturday. Unset, it comes from the locale. */
    firstDayOfWeek?: number;
    /** Display and parse pattern (`dd.MM.yyyy`, `yyyy-MM-dd`, …). */
    format?: string;
  };
  /** Applies to `gog-autocomplete`. */
  autocomplete?: {
    /**
     * Milliseconds to wait after the last keystroke before `gogSearch` fires. A whole app
     * usually wants one answer here, tuned to its backend rather than to each field.
     */
    searchDebounce?: number;
    /** How many characters before the panel opens at all. */
    minLength?: number;
    /**
     * Whether focusing the field opens the panel immediately, showing the full option list.
     * Defaults to `true`.
     */
    openOnFocus?: boolean;
  };
  toast?: {
    position?: ToastPosition;
    /** How long a non-sticky toast stays up, in ms. */
    duration?: number;
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
 * Layers `override` onto `base`, one level deep: a component key present in both has its
 * fields merged (so `{ tooltip: { showDelay } }` keeps the parent's `tooltip.position`), and a
 * key present in only one is taken as-is.
 *
 * Deliberately not a deep merge — `GogGlobalConfig` is exactly two levels by design, and a
 * recursive merge would start doing surprising things to any future field whose value is
 * itself an object the consumer means to replace wholesale.
 */
function mergeGogConfig(base: GogGlobalConfig, override: GogGlobalConfig): GogGlobalConfig {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = (base as Record<string, unknown>)[key];
    merged[key] =
      isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? { ...baseValue, ...overrideValue }
        : overrideValue;
  }

  return merged as GogGlobalConfig;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
 * **Providing this again further down the injector tree layers onto the parent's config
 * rather than replacing it.** A route that only cares about tooltips can say so, and the
 * app-wide `button.debounce` stays in effect inside it:
 *
 * ```ts
 * // a route's providers — button.debounce from app.config.ts still applies here
 * provideGogConfig({ tooltip: { showDelay: 0 } })
 * ```
 *
 * Merging is one level deep, per component key: the nearest provider wins field by field, so
 * `{ tooltip: { showDelay: 0 } }` overrides only `showDelay` and leaves a parent's
 * `tooltip.position` alone. To drop an inherited value rather than change it, set it back to
 * the component's own default explicitly — there is no "unset" marker.
 */
export function provideGogConfig(config: GogGlobalConfig): Provider {
  return {
    provide: GOG_CONFIG,
    // skipSelf so this reads the *parent* injector's config rather than recursing into the
    // provider being defined here; optional because at the root there is no parent providing it.
    useFactory: () =>
      mergeGogConfig(inject(GOG_CONFIG, { skipSelf: true, optional: true }) ?? {}, config),
  };
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
