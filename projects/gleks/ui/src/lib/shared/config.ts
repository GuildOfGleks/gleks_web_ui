import { InjectionToken, Provider, Type, inject } from '@angular/core';

import {
  GogFloatLabelVariant,
  GogScrollOverscrollBehavior,
  GogScrollSize,
  GogSize,
  GogSpinnerVariant,
  GogTextareaResize,
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
  /**
   * The loading indicator, app-wide.
   *
   * `component` is the one config key that carries markup rather than a value, and it is here
   * because of what it removes: a house spinner otherwise has to be passed into every control
   * that can show one, and cannot be passed into the ones that render their own. Set it once and
   * **every** spinner the library draws is yours — `gog-spinner`, `gog-spinner-overlay`, and the
   * ones inside `gog-button`, `gog-autocomplete` and `gog-table`'s loading states, which have no
   * input to reach. It is rendered through `NgComponentOutlet` inside the size wrapper, so it
   * keeps the sizing, the overlay behaviour, the `role="status"` and the accessible name; only
   * the visual is yours.
   *
   * Precedence is the library's usual one, with a wrinkle worth stating: an instance's own
   * `variant` wins over both keys here, `component` wins over `variant`, and the built-in
   * `runic` is the fallback. So `<gog-spinner variant="ring">` still gets a ring in an app that
   * has set a component — an instance asking for something specific is not overridden by a
   * default.
   *
   * Applies to: `gog-spinner`, `gog-spinner-overlay`, and the spinners inside `gog-button`,
   * `gog-autocomplete` and `gog-table`. Two of those were wrong until 21.9.2 and are worth the
   * warning: `gog-table` was never listed although it always honoured the key, and
   * `gog-spinner-overlay` was listed although it did not — it forwards its own `variant` down,
   * and that input defaulted to `'runic'`, which the spinner inside correctly read as an
   * instance overruling a default. Neither shows up in a grep for `globalConfig.spinner`,
   * because neither reads the config: they render a `gog-spinner` that does.
   */
  spinner?: {
    component?: Type<unknown>;
    variant?: GogSpinnerVariant;
  };

  scroll?: {
    autoHide?: boolean;
    hideDelay?: number;
    size?: GogScrollSize;
    overscrollBehavior?: GogScrollOverscrollBehavior;
    /**
     * Whether the overlay thumb/track ever renders. Scrolling itself is unaffected either way
     * — this is purely the visual affordance. Defaults to `true`.
     */
    showTrack?: boolean;
    /**
     * Turns a vertical wheel into horizontal scrolling on a `gog-scroll` that has nothing to
     * scroll vertically. Defaults to `false`; see the component's `horizontalWheel` input for
     * the conditions it applies under and why it never swallows a gesture at the content's end.
     */
    horizontalWheel?: boolean;
  };
  button?: {
    debounce?: number;
  };
  /**
   * Whether the library's own interactive surfaces show a press ripple: `gog-button`,
   * `[gogButton]`, `gog-button-toggle`, `gog-chip`, `gog-tabs`, `gog-accordion`,
   * `gog-collapsible`, `gog-menu` and the three dropdowns' options. **Off by default**, so the
   * effect is additive and nothing changes appearance until an app asks for it.
   *
   * This is the one visual default that is *not* expressible as a CSS token, which is why it is
   * here at all: `--gog-ripple-opacity: 0` would hide the wash but still pay for the DOM node,
   * the pointer listeners and the animation frames on every press. A real off has to reach the
   * TypeScript.
   *
   * Per-instance: every component listed above takes a `ripple` input that wins over this, so
   * `[ripple]="false"` opts one control out of an app-wide `true` (and `[ripple]="true"` opts one
   * in without switching the app over). The `[gogRipple]` directive on your **own** element is
   * not covered — writing the attribute is already the per-element decision, the same way
   * `[filter]="true"` on one `gog-select` is; `rippleDisabled` turns that one off.
   */
  ripple?: {
    enabled?: boolean;
  };
  tooltip?: {
    showDelay?: number;
    hideDelay?: number;
    position?: GogTooltipPosition;
  };
  /**
   * Applies to `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`,
   * `gog-autocomplete` and `gog-datepicker` — every field that can float a label. All six read
   * it through the same `GogFloatLabelState`, three of them via `GogDropdownBase`.
   */
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
   * - `size` applies to `gog-button` and `[gogButton]`, `gog-button-toggle-group`,
   *   `gog-checkbox`, `gog-toggle`, `gog-radio-group`, `gog-inputfield`, `gog-textarea`,
   *   `gog-select`, `gog-multiselect`, `gog-autocomplete` and `gog-datepicker`. Deliberately
   *   **not** to `gog-table`, `gog-accordion` or `gog-paginator` (whose `size` means row/layout
   *   density and whose defaults differ), nor to `gog-spinner`, `gog-skeleton`, `gog-tag` or
   *   `gog-chip` (sized to fit whatever they sit next to, not to a form's density).
   * - `errorDisplay` applies to every control that renders a validation message:
   *   `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-autocomplete`,
   *   `gog-datepicker`, `gog-radio-group` and `gog-slider`.
   *
   * A component's own built-in default still applies when this is unset, so setting `size`
   * here does not flatten the different defaults those excluded components have.
   *
   * **When you add a reader, add it here — and note that "reader" is not the same as "names
   * the field".** These lists were wrong for four keys until 2026-09-02, always in the same
   * direction and for the same reason: `gog-select`, `gog-multiselect` and `gog-autocomplete`
   * resolve `size`/`errorDisplay`/`clearable`/`floatLabel` inside `GogDropdownBase`, and
   * `gog-datepicker` composes the same state classes directly, so none of the four contains the
   * `globalConfig.control?.…` expression that a grep for readers finds. Nor does the resolved
   * value always reach a template by name — `size` arrives as a computed class (`sizeClass`,
   * `panelSizeClass`) and `dropdown.direction` is consumed by placement code, so "is the
   * computed referenced in the component's HTML?" answers *no* for components that genuinely
   * honour the key. Trace the shared state classes, not just the components.
   */
  control?: {
    size?: GogSize;
    errorDisplay?: GogErrorDisplay;
    /**
     * Whether `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`,
     * `gog-autocomplete` and `gog-datepicker` offer a clear button — every control that
     * composes `GogClearableState`. The button only ever appears once the control actually has
     * something to clear, so switching this on app-wide adds no permanent chrome.
     *
     * Component defaults are `false`, except `gog-multiselect`, which had a clear button
     * before this input existed and keeps it.
     */
    clearable?: boolean;
  };
  /**
   * Applies per field rather than per component, which is why this is not one sentence:
   *
   * - `appendToBody` and `direction` reach `gog-select`, `gog-multiselect`,
   *   `gog-autocomplete` (all three through `GogDropdownBase`) and `gog-datepicker`, which
   *   resolves the same pair itself.
   * - `filter` and `filterPosition` reach `gog-select` and `gog-multiselect` only.
   *   `gog-autocomplete` inherits both inputs from the same base class and renders no filter
   *   box for them — its own text field *is* the filter, so a second search box inside the
   *   panel would be a duplicate. Setting these does nothing to an autocomplete.
   */
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
  /**
   * Applies to `gog-paginator`, and through it to `gog-table`'s built-in pagination.
   *
   * The page-size select is the one piece of paginator chrome an app decides once — either its
   * tables offer the choice or they don't, and the option list is a house style. Both are still
   * overridable per instance, for the page whose table genuinely needs `5, 10, 20` while the rest
   * of the app uses `20, 50, 100`.
   */
  paginator?: {
    /** Whether the rows-per-page select renders at all. **Off by default.** */
    showPageSizeSelect?: boolean;
    /** The choices it offers. Defaults to `[10, 20, 30, 40, 50]`. */
    pageSizeOptions?: number[];
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
  /** Applies to `gog-inputfield`. */
  inputfield?: {
    /**
     * Whether a `type="number"` field shows the library's own spin buttons in place of the
     * browser's native ones. Defaults to `true`.
     */
    showSpinButtons?: boolean;
  };
  /** Applies to `gog-textarea`. */
  textarea?: {
    /**
     * Which direction(s) the field's own drag handle resizes it in — matches the native CSS
     * `resize` value space. Defaults to `'vertical'`.
     */
    resize?: GogTextareaResize;
  };
  toast?: {
    position?: ToastPosition;
    /** How long a non-sticky toast stays up, in ms. */
    duration?: number;
  };
  /**
   * Every fixed, user-visible string the library renders — button text and accessible names for
   * chrome the consumer never writes markup for.
   *
   * These are here rather than as one input per string because they are the definition of a
   * setting an app states once: a Russian-language app relabels "Clear" once, not on all 340
   * fields. Where a per-instance input already exists (`clearAriaLabel`, `todayLabel`, …) it
   * still wins for that one control — the usual instance → config → default order.
   *
   * Deliberately excludes anything that is *content* rather than chrome: `gog-checkbox`'s
   * `ariaLabel`, `gog-button`'s `ariaLabel`, a field's `label` or `placeholder`. Those differ
   * per instance by definition and have no meaningful app-wide value.
   */
  labels?: {
    /** Clear button on `gog-inputfield` / `gog-textarea`. */
    clear?: string;
    /**
     * Clear button on `gog-select` / `gog-multiselect` / `gog-autocomplete`, which clears a
     * selection rather than text.
     */
    clearSelection?: string;
    /** Clear button on `gog-datepicker`. */
    clearDate?: string;
    /** `gog-multiselect`'s select-all / clear-all buttons — visible text, not just a label. */
    selectAll?: string;
    clearAll?: string;
    /** `gog-inputfield`'s number spin buttons. */
    increment?: string;
    decrement?: string;
    /** `gog-inputfield`'s password reveal toggle, in its two states. */
    showPassword?: string;
    hidePassword?: string;
    /** Close buttons on the two service-driven overlays. */
    closeDialog?: string;
    closeToast?: string;
    /** `gog-paginator`'s `<nav>` accessible name and its two step buttons. */
    pagination?: string;
    previousPage?: string;
    nextPage?: string;
    /**
     * `gog-paginator`'s per-page button names ("Go to page 4", "Page 4, current page").
     *
     * A function rather than a string, and the only one in this block: these interpolate the
     * page number, and a template string with a `{0}` placeholder would be a second, weaker
     * formatting language to learn — one that also can't express languages where the number's
     * position or the surrounding grammar depends on its value. The default is
     * `` (page, isCurrent) => isCurrent ? `Page ${page}, current page` : `Go to page ${page}` ``.
     */
    page?: (page: number, isCurrent: boolean) => string;
    /** `gog-datepicker`'s button that opens the calendar panel. */
    openCalendar?: string;
    /**
     * `gog-panel`'s collapse toggle, used **only** when the panel has no `gogPanelHeader` to
     * borrow a name from. A panel with a heading names its toggle after that heading, which is
     * both more useful and per-instance by definition.
     */
    togglePanel?: string;
    /** `gog-paginator`'s rows-per-page select. */
    rowsPerPage?: string;
    /** `gog-table`: the row-count label, its paginator, and the selection checkboxes. */
    total?: string;
    tablePagination?: string;
    selectRow?: string;
    selectAllRows?: string;
    /** `gog-calendar` navigation and shortcuts. */
    today?: string;
    thisMonth?: string;
    previousMonth?: string;
    nextMonth?: string;
    previousYear?: string;
    nextYear?: string;
    /** `gog-calendar`'s time section. */
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  /**
   * Applies to `ThemeService`. Every field is off/neutral by default, so an app that configures
   * nothing keeps the pre-21.3.2 behaviour: adopt whatever `data-theme` is already on `<html>`,
   * else `'light'`.
   */
  theme?: {
    /**
     * `localStorage` key the chosen theme is written to and read back from. Unset, nothing is
     * persisted and the theme resets on every load.
     */
    storageKey?: string | null;
    /** Theme applied when nothing else decides. `'light'` by default. */
    defaultTheme?: string;
    /**
     * Whether to fall back to the OS `prefers-color-scheme` setting — and to keep following it
     * until the app calls `setTheme`/`toggleTheme`. Off by default: switching this on changes
     * which theme an existing app opens in.
     */
    followSystem?: boolean;
    /** Theme names `toggleTheme()` alternates between, and `followSystem` maps the OS setting to. */
    lightTheme?: string;
    darkTheme?: string;
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
