import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  DestroyRef,
  Directive,
  DoCheck,
  ElementRef,
  Injector,
  ModelSignal,
  PLATFORM_ID,
  Signal,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GOG_CONFIG, resolveConfigured } from './config';
import { GogDropdownOverlay } from './dropdown-overlay';
import {
  type GogDropdownDirection,
  type GogDropdownPlacement,
  type GogDropdownTriggerRect,
  resolveCssLengthPx,
  resolveDropdownPlacement,
} from './dropdown-position';
import { GogClearableState } from './clearable-state';
import { resolveRipple } from './ripple-state';
import { GogErrorState, type GogErrorDisplay } from './error-state';
import { type GogOptionAccessor, isSameOptionValue, readOption } from './option-accessor';
import { GogFloatLabelState } from './float-label-state';
import {
  type RovingFocusKey,
  handleRovingFocusKeydown,
  isRovingFocusKey,
  nextRovingFocusIndex,
} from './roving-focus';
import { GogVirtualWindow } from './virtual-window';
import { GogDropdownFilterPosition, GogFloatLabelVariant, GogSize } from './types';

/**
 * Custom markup for the trigger's chevron, on `gog-select` and `gog-multiselect`:
 *
 * ```html
 * <gog-select [options]="opts">
 *   <ng-template gogDropdownChevron><gog-icon name="sort" /></ng-template>
 * </gog-select>
 * ```
 */
@Directive({ selector: '[gogDropdownChevron]' })
export class GogDropdownChevronDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Context handed to a `gogDropdownOption` template. */
export interface GogDropdownOptionContext<TOption> {
  /** The consumer's own option object, untouched. */
  $implicit: TOption;
  selected: boolean;
  disabled: boolean;
  /** The resolved label, so a custom row can decorate it rather than re-derive it. */
  label: string;
}

/**
 * Custom markup for one option row, on `gog-select` and `gog-multiselect`:
 *
 * ```html
 * <gog-select [options]="users" optionLabel="fullName" optionValue="id" [(value)]="userId">
 *   <ng-template gogDropdownOption let-user let-selected="selected">
 *     <img [src]="user.avatar" alt="" /> {{ user.fullName }}
 *   </ng-template>
 * </gog-select>
 * ```
 */
@Directive({ selector: '[gogDropdownOption]' })
export class GogDropdownOptionDirective<TOption = unknown> {
  readonly templateRef = inject<TemplateRef<GogDropdownOptionContext<TOption>>>(TemplateRef);

