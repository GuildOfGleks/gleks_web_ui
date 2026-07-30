import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  DestroyRef,
  Directive,
  DoCheck,
  ElementRef,
  ModelSignal,
  PLATFORM_ID,
  Signal,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { GogDropdownOverlay } from './dropdown-overlay';
import {
  type GogDropdownDirection,
  type GogDropdownPlacement,
  type GogDropdownTriggerRect,
  resolveCssLengthPx,
  resolveDropdownPlacement,
} from './dropdown-position';
import { GogErrorState, type GogErrorDisplay } from './error-state';
import { handleRovingFocusKeydown } from './roving-focus';
import { GogSize } from './types';

/** A single choice in any of the listbox-style controls (`gog-select`, `gog-multiselect`). */
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

/**
 * Shared behaviour for the listbox-style controls: open/close, placement, the
 * append-to-body overlay, click-outside, keyboard navigation and `ControlValueAccessor`
 * plumbing. Subclasses supply only what actually differs — the value type, the panel
 * markup, and the BEM class names used to find the trigger and the options.
 *
 * Exported because it appears in the public type signatures of the components that
 * extend it; it is not meant to be used or subclassed by consumers.
 */
@Directive()
export abstract class GogDropdownBase<TValue> implements ControlValueAccessor, DoCheck {
  private static nextUid = 0;

  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Select...');
  readonly options = input<GogDropdownOption[]>([]);
  readonly errorMessage = input('');
  /** See `GogErrorDisplay`. Defaults to `'manual'`, matching every other control in the library. */
  readonly errorDisplay = input<GogErrorDisplay>('manual');
  readonly size = input<GogSize>('md');
  readonly dropdownDirection = input<GogDropdownDirection>('auto');
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
  readonly appendToBody = input(false);
  readonly disabled = input(false);
  readonly chevronTemplate = input<TemplateRef<unknown> | null>(null);

  readonly isOpen = signal(false);

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
   * Spacing tokens feeding the height estimate. Overridable so each control keeps the
   * `--gog-<block>-*` names it already exposes to consumers for theming.
   */
  protected readonly optionGapToken: string = '--gog-dropdown-option-gap';
  protected readonly optionsPaddingToken: string = '--gog-dropdown-options-padding';
  /** Keep in sync with the real `max-height` on the subclass's `__dropdown` block. */
  protected readonly panelMaxHeightToken: string = '--gog-dropdown-panel-max-height';
  /** Estimated row height fed into the placement math; not a real layout property. */
  protected readonly optionHeightToken: string = '--gog-dropdown-option-height';

  /** Unique per-instance suffix, so several dropdowns on a page can't collide on DOM ids. */
  protected readonly uid = ++GogDropdownBase.nextUid;

  protected readonly elRef = inject(ElementRef<HTMLElement>);
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly overlay = new GogDropdownOverlay(this.appRef, this.document);

  private readonly cvaDisabled = signal(false);
  private readonly errorState = new GogErrorState(
    this.errorMessage,
    this.errorDisplay,
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

  /** `dropdownWidth`, or the trigger-derived width from `panelPlacement`, as a CSS value. */
  protected readonly resolvedPanelWidth = computed(() => {
    const width = this.panelPlacement()?.width;
    return this.dropdownWidth() ?? (width != null ? `${width}px` : null);
  });
  /** `dropdownMaxHeight`, or the viewport-derived max-height from `panelPlacement`. */
  protected readonly resolvedPanelMaxHeight = computed(() => {
    const maxHeight = this.panelPlacement()?.maxHeight;
    return this.dropdownMaxHeight() ?? (maxHeight != null ? `${maxHeight}px` : null);
  });

  protected readonly hasError = this.errorState.hasError;
  protected readonly visibleError = this.errorState.visibleError;

  /** Measured once per open rather than per scroll tick — see `refreshPanelMetrics`. */
  private optionGap = 0;
  private optionsPadding = 0;
  private maxPanelHeight = FALLBACK_MAX_PANEL_HEIGHT;
  private optionHeight = FALLBACK_OPTION_HEIGHT;
  private repositionFrame: number | null = null;

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
    this.updatePlacement();

    if (this.appendToBody()) {
      this.attachOverlay();
    }
  }

  protected close(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
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

  /** Jumps from the trigger into the option list on ArrowDown/ArrowUp while open. */
  protected onTriggerArrowKeydown(event: Event): void {
    if (!this.isOpen()) return;
    event.preventDefault();

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

    handleRovingFocusKeydown(event, this.enabledOptionElements());
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
    this.panelZIndex.set(this.appendToBody() ? this.resolvePanelZIndex(styles) : null);
  }

  /**
   * Rough height, used only to choose up/down and to cap `max-height` before the panel
   * has been laid out. Deliberately an estimate: measuring would require rendering the
   * panel first, which is what we are trying to position. A resolvable `dropdownMaxHeight`
   * replaces the row-count guess outright, since it is exact rather than estimated.
   */
  private estimatePanelHeight(): number {
    const custom = this.dropdownMaxHeight();
    if (custom) {
      const resolved = resolveCssLengthPx(custom, window.innerHeight);
      if (resolved !== null) return resolved;
    }

    const count = Math.max(this.options().length, 1);
    const rows = count * this.optionHeight + Math.max(count - 1, 0) * this.optionGap;
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
      this.dropdownDirection(),
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