  static ngTemplateContextGuard<TOption>(
    _dir: GogDropdownOptionDirective<TOption>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogDropdownOptionContext<TOption> {
    return true;
  }
}

/**
 * The shape the listbox controls assume when their accessor inputs are left at their defaults.
 *
 * It is no longer required: `optionLabel` / `optionValue` / `optionDisabled` accept any property
 * path or function, so a consumer can pass their own DTO straight through. This interface just
 * describes what the *default* accessors (`'name'` / `'id'` / `'disabled'`) expect to find.
 */
export interface GogDropdownOption {
  id: string | number;
  name: string;
  disabled?: boolean;
}

/** Gap between the trigger and the panel. */
const PANEL_GAP = 2;
/** Smallest allowed gap between the panel and the viewport edge. */
const VIEWPORT_PADDING = 8;
/** Used only if a subclass's `panelMaxHeightToken` isn't declared anywhere in the cascade. */
const FALLBACK_MAX_PANEL_HEIGHT = 260;
/** Used only if a subclass's `optionHeightToken` isn't declared anywhere in the cascade. */
const FALLBACK_OPTION_HEIGHT = 40;
/** Must match the `var(--gog-dropdown-z, …)` fallback in the component stylesheets. */
const DEFAULT_PANEL_Z_INDEX = 300;

/** Built-in defaults, used when neither the instance input nor `GOG_CONFIG` supplies one. */
const DEFAULT_SIZE: GogSize = 'md';
const DEFAULT_ERROR_DISPLAY: GogErrorDisplay = 'manual';
const DEFAULT_APPEND_TO_BODY = false;
const DEFAULT_DROPDOWN_DIRECTION: GogDropdownDirection = 'auto';
const DEFAULT_FILTER = false;
const DEFAULT_FILTER_POSITION: GogDropdownFilterPosition = 'top';
const DEFAULT_CLEAR_SELECTION_LABEL = 'Clear selection';

/**
 * Shared behaviour for the listbox-style controls: open/close, placement, the
 * append-to-body overlay, click-outside, keyboard navigation and `ControlValueAccessor`
 * plumbing. Subclasses supply only what actually differs — the value type, the panel
 * markup, and the BEM class names used to find the trigger and the options.
 *
 * Exported because it appears in the public type signatures of the components that
 * extend it; it is not meant to be used or subclassed by consumers.
 */
@Directive({
  host: {
    // Drives the :host(.gog-host--auto-width) rules in each subclass's stylesheet —
    // without this binding the `fullWidth` input has no visible effect. Inverted from
    // gog-button's full-width class: these controls are full width by default, so the
    // class only appears once a consumer opts *out* of that.
    '[class.gog-host--auto-width]': '!fullWidth()',
  },
})
export abstract class GogDropdownBase<TValue, TOption = GogDropdownOption>
  implements ControlValueAccessor, DoCheck
{
  private static nextUid = 0;

  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Select...');
  readonly options = input<TOption[]>([]);
  /**
   * How to read an option's visible text — a property path (`'name'`, `'profile.title'`) or a
   * function. Defaults to `'name'`, matching `GogDropdownOption`.
   */
  readonly optionLabel = input<GogOptionAccessor<TOption, string>>('name');
  /**
   * How to read the value this control emits for an option. A property path or a function, or
   * `null` to emit **the option object itself** — which is what lets a consumer keep their own
   * DTO end to end instead of mapping ids back to objects on every change.
   *
   * Defaults to `'id'`, matching `GogDropdownOption`, so existing code is unaffected.
   */
  readonly optionValue = input<GogOptionAccessor<TOption, unknown> | null>('id');
  /** How to read whether an option is disabled. Defaults to `'disabled'`. */
  readonly optionDisabled = input<GogOptionAccessor<TOption, boolean>>('disabled');
  /**
   * Whether to offer a clear button once something is selected. Unset, falls back to
   * `GOG_CONFIG.control.clearable`, then to the control's own default.
   */
  readonly clearable = input<boolean | undefined>(undefined);
  /**
   * Accessible name for the clear button. Unset, falls back to
   * `GOG_CONFIG.labels.clearSelection`, then to `'Clear selection'`.
   */
  readonly clearAriaLabel = input<string | undefined>(undefined);
  /** Instance input → `GOG_CONFIG.labels` → the built-in English default. */
  protected readonly resolvedClearLabel = computed(() =>
    resolveConfigured(
      this.clearAriaLabel(),
      this.globalConfig.labels?.clearSelection,
      DEFAULT_CLEAR_SELECTION_LABEL,
    ),
  );
  /**
   * Smallest width the trigger may shrink to, as any CSS length. Only meaningful with
   * `[fullWidth]="false"`, where the trigger otherwise sizes to whatever is currently selected
   * and can collapse to almost nothing on a short option. Left unset it falls back to the
   * `--gog-{select,multiselect}-min-width` token.
   */
  readonly minWidth = input<string | null>(null);
  /**
   * Whether the panel shows a search box that narrows the option list. Unset, falls back to
   * `GOG_CONFIG.dropdown.filter`, then to `false`.
   */
  readonly filter = input<boolean | undefined>(undefined);
  readonly filterPlaceholder = input('Search...');
  /**
   * Which end of the panel the search box sticks to. Named to match `gog-multiselect`'s
   * `controlsPosition`, which is the same idea for its select-all row. Unset, falls back to
   * `GOG_CONFIG.dropdown.filterPosition`, then to `'top'`.
   */
  readonly filterPosition = input<GogDropdownFilterPosition | undefined>(undefined);
  /** Shown in place of the list when the query matches nothing. */
  readonly filterEmptyMessage = input('No matches');
  /**
   * How an option is matched against the query. Left null, the resolved `optionLabel` is
   * matched case-insensitively as a substring — pass a function to search other fields, match
   * on a prefix, or plug in your own fuzzy matcher.
   */
  readonly filterMatch = input<((option: TOption, query: string) => boolean) | null>(null);
  readonly errorMessage = input('');
  /**
   * See `GogErrorDisplay`. Unset, falls back to `GOG_CONFIG.control.errorDisplay`, then to
   * `'manual'` — matching every other control in the library.
   */
  readonly errorDisplay = input<GogErrorDisplay | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.control.size`, then to `'md'`. */
  readonly size = input<GogSize | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.dropdown.direction`, then to `'auto'`. */
  readonly dropdownDirection = input<GogDropdownDirection | undefined>(undefined);
  /**
   * Explicit stacking order for the panel. Left unset the panel falls back to the
   * stylesheet's `--gog-dropdown-z`, so the default lives in CSS where a consumer can
   * retheme it, rather than being baked into the component.
   */
  readonly dropdownZIndex = input<number | null>(null);
  /**
   * Fixed panel width as any CSS length (`'320px'`, `'40ch'`, `'100%'`, …), applied only
   * when `appendToBody` is set. Left unset the panel matches the trigger's width, same as
   * the inline panel already does via CSS.
   */
  readonly dropdownWidth = input<string | null>(null);
  /**
   * Fixed panel max-height as any CSS length, applied only when `appendToBody` is set.
   * `px`, `%` and `vh` also feed the up/down placement math (see `resolveCssLengthPx`); any
   * other unit still renders correctly but is invisible to that heuristic, so the panel may
   * pick the "wrong" side close to a viewport edge. Left unset the panel keeps the existing
   * viewport-derived, auto-flipping height.
   */
  readonly dropdownMaxHeight = input<string | null>(null);
  /** Unset, falls back to `GOG_CONFIG.dropdown.appendToBody`, then to `false`. */
  readonly appendToBody = input<boolean | undefined>(undefined);
  readonly disabled = input(false);
  /** Projected `gogDropdownChevron` template, replacing the built-in chevron. */
  protected readonly chevronSlot = contentChild(GogDropdownChevronDirective);
  /**
   * Full width of the container by default, matching every other field-style control.
   * Set to `false` to shrink the trigger to fit its selected label instead.
   */
  readonly fullWidth = input(true);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.variant`, then to `'none'` (off). */
  readonly floatLabel = input<GogFloatLabelVariant | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.floatLabel.showPlaceholder`, then to `false`. */
  readonly floatLabelShowPlaceholder = input<boolean | undefined>(undefined);
  /**
   * Press ripple on the panel's options. Unset, falls back to `GOG_CONFIG.ripple.enabled`, then
   * to `false`. The trigger itself never ripples — it is a field, not a button.
   */
  readonly ripple = input<boolean | undefined>(undefined);

  readonly isOpen = signal(false);

  /** Projected `gogDropdownOption` template, if the consumer supplied one. */
  protected readonly optionSlot = contentChild(GogDropdownOptionDirective);

  /** An option's visible text, via `optionLabel`. */
  protected labelOf(option: TOption): string {
    return readOption(option, this.optionLabel());
  }

  /**
   * The value this control emits for an option, via `optionValue` — or the option object
   * itself when `optionValue` is `null`.
   */
  protected valueOf(option: TOption): unknown {
    const accessor = this.optionValue();
    return accessor === null ? option : readOption(option, accessor);
  }

  /** Whether an option is disabled, via `optionDisabled`. Anything falsy counts as enabled. */
  protected isOptionDisabled(option: TOption): boolean {
    return !!readOption(option, this.optionDisabled());
  }

  /** Context for a projected `gogDropdownOption` row. */
  protected optionContext(option: TOption, selected: boolean): GogDropdownOptionContext<TOption> {
    return {
      $implicit: option,
      selected,
      disabled: this.isOptionDisabled(option),
      label: this.labelOf(option),
    };
  }

  /** Shared by both controls to match a resolved option value against the current value. */
  protected sameValue(a: unknown, b: unknown): boolean {
    return isSameOptionValue(a, b);
  }

  /** The `<ng-template>` holding the panel markup, rendered inline or into `<body>`. */
  protected abstract readonly panelTemplate: Signal<TemplateRef<unknown> | undefined>;
  /** Declared by the subclass so each control keeps its own value type. */
  protected abstract readonly value: ModelSignal<TValue>;
  /** Value applied when a form writes `null` / the control is reset. */
  protected abstract readonly emptyValue: TValue;
  /** BEM class of one option button, used to collect keyboard-navigable elements. */
  protected abstract readonly optionClass: string;
  /** BEM class of the focusable trigger. */
  protected abstract readonly triggerClass: string;
  /**
   * BEM block that carries the size modifier — `.gog-select` vs `.gog-ms-wrapper`. Separate
   * from `triggerClass` because in `gog-multiselect` the two are different elements.
   */
  protected abstract readonly sizeBlockClass: string;
  /** BEM block of the panel, which repeats the size modifier when appended to `<body>`. */
  protected abstract readonly panelBlockClass: string;
  /** Whether the control currently has a selection — drives the float-label "filled" state. */
  protected abstract readonly hasFloatValue: Signal<boolean>;
  /**
   * Spacing tokens feeding the height estimate. Overridable so each control keeps the
   * `--gog-<block>-*` names it already exposes to consumers for theming.
   */
  /**
   * The gap **between rows**, as a seed for the first frame. Like `optionHeightToken`, the real
   * value is measured from the rendered list and replaces this.
   *
   * **Read the options container's CSS before pointing this at a token, not the token's name.**
   * Two of the three controls name a token `--gog-<block>-option-gap` and use it for the gap
   * *inside* a row — between the check mark and the label — with no gap between rows at all.
   * Seeding from it added 12px per row of panel that does not exist. Only `gog-multiselect`'s
   * options container declares a `gap`, and only it overrides this.
   */
  protected readonly optionGapToken: string = '--gog-dropdown-option-gap';
  protected readonly optionsPaddingToken: string = '--gog-dropdown-options-padding';
  /** Keep in sync with the real `max-height` on the subclass's `__dropdown` block. */
  protected readonly panelMaxHeightToken: string = '--gog-dropdown-panel-max-height';
  /** Estimated row height fed into the placement math; not a real layout property. */
  protected readonly optionHeightToken: string = '--gog-dropdown-option-height';

  /**
   * Unique per-instance suffix, so several dropdowns on a page can't collide on DOM ids.
   *
   * Deliberately a bare number rather than `nextGogControlId()` (which the single-element
   * controls use): each subclass derives *several* ids from this one instance — trigger,
   * listbox, label, error — so what it needs is the instance number, not one finished id.
   */
  protected readonly uid = ++GogDropdownBase.nextUid;

  protected readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  /** `protected` so subclasses can resolve their own inputs against the same config object. */
  protected readonly globalConfig = inject(GOG_CONFIG);
  private readonly overlay = new GogDropdownOverlay(this.appRef, this.document);

  /** Set from `(focus)`/`(blur)` on the trigger — see `onFocusIn`/`onFocusOut`. */
  protected readonly isFocused = signal(false);

  /** Instance input → `GOG_CONFIG` → the component's own default. See `resolveConfigured`. */
  protected readonly resolvedSize = computed(() =>
    resolveConfigured(this.size(), this.globalConfig.control?.size, DEFAULT_SIZE),
  );
  protected readonly rippleEnabled = resolveRipple(this.ripple, this.globalConfig);
  protected readonly resolvedErrorDisplay = computed(() =>
    resolveConfigured(
      this.errorDisplay(),
      this.globalConfig.control?.errorDisplay,
      DEFAULT_ERROR_DISPLAY,
    ),
  );
  protected readonly resolvedAppendToBody = computed(() =>
    resolveConfigured(
      this.appendToBody(),
      this.globalConfig.dropdown?.appendToBody,
      DEFAULT_APPEND_TO_BODY,
    ),
  );
  protected readonly resolvedDropdownDirection = computed(() =>
    resolveConfigured(
      this.dropdownDirection(),
      this.globalConfig.dropdown?.direction,
      DEFAULT_DROPDOWN_DIRECTION,
    ),
  );

  /**
   * The single size modifier for the wrapper, replacing one `[class.<block>--<size>]` binding
   * per size. Empty for `'md'`: that is the default size and has no modifier rule of its own —
   * every `--gog-<block>-size-*` chain bottoms out at the `md` tokens.
   */
  protected readonly sizeClass = computed(() =>
    this.resolvedSize() === DEFAULT_SIZE ? '' : `${this.sizeBlockClass}--${this.resolvedSize()}`,
  );
  /**
   * Same modifier repeated on the panel, but only when it is appended to `<body>` — outside
   * the component's subtree the panel no longer inherits the wrapper's size tokens, so it has
   * to carry them itself. See the `--portal` blocks in the component stylesheets.
   */
  protected readonly panelSizeClass = computed(() =>
    this.resolvedAppendToBody() && this.resolvedSize() !== DEFAULT_SIZE
      ? `${this.panelBlockClass}--${this.resolvedSize()}`
      : '',
  );

  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.resolvedErrorDisplay,
    this.ngControl,
  );

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly dropdownDirectionState = signal<'up' | 'down'>('down');
  protected readonly panelPlacement = signal<GogDropdownPlacement | null>(null);
  /**
   * Stacking order to write onto the panel, or null to leave it to the stylesheet.
   *
   * Only needed when appending to `<body>`: an inline panel inherits `--gog-dropdown-z` from
   * its surroundings — which is how a dropdown inside a dialog ends up above the dialog —
   * but an appended one sits outside that subtree and inherits nothing, so the value has
   * to be resolved from the trigger and written out explicitly.
   */
  protected readonly panelZIndex = signal<number | null>(null);

  /**
   * Explicit panel width, or null to let it size to its own content.
   *
   * The panel used to be pinned to the trigger's width, which broke a trigger narrower than its
   * options: with `[fullWidth]="false"` the trigger shrinks to the *current* selection, so
   * picking a short option cut the longer ones off in the list. It now sizes to its content with
   * the trigger width as a floor — see `resolvedPanelMinWidth`.
   */
  protected readonly resolvedPanelWidth = computed(() => this.dropdownWidth());

  /** The trigger's width, used as the panel's minimum so it never renders narrower than it. */
  protected readonly resolvedPanelMinWidth = computed(() => {
    const width = this.panelPlacement()?.width;
    return width != null ? `${width}px` : null;
  });
  /** `dropdownMaxHeight`, or the viewport-derived max-height from `panelPlacement`. */
  protected readonly resolvedPanelMaxHeight = computed(() => {
    const maxHeight = this.panelPlacement()?.maxHeight;
    return this.dropdownMaxHeight() ?? (maxHeight != null ? `${maxHeight}px` : null);
  });

  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  /**
   * Each control supplies its own default: `gog-multiselect` shipped a clear button before
   * `clearable` existed, so it keeps one; `gog-select` opts in.
   */
  protected abstract readonly clearableByDefault: boolean;

  private readonly clearableState = new GogClearableState(
    this.clearable,
    computed(() => this.hasFloatValue()),
    this.isDisabled,
    this.globalConfig,
    // read lazily for the same field-initialisation-order reason as hasFloatValue below
    () => this.clearableByDefault,
  );

  /** Whether to render the clear button right now — see `GogClearableState`. */
  protected readonly showClear = this.clearableState.isVisible;

  protected readonly resolvedFilter = computed(() =>
    resolveConfigured(this.filter(), this.globalConfig.dropdown?.filter, DEFAULT_FILTER),
  );
  protected readonly resolvedFilterPosition = computed(() =>
    resolveConfigured(
      this.filterPosition(),
      this.globalConfig.dropdown?.filterPosition,
      DEFAULT_FILTER_POSITION,
    ),
  );
  /** Current search text. Cleared whenever the panel closes, so reopening starts fresh. */
  protected readonly filterQuery = signal('');

  /**
   * The options actually rendered. Everything downstream — the loops, the keyboard navigation
   * target list, the panel height estimate, and multiselect's select-all — reads this rather
   * than `options()`, so filtering stays consistent instead of only hiding rows visually.
   */
  protected readonly visibleOptions = computed(() => {
    const query = this.filterQuery().trim();
    if (!this.resolvedFilter() || query === '') return this.options();

    const match = this.filterMatch();
    if (match) return this.options().filter((option) => match(option, query));

    const needle = query.toLowerCase();
    return this.options().filter((option) => this.labelOf(option).toLowerCase().includes(needle));
  });

  protected onFilterInput(event: Event): void {
    this.filterQuery.set((event.target as HTMLInputElement).value);
    // Typing can take 10 000 options to 3. The window's range and the scroller's position have
    // to reset *together*: leave the scroller where it was and the range is computed from a
    // scrollTop that is past the end of the new list, so the panel renders rows 400-420 of a
    // three-row list and shows nothing. The panel still looks right until you type, which is
    // why this is the bug a reviewer does not see.
    this.resetPanelScroll();
  }

  /** Puts the scroller, the window and the keyboard's idea of "here" back at the top together. */
  private resetPanelScroll(): void {
    this.activeOptionIndex.set(-1);
    this.setPanelScrollTop(0);
  }

  /**
   * Moves the scroller and the window's own idea of where it is, in that order and in the same
   * turn.
   *
   * The signal is written here rather than waiting for the scroller to echo the change back
   * through `(gogScroll)`: that echo is coalesced into an animation frame, so a keyboard move
   * that scrolled would compute its new range one frame after it moved focus -- which is one
   * frame during which the row it is trying to focus has not been rendered.
   */
  private setPanelScrollTop(top: number): void {
    this.panelViewport.update((viewport) => ({ ...viewport, scrollTop: top }));

    const viewport = this.panelViewportElement();
    if (!viewport) return;
    // Feature-detected rather than assumed, for the reason `gog-autocomplete` records against
    // `scrollIntoView`: jsdom implements neither, and an unhandled throw here fails a whole test
    // run rather than this line. Assigning `scrollTop` is the equivalent every host does have.
    if (typeof viewport.scrollTo === 'function') {
      viewport.scrollTo({ top, behavior: 'auto' });
    } else {
      viewport.scrollTop = top;
    }
  }

  /**
   * `gog-scroll`'s scrolling element inside the open panel, found in the DOM rather than with a
   * `viewChild`: an appended panel is attached to `<body>` as its own change-detection root, so a
   * view query on this component does not reach it.
   */
  private panelViewportElement(): HTMLElement | null {
    if (!this.isBrowser) return null;
    const scope = this.overlay.hostElement ?? (this.elRef.nativeElement as HTMLElement);
    return scope.querySelector<HTMLElement>('.gog-scroll__viewport');
  }

  /** Resets the control to its empty value and notifies any attached form. */
  protected clearValue(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.commitValue(this.emptyValue);
  }

  /**
   * `hasFloatValue` is wrapped in a `computed` rather than passed straight through: these
   * field initializers run before the *subclass's* do, so `this.hasFloatValue` is still
   * undefined right here. The arrow defers the read until the signal is first evaluated, by
   * which time the subclass has assigned it.
   */
  private readonly floatLabelState = new GogFloatLabelState(
    this.floatLabel,
    this.floatLabelShowPlaceholder,
    this.placeholder,
    this.isFocused,
    computed(() => this.hasFloatValue()),
    this.globalConfig,
  );

  protected readonly resolvedFloatLabel = this.floatLabelState.variant;
  protected readonly isFloatLabelActive = this.floatLabelState.isActive;
  protected readonly isFloatLabelFloated = this.floatLabelState.isFloated;
  protected readonly effectivePlaceholder = this.floatLabelState.effectivePlaceholder;

  /** Measured once per open rather than per scroll tick — see `refreshPanelMetrics`. */
  private optionGap = 0;
  private optionsPadding = 0;
  private maxPanelHeight = FALLBACK_MAX_PANEL_HEIGHT;
  private optionHeight = FALLBACK_OPTION_HEIGHT;
  /**
   * A real row's height, once one has ever been rendered. `null` until then.
   *
   * The token this class reads for `optionHeight` calls itself an estimate, and it is a bad one:
   * measured against a rendered row in all eleven shipped themes it is wrong in every one, from
   * -0.62px (`terminal`) to +8.38px (`parchment`), and low in ten of them. No static value can be
   * right -- the same `parchment` row is 48.38px at `--gog-density: 1` and 42.38px at 0.85,
   * because the height is padding plus leading plus border and a theme or a consumer can move
   * every term.
   *
   * That matters because the estimate is not decorative: `estimatePanelHeight` multiplies it by
   * the option count and `resolveDropdownDirection` opens the panel up or down on the result. Low
   * by 7px a row means a five-row panel judged to fit below when it needs 37px more than there is.
   * Only short lists were ever affected -- above `panelMaxHeightToken` the cap dominates and the
   * error is masked -- which is why it went unseen.
   */
  private measuredOptionHeight: number | null = null;
  /**
   * The real gap between two rows, once a list has ever rendered. `null` until then.
   *
   * Measured for the same reason the row height is, and it came out of the same audit: the token
   * `optionGapToken` seeds from is the *inside* of a row in two of the three controls (mark to
   * label), while their options containers declare no row gap at all. Reading the container is
   * exact where reading a token is a guess about what the token means.
   */
  private measuredOptionGap: number | null = null;
  private measureFrame: number | null = null;
  private repositionFrame: number | null = null;

  // ── Windowing ────────────────────────────────────────────────────────────────
  //
  // See `docs/virtualization.md`. The arithmetic is `GogVirtualWindow`'s; what lives here is
  // everything that touches the page: what the row pitch really is, how tall the scroller
  // actually became, where it is scrolled to, and which index the keyboard is on.

  /**
   * Whether this instance windows its list. Resolved the same way every other dropdown setting
   * is: instance input, then `GOG_CONFIG.dropdown.virtualize`, then off.
   *
   * **Off by default and never switched on automatically.** A windowed list and a plain one
   * differ under `Ctrl+F`, under a screen reader's "list all items", and under any consumer CSS
   * that targets `:last-child`; flipping that at a row-count threshold would make the component's
   * behaviour depend on how much data happened to arrive, which works in development and
   * surprises in production. `GOG_CONFIG.ripple.enabled` is off by default for the same reason.
   */
  protected readonly resolvedVirtualize = computed(() =>
    resolveConfigured(this.virtualizeRequest(), this.globalConfig.dropdown?.virtualize, false),
  );

  /**
   * The subclass's own `virtualize` input, if it offers one.
   *
   * A subclass overrides this with its input rather than the base declaring one, so a control
   * that has not adopted windowing yet does not inherit a public input that does nothing. Read
   * only from inside a `computed`, which is what lets a subclass field override a base field
   * that was initialised first.
   */
  protected readonly virtualizeRequest: Signal<boolean | undefined> = signal(undefined);

  /**
   * How far apart two rows start, in px: the row's own height plus whatever gap the list puts
   * between rows. Seeded from the tokens and replaced by the measurement, exactly as the
   * placement estimate is -- and for a window it matters more, because the error accumulates
   * once per row instead of once per panel.
   */
  protected readonly rowPitch = signal(0);

  /**
   * The scroller's real geometry, fed from `gog-scroll`'s own `(gogScroll)`.
   *
   * The plan called for a `ResizeObserver` on the scroller; it is not needed, because the
   * scroller already runs one and already coalesces scroll and resize into a single
   * rAF-batched emission carrying both numbers. A second observer would have measured the same
   * element one frame later.
   *
   * `height` is the viewport's `clientHeight`, never `--gog-*-panel-max-height`: that token is a
   * cap, and a panel with three options is three rows tall.
   */
  protected readonly panelViewport = signal<{ scrollTop: number; height: number }>({
    scrollTop: 0,
    height: 0,
  });

  private readonly virtualWindow = new GogVirtualWindow({
    count: computed(() => this.visibleOptions().length),
    rowHeight: this.rowPitch,
    viewportHeight: computed(() => this.panelViewport().height),
    scrollTop: computed(() => this.panelViewport().scrollTop),
  });

  /** Index into `visibleOptions()` of the row the keyboard is on, or -1 for none. */
  protected readonly activeOptionIndex = signal(-1);

  /** The slice of `visibleOptions()` actually stamped into the panel. */
  protected readonly optionWindow = computed(() =>
    this.resolvedVirtualize()
      ? this.virtualWindow.range()
      : { start: 0, end: this.visibleOptions().length },
  );

  /**
   * What the template loops over. Identical to `visibleOptions()` when not windowing, and the
   * same array instance, so nothing re-renders for the sake of a slice that changed nothing.
   */
  protected readonly renderedOptions = computed(() => {
    const all = this.visibleOptions();
    const { start, end } = this.optionWindow();
    return start === 0 && end === all.length ? all : all.slice(start, end);
  });

  /**
   * Filler above and below the rendered rows, in px.
   *
   * Spacers rather than absolute positioning: the rows stay flex children of the same container,
   * so every gap, selector and `:last-child` the component already relies on keeps working. See
   * `GogVirtualWindow`'s own note for why that trade is worth making for a one-column list.
   */
  protected readonly padBefore = computed(() =>
    this.resolvedVirtualize() ? this.virtualWindow.padBefore() : 0,
  );
  protected readonly padAfter = computed(() =>
    this.resolvedVirtualize() ? this.virtualWindow.padAfter() : 0,
  );

  /**
   * A windowed listbox holds twenty `role="option"` children and has to announce ten thousand.
   *
   * Set only while windowing. An unwindowed list has every option in the DOM, and the browser's
   * own count is then both correct and free -- restating it would be one more thing to keep true.
   */
  protected readonly ariaSetSize = computed(() =>
    this.resolvedVirtualize() ? this.visibleOptions().length : null,
  );

  /** The real position of a rendered row in the full list, 1-based, or null when not windowing. */
  protected ariaPosInSet(renderedIndex: number): number | null {
    return this.resolvedVirtualize() ? this.optionWindow().start + renderedIndex + 1 : null;
  }

  /** `(gogScroll)` on the panel's `gog-scroll`. */
  protected onPanelScroll(metrics: { scrollTop: number; clientHeight: number }): void {
    this.panelViewport.update((viewport) => ({
      scrollTop: metrics.scrollTop,
      // A zero is "not laid out yet", not "no viewport": the scroller's first emission comes
      // from its own `afterNextRender`, which can land before the panel has a height. Taking it
      // literally would throw away the seed and render the whole list for a frame -- the one
      // thing the seed exists to prevent -- and then render it again once the real height
      // arrived. The last number known to be real is a better answer than a zero.
      height: metrics.clientHeight > 0 ? metrics.clientHeight : viewport.height,
    }));
    this.releaseFocusLeavingTheWindow();
  }

  /**
   * A row that scrolls out of the window is unmounted, and an unmounted element holding focus
   * drops it on `<body>` -- where an open panel has no keyboard at all: Escape does not close it
   * and the arrows scroll the page instead of the list.
   *
   * So a mouse scroll that would take the focused row away hands focus back to the trigger,
   * which is a state both Escape and ArrowDown work from. Checked here rather than in an effect
   * because this runs *before* the re-render, while the row still exists and can still be asked
   * whether it is the focused one -- after the unmount that question has no answer.
   *
   * This is the price of windowing that a plain list does not pay, and the reason it is opt-in.
   */
  private releaseFocusLeavingTheWindow(): void {
    const active = this.activeOptionIndex();
    if (!this.isBrowser || !this.resolvedVirtualize() || active < 0) return;

    const { start, end } = this.optionWindow();
    if (active >= start && active < end) return;

    this.activeOptionIndex.set(-1);

    const scope = this.overlay.hostElement ?? (this.elRef.nativeElement as HTMLElement);
    const focused = this.document.activeElement;
    if (
      focused instanceof HTMLElement &&
      scope.contains(focused) &&
      focused.classList.contains(this.optionClass)
    ) {
      this.focusTrigger();
    }
  }

  private onChangeFn: (val: TValue) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor() {
    // Registering through NgControl instead of NG_VALUE_ACCESSOR keeps `this.ngControl`
    // available for `hasError` — providing NG_VALUE_ACCESSOR on the component while also
    // injecting NgControl would be a dependency cycle.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.destroyRef.onDestroy(() => this.overlay.detach());
    this.bindWhileOpen();
  }

  /**
   * Binds the click-outside and reposition listeners only for as long as the panel is
   * open. Bound permanently — as host listeners were — every dropdown on the page runs a
   * handler on every document click and every scroll frame, whether or not it is showing
   * anything.
   */
  private bindWhileOpen(): void {
    effect((onCleanup) => {
      if (!this.isOpen() || !this.isBrowser) return;

      const onDocumentClick = (event: MouseEvent) => this.closeIfClickedOutside(event);
      const onReflow = () => this.scheduleReposition();

      // Capture phase: scroll does not bubble, so a bubble-phase listener on window would
      // miss scrolling inside a nested container — which is exactly the case appendToBody
      // exists for. Passive: these handlers never call preventDefault.
      this.document.addEventListener('click', onDocumentClick);
      window.addEventListener('scroll', onReflow, { passive: true, capture: true });
      window.addEventListener('resize', onReflow, { passive: true });

      onCleanup(() => {
        this.document.removeEventListener('click', onDocumentClick);
        window.removeEventListener('scroll', onReflow, { capture: true });
        window.removeEventListener('resize', onReflow);

        if (this.repositionFrame !== null) {
          cancelAnimationFrame(this.repositionFrame);
          this.repositionFrame = null;
        }

        if (this.measureFrame !== null) {
          cancelAnimationFrame(this.measureFrame);
          this.measureFrame = null;
        }
      });
    });
  }

  ngDoCheck(): void {
    this.errorState.check();
  }

  writeValue(val: TValue | null): void {
    this.value.set(val ?? this.emptyValue);
  }

  registerOnChange(fn: (val: TValue) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
  }

  /** Bound to `(focus)` on the trigger — only drives the float-label floated state. */
  protected onFocusIn(): void {
    this.isFocused.set(true);
  }

  /** Bound to `(blur)` on the trigger — only drives the float-label floated state. */
  protected onFocusOut(): void {
    this.isFocused.set(false);
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected open(): void {
    if (this.isDisabled() || this.isOpen()) return;

    this.isOpen.set(true);
    this.refreshPanelMetrics();
    this.seedWindow();
    this.updatePlacement();

    if (this.resolvedAppendToBody()) {
      this.attachOverlay();
    }

    this.scheduleOptionMeasure();
  }

  /**
   * Gives the window numbers to work from before anything has rendered.
   *
   * Without this the first frame has a viewport height of zero, which `GogVirtualWindow`
   * deliberately reads as "render everything" -- correct, and exactly the 10 000 rows the window
   * exists to avoid, stamped once before the scroller reports its real height a frame later. The
   * seed is the same panel-height estimate placement already uses, so no new arithmetic and no
   * new token.
   */
  private seedWindow(): void {
    this.activeOptionIndex.set(-1);
    this.rowPitch.set(
      (this.measuredOptionHeight ?? this.optionHeight) + (this.measuredOptionGap ?? this.optionGap),
    );
    this.panelViewport.set({
      scrollTop: 0,
      height: this.isBrowser ? this.estimatePanelHeight() : 0,
    });
  }

  protected close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.filterQuery.set('');
    this.overlay.detach();
    // Closing is this control's equivalent of a blur, which is when a form control is
    // conventionally considered touched.
    this.markTouched();
  }

  /** Writes a new selection out to both the model and the attached form control. */
  protected commitValue(next: TValue): void {
    this.value.set(next);
    this.onChangeFn(next);
    this.markTouched();
  }

  protected markTouched(): void {
    this.onTouchedFn();
  }

  private closeIfClickedOutside(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;

    const inside =
      this.elRef.nativeElement.contains(target) ||
      (this.overlay.hostElement?.contains(target) ?? false);

    if (!inside) {
      this.close();
    }
  }

  /**
   * Coalesces bursts of scroll/resize events into one reposition per frame. Placement
   * reads layout, so running it per event is what makes a scroll janky.
   */
  private scheduleReposition(): void {
    if (this.repositionFrame !== null) return;

    this.repositionFrame = requestAnimationFrame(() => {
      this.repositionFrame = null;
      if (this.isOpen()) {
        this.updatePlacement();
      }
    });
  }

  /**
   * Reads one real row after the panel has rendered, and re-places if the token had lied.
   *
   * One frame late by construction -- the row has to exist -- so the very first open of an
   * instance can be placed from the estimate and corrected before the next paint. Every later
   * open starts from the measurement and is right immediately, which is why this caches rather
   * than measuring each time.
   *
   * Deliberately does **not** fall back to the token when no row is found: an empty list has no
   * row to measure and no rows to be wrong about, and overwriting a good measurement with the
   * token because the user filtered everything away would undo the fix.
   */
  private scheduleOptionMeasure(): void {
    if (!this.isBrowser || this.measureFrame !== null) return;

    this.measureFrame = requestAnimationFrame(() => {
      this.measureFrame = null;
      if (!this.isOpen()) return;

      const scope = this.overlay.hostElement ?? (this.elRef.nativeElement as HTMLElement);
      const row = scope.querySelector<HTMLElement>(`.${this.optionClass}`);
      const height = row?.getBoundingClientRect().height ?? 0;
      if (height <= 0) return;

      // The row's own parent is the options container, so the gap comes for free once the row
      // has been found -- no second selector for a class each subclass would have to declare.
      // `row-gap` computes to the keyword `normal` when a flex container sets no gap, which is
      // used as zero; `readPx` returns the fallback for anything it cannot parse, which is that.
      const gap = row?.parentElement
        ? readPx(getComputedStyle(row.parentElement).rowGap, 0)
        : (this.measuredOptionGap ?? this.optionGap);

      const changed =
        this.measuredOptionHeight === null
          ? Math.abs(height - this.optionHeight) > 0.5 || Math.abs(gap - this.optionGap) > 0.5
          : Math.abs(height - this.measuredOptionHeight) > 0.5 ||
            Math.abs(gap - (this.measuredOptionGap ?? this.optionGap)) > 0.5;
      this.measuredOptionHeight = height;
      this.measuredOptionGap = gap;
      // The window reads this too, and it is the reason the measurement is not optional there:
      // a placement is wrong once, a pitch is wrong once per row and the error accumulates down
      // the list until the rendered rows and the scrollbar disagree about where they are.
      this.rowPitch.set(height + gap);
      if (changed) this.updatePlacement();
    });
  }

  /** Jumps from the trigger into the option list on ArrowDown/ArrowUp while open. */
  protected onTriggerArrowKeydown(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();

    // Windowed, the last option is not in the DOM to be focused, so the entry point is an index
    // in the full list rather than an element in the rendered slice. Home/End mean the first and
    // last *reachable* option, which is what ArrowDown and ArrowUp mean from the trigger.
    if (this.resolvedVirtualize()) {
      this.moveActiveOption((event as KeyboardEvent).key === 'ArrowUp' ? 'End' : 'Home');
      return;
    }

    const options = this.enabledOptionElements();
    if (options.length === 0) return;

    const index = (event as KeyboardEvent).key === 'ArrowUp' ? options.length - 1 : 0;
    options[index]?.focus();
  }

  protected onOptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      this.focusTrigger();
      return;
    }

    if (event.key === 'Tab') {
      // Deliberately not prevented: closing and handing focus back to the trigger lets
      // the browser's own Tab handling continue from there, so focus lands on whatever
      // follows the control. Without this, tabbing out of an appended panel would jump
      // to the end of the document, since that is where the panel's DOM lives.
      this.close();
      this.focusTrigger();
      return;
    }

    // The inversion windowing needs: arrow keys move an index in `visibleOptions()`, and the DOM
    // follows it. Walking rendered elements stops at the edge of the window, so ArrowDown from
    // the last rendered row would wrap to the first rendered row rather than advance the list.
    if (this.resolvedVirtualize() && isRovingFocusKey(event.key)) {
      event.preventDefault();
      this.moveActiveOption(event.key);
      return;
    }

    handleRovingFocusKeydown(event, this.enabledOptionElements());
  }

  /**
   * Moves the keyboard's index by one roving-focus key, skipping disabled options and wrapping,
   * then makes the DOM agree: scroll first if the target is outside the window, focus second.
   */
  private moveActiveOption(key: RovingFocusKey): void {
    const options = this.visibleOptions();
    if (options.length === 0) return;

    const current = this.activeOptionIndex();
    // With nothing active yet, start one step *behind* the intended first target and let the
    // wrap do the work, so a disabled first (or last) option is skipped by the same code that
    // skips one in the middle.
    const from =
      current >= 0 ? current : key === 'ArrowUp' || key === 'End' ? 0 : options.length - 1;

    this.focusOptionAt(
      nextRovingFocusIndex(
        key,
        from,
        options.length,
        (index) => !this.isOptionDisabled(options[index]),
      ),
    );
  }

  /**
   * Puts the keyboard on `index` and the focus with it.
   *
   * The wait is conditional on purpose: `scrollOffsetFor` returns null when the row is already
   * visible, which means it is already rendered and can be focused in this turn. Only a move
   * that actually changes the window has to wait for the render that stamps the row.
   */
  private focusOptionAt(index: number): void {
    this.activeOptionIndex.set(index);

    const offset = this.virtualWindow.scrollOffsetFor(index);
    if (offset === null) {
      this.focusRenderedOption(index);
      return;
    }

    this.setPanelScrollTop(offset);
    if (!this.isBrowser) return;
    afterNextRender(() => this.focusRenderedOption(index), { injector: this.injector });
  }

  private focusRenderedOption(index: number): void {
    if (!this.isBrowser) return;
    const scope = this.overlay.hostElement ?? (this.elRef.nativeElement as HTMLElement);
    scope
      .querySelector<HTMLElement>(`.${this.optionClass}[data-gog-option-index="${index}"]`)
      ?.focus();
  }

  protected focusTrigger(): void {
    (this.elRef.nativeElement as HTMLElement)
      .querySelector<HTMLElement>(`.${this.triggerClass}`)
      ?.focus();
  }

  /** Extra chrome stacked above the options (e.g. a select-all row), in px. */
  protected extraPanelHeight(): number {
    return 0;
  }

  private enabledOptionElements(): HTMLButtonElement[] {
    const scope = this.overlay.hostElement ?? (this.elRef.nativeElement as HTMLElement);
    return Array.from(
      scope.querySelectorAll<HTMLButtonElement>(`.${this.optionClass}:not([aria-disabled="true"])`),
    );
  }

  private attachOverlay(): void {
    if (!this.isBrowser) return;

    const template = this.panelTemplate();
    if (!template) return;

    this.overlay.attach(template, this.elRef.nativeElement);
  }

  /**
   * Reads the spacing tokens that feed the height estimate. Done once per open instead of
   * on every scroll tick, because `getComputedStyle` forces a style recalculation and the
   * tokens cannot change while the panel is on screen.
   */
  private refreshPanelMetrics(): void {
    if (!this.isBrowser) {
      this.optionGap = 0;
      this.optionsPadding = 0;
      this.maxPanelHeight = FALLBACK_MAX_PANEL_HEIGHT;
      this.optionHeight = FALLBACK_OPTION_HEIGHT;
      this.panelZIndex.set(null);
      return;
    }

    const styles = getComputedStyle(this.elRef.nativeElement);
    this.optionGap = readPx(styles.getPropertyValue(this.optionGapToken), 0);
    this.optionsPadding = readPx(styles.getPropertyValue(this.optionsPaddingToken), 0);
    this.maxPanelHeight = readPx(
      styles.getPropertyValue(this.panelMaxHeightToken),
      FALLBACK_MAX_PANEL_HEIGHT,
    );
    this.optionHeight = readPx(
      styles.getPropertyValue(this.optionHeightToken),
      FALLBACK_OPTION_HEIGHT,
    );
    this.panelZIndex.set(this.resolvedAppendToBody() ? this.resolvePanelZIndex(styles) : null);
  }

  /**
   * The panel's height, used to choose up/down and to cap `max-height`.
   *
   * Estimated on the very first open of an instance and exact from then on. Measuring needs a
   * rendered row and placement runs before the panel renders, so the first pass uses the row
   * height token; `measureOptionHeight` then reads a real row and re-places if it disagreed.
   * Every open after that starts from the measurement.
   *
   * A resolvable `dropdownMaxHeight` replaces the row-count arithmetic outright, since it is
   * exact rather than derived.
   */
  private estimatePanelHeight(): number {
    const custom = this.dropdownMaxHeight();
    if (custom) {
      const resolved = resolveCssLengthPx(custom, window.innerHeight);
      if (resolved !== null) return resolved;
    }

    const count = Math.max(this.visibleOptions().length, 1);
    const rowHeight = this.measuredOptionHeight ?? this.optionHeight;
    const gap = this.measuredOptionGap ?? this.optionGap;
    const rows = count * rowHeight + Math.max(count - 1, 0) * gap;
    return Math.min(rows + this.optionsPadding * 2 + this.extraPanelHeight(), this.maxPanelHeight);
  }

  /**
   * The trigger's own rect, not the whole component's — a label above it or an error
   * message below it sit in normal document flow and are not part of what the panel needs
   * to clear. This also keeps `appendToBody` placement consistent with the inline panel,
   * which is already positioned purely relative to the trigger via CSS.
   */
  private triggerRect(): GogDropdownTriggerRect {
    const host = this.elRef.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLElement>(`.${this.triggerClass}`) ?? host;
    return trigger.getBoundingClientRect();
  }

  /** The stacking order the panel would have had if it were still inside the subtree. */
  private resolvePanelZIndex(triggerStyles: CSSStyleDeclaration): number {
    const inherited = triggerStyles.getPropertyValue('--gog-dropdown-z').trim();
    if (inherited) {
      return readPx(inherited, DEFAULT_PANEL_Z_INDEX);
    }

    // Not every DOM implementation resolves inherited custom properties through
    // getComputedStyle (jsdom does not), so also look for an inline declaration up the
    // tree — which is exactly how gog-dialog hands its stacking order to nested dropdowns.
    for (let el: HTMLElement | null = this.elRef.nativeElement; el; el = el.parentElement) {
      const declared = el.style.getPropertyValue('--gog-dropdown-z').trim();
      if (declared) {
        return readPx(declared, DEFAULT_PANEL_Z_INDEX);
      }
    }

    return DEFAULT_PANEL_Z_INDEX;
  }

  private updatePlacement(): void {
    if (!this.isBrowser) return;

    const placement = resolveDropdownPlacement(
      this.resolvedDropdownDirection(),
      this.triggerRect(),
      this.estimatePanelHeight(),
      window.innerHeight,
      PANEL_GAP,
      VIEWPORT_PADDING,
    );

    this.dropdownDirectionState.set(placement.direction);
    this.panelPlacement.set(placement);
  }
}

function readPx(raw: string, fallback: number): number {
  const parsed = Number.parseFloat(raw.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}
