import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { GogDropdownOverlay } from '../../shared/dropdown-overlay';
import { nextGogControlId } from '../../shared/control-id';
import { isRovingFocusKey, nextRovingFocusIndex } from '../../shared/roving-focus';
import { scopedOverlayDirection } from '../../shared/overlay-direction';
import type { GogDropdownDirection } from '../../shared/dropdown-position';
import { ScrollComponent } from '../scroll/scroll.component';
import { resolveMenuPlacement, type GogMenuPlacement } from './menu-position';

/**
 * One command in a `gog-menu`. Put it on the consumer's own `<button>`:
 *
 * ```html
 * <gog-menu #rowMenu>
 *   <button gogMenuItem (click)="edit(row)">Edit</button>
 *   <button gogMenuItem disabled (click)="archive(row)">Archive</button>
 * </gog-menu>
 * ```
 *
 * A directive rather than a component, for the same reason `[gogButton]` is one: a menu item is
 * markup the consumer owns — an icon, a label, a shortcut hint — and wrapping it in a component
 * would mean an input per piece. What the directive contributes is the part the menu pattern
 * requires and nobody should have to remember: `role="menuitem"` and a tabindex the menu drives.
 */
@Directive({
  selector: '[gogMenuItem]',
  host: {
    class: 'gog-menu__item',
    role: 'menuitem',
    tabindex: '-1',
    type: 'button',
  },
})
export class GogMenuItemDirective {
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Native `disabled` on the host button — read so navigation can step over it. */
  get isDisabled(): boolean {
    const el = this.elementRef.nativeElement as HTMLElement & { disabled?: boolean };
    return el.disabled === true || el.getAttribute('aria-disabled') === 'true';
  }
}

/**
 * A command menu: a panel of `gogMenuItem` buttons, opened from a trigger the consumer owns.
 *
 * ```html
 * <button gogButton variant="ghost" [gogMenuTrigger]="rowMenu" ariaLabel="Row actions">
 *   <gog-icon name="more-vertical" />
 * </button>
 *
 * <gog-menu #rowMenu>
 *   <button gogMenuItem (click)="edit(row)">Edit</button>
 * </gog-menu>
 * ```
 *
 * The trigger is a directive on an existing button rather than a component of its own, matching
 * the `[gogButton]` decision: a menu button is usually an icon button the consumer has already
 * styled, and a wrapper would fight that.
 *
 * Keyboard, per the WAI-ARIA menu button pattern: Enter/Space/ArrowDown open with the first item
 * focused, ArrowUp opens with the last, arrows and Home/End move between items (skipping disabled
 * ones, via `roving-focus.ts`), Escape closes and returns focus to the trigger, Tab closes and
 * lets focus continue past it.
 */
@Component({
  selector: 'gog-menu',
  imports: [ScrollComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  /*
   * There is no `appendToBody` input: the panel is *always* rendered into `<body>`.
   *
   * A dropdown has that input because its panel is a child of its own component and inherits
   * the size tokens from that wrapper, so rendering in place is genuinely useful. A menu's
   * panel has neither property, and an in-place one cannot even be positioned: this component's
   * host is `display: contents` (so declaring a menu adds no box to the consumer's layout),
   * which leaves nothing for `position: absolute` to resolve against — and `position: fixed`
   * resolves against the nearest ancestor with `contain`/`transform`, which `gog-scroll` is.
   * A menu inside a scroller therefore landed nowhere at all. One mode, always correct.
   */

  /** `'auto'` flips the panel above the trigger when there is no room below. */
  readonly direction = input<GogDropdownDirection>('auto');
  /** Accessible name for the panel itself, announced when the menu opens. */
  readonly ariaLabel = input('');
  /** Fires after the menu closes, whether by item, Escape, Tab or an outside click. */
  readonly gogClosed = output<void>();

  readonly menuId = nextGogControlId('gog-menu');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly overlay = new GogDropdownOverlay(this.appRef, this.document);

  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTpl');
  private readonly items = contentChildren(GogMenuItemDirective);

  private readonly openState = signal(false);
  private triggerEl: HTMLElement | null = null;
  private pendingFocus: 'first' | 'last' | null = null;

  protected readonly placement = signal<GogMenuPlacement | null>(null);
  /**
   * The stacking order the panel would have had where it was declared. `gog-dialog` sets
   * `--gog-dropdown-z` on its own panel for exactly this, so a menu opened inside a dialog
   * stacks above it rather than behind — the same mechanism the dropdowns use.
   */
  protected readonly panelZIndex = signal<number | null>(null);

  readonly isOpen = this.openState.asReadonly();

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const isOpen = this.openState();

      /*
       * Everything below is deliberately untracked. `attach()` re-creates the panel's view,
       * which changes the content-query result this effect would otherwise depend on — read it
       * as a dependency and the effect re-runs, re-attaches, and re-triggers itself. That loop
       * crashed the test worker rather than failing an assertion, which is the kind of bug an
       * `untracked` boundary exists to make impossible.
       */
      untracked(() => {
        if (!isOpen) {
          this.overlay.detach();
          return;
        }
        if (this.overlay.isAttached) return;

        this.overlay.attach(this.panelTemplate(), this.triggerEl);
        // The panel is in the document as of this line — the earliest its placement can be
        // measured and the earliest an item can take focus. `afterNextRender` runs, in this
        // mode, while the panel is still detached, and `focus()` on a detached button is a
        // silent no-op: that is why a portaled menu opened with nothing focused.
        if (this.triggerEl) this.measure(this.triggerEl, this.panelElement());
        this.applyPendingFocus();
      });
    });

    // A pointer landing anywhere else closes the menu — but without pulling focus back to the
    // trigger, since the user has already chosen where to go. Bound only while open, and on
    // `pointerdown` rather than `click` so a press that starts outside closes before whatever
    // it lands on reacts.
    effect((onCleanup) => {
      if (!this.isBrowser || !this.openState()) return;

      const onPointerDown = (event: Event) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (this.triggerEl?.contains(target)) return;
        if (this.panelElement()?.contains(target)) return;
        this.close(false);
      };

      this.document.addEventListener('pointerdown', onPointerDown, true);
      onCleanup(() => this.document.removeEventListener('pointerdown', onPointerDown, true));
    });

    // A fixed panel does not travel with its trigger: scroll the page and it would hang in
    // mid-air. Re-measuring is cheaper than it looks — two rects and a clamp — and keeps the
    // menu attached to the button it belongs to, which closing on scroll would not.
    effect((onCleanup) => {
      if (!this.isBrowser || !this.openState()) return;

      const reposition = () => {
        if (this.triggerEl) this.measure(this.triggerEl, this.panelElement());
      };

      this.document.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
      onCleanup(() => {
        this.document.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      });
    });

    this.destroyRef.onDestroy(() => this.overlay.detach());
  }

  /** The rendered panel, wherever it currently lives. */
  private panelElement(): HTMLElement | null {
    return this.document.getElementById(this.menuId);
  }

  /** Opens anchored to `trigger`, focusing the first item — or the last, for ArrowUp. */
  open(trigger: HTMLElement, focus: 'first' | 'last' = 'first'): void {
    if (!this.isBrowser) return;

    this.triggerEl = trigger;
    this.pendingFocus = focus;
    this.measure(trigger, null);
    this.openState.set(true);

    /*
     * Both of these need the panel in the DOM, which happens when the effect above runs — after
     * this call, during change detection. `afterNextRender` is the hook that waits for exactly
     * that; a microtask fires too early and silently does nothing, which is how the first
     * version opened the menu without moving focus into it.
     *
     * Re-placing with the rendered panel is what makes the clamp real: until it exists its width
     * is a guess, and a menu is sized by its longest label, not by the icon button it hangs from.
     * Guessed, a menu opened from a table's last column ran off the right edge.
     */
    afterNextRender(
      () => {
        this.measure(trigger, this.panelElement());
        this.applyPendingFocus();
      },
      { injector: this.injector },
    );
  }

  /** Closes and, unless told otherwise, returns focus to the trigger it was opened from. */
  close(restoreFocus = true): void {
    if (!this.openState()) return;

    this.openState.set(false);
    this.pendingFocus = null;
    const trigger = this.triggerEl;
    this.triggerEl = null;
    if (restoreFocus) trigger?.focus({ preventScroll: true });
    this.gogClosed.emit();
  }

  toggle(trigger: HTMLElement): void {
    if (this.openState()) {
      this.close();
      return;
    }
    this.open(trigger);
  }

  /** True while `trigger` is the element this menu is currently open from. */
  isOpenFrom(trigger: HTMLElement): boolean {
    return this.openState() && this.triggerEl === trigger;
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      // A menu is a single tab stop: Tab leaves it entirely rather than walking the commands.
      // Focus is *not* restored — the user asked to move on, not to come back.
      this.close(false);
      return;
    }

    /*
     * `handleRovingFocusKeydown` reads `event.currentTarget` to know where it is moving from,
     * which needs the handler bound per item. The panel binds it once instead — a menu's items
     * are the consumer's own buttons, and asking them to wire a handler each would defeat the
     * point of the directive — so the index comes from the focused element and the lower-level
     * helpers do the rest.
     */
    if (!isRovingFocusKey(event.key, 'vertical')) return;

    const elements = this.itemElements();
    const currentIndex = elements.indexOf(this.document.activeElement as HTMLElement);
    if (currentIndex === -1) return;

    event.preventDefault();
    const nextIndex = nextRovingFocusIndex(
      event.key,
      currentIndex,
      elements.length,
      (index) => !(this.items()[index]?.isDisabled ?? false),
    );
    const next = elements[nextIndex];
    if (next) this.focusElement(next);
  }

  /**
   * `preventScroll` keeps the *page* still — a portaled panel must not make the document jump —
   * and `scrollIntoView({ block: 'nearest' })` then scrolls the panel's own viewport by the
   * minimum needed. Without the second half, arrowing down a menu long enough to scroll moves
   * focus to an item nobody can see.
   */
  private focusElement(element: HTMLElement): void {
    element.focus({ preventScroll: true });
    // Optional call: jsdom does not implement `scrollIntoView`, and it is an affordance rather
    // than part of the contract — the item is focused either way.
    element.scrollIntoView?.({ block: 'nearest' });
  }

  /** An item was chosen: close first so focus lands back on the trigger, then let it run. */
  protected onPanelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const item = target?.closest('.gog-menu__item');
    if (!item) return;

    this.close();
  }

  private itemElements(): HTMLElement[] {
    return this.items().map((item) => item.elementRef.nativeElement);
  }

  /**
   * Moves focus into the panel, once. Whichever of the two hooks gets there first wins: the
   * overlay attach for a portaled panel, `afterNextRender` for an inline one.
   */
  private applyPendingFocus(): void {
    if (!this.pendingFocus) return;

    const enabled = this.items().filter((item) => !item.isDisabled);
    const item = this.pendingFocus === 'first' ? enabled.at(0) : enabled.at(-1);
    if (!item) return;

    this.focusElement(item.elementRef.nativeElement);
    this.pendingFocus = null;
  }

  /**
   * Places the panel against the trigger's measured rect, in **both** modes.
   *
   * An inline panel cannot be positioned by CSS alone: the host is `display: contents`, so it
   * has no box to be `position: absolute` against, and the panel fell back to the nearest
   * positioned ancestor — in practice a corner of the page. Measuring makes the two modes differ
   * only in *where the DOM node lives*, which is all `appendToBody` was ever about: stacking and
   * clipping, not placement.
   *
   * `panel` is null on the first pass — before it exists — and the rendered element on the
   * second, which is the pass whose numbers are real.
   */
  private measure(trigger: HTMLElement, panel: HTMLElement | null): void {
    if (!this.isBrowser) return;

    const rect = trigger.getBoundingClientRect();
    const styles = getComputedStyle(trigger);
    const written = scopedOverlayDirection(trigger, this.document.documentElement);
    const direction = written ?? (styles.direction === 'rtl' ? 'rtl' : 'ltr');

    const inheritedZ = styles.getPropertyValue('--gog-dropdown-z').trim();
    this.panelZIndex.set(inheritedZ ? (Number.parseFloat(inheritedZ) ?? null) : null);

    const size = panel
      ? { width: panel.offsetWidth, height: panel.scrollHeight }
      : {
          width: ESTIMATED_PANEL_WIDTH,
          height: this.items().length * ESTIMATED_ITEM_HEIGHT + PANEL_PADDING,
        };

    this.placement.set(
      resolveMenuPlacement(
        {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
        },
        size,
        { width: window.innerWidth, height: window.innerHeight },
        direction,
        this.direction(),
      ),
    );
  }
}

/**
 * First-pass estimates, replaced by the panel's own measurements a microtask later. The width
 * matches `--gog-menu-min-width`, which is the narrowest a panel can be.
 */
const ESTIMATED_ITEM_HEIGHT = 36;
const ESTIMATED_PANEL_WIDTH = 180;
const PANEL_PADDING = 8;

/**
 * Opens a `gog-menu` from the consumer's own button.
 *
 * ```html
 * <button gogButton [gogMenuTrigger]="rowMenu">Actions</button>
 * ```
 */
@Directive({
  selector: '[gogMenuTrigger]',
  host: {
    '[attr.aria-haspopup]': "'menu'",
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'isOpen() ? menu().menuId : null',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class GogMenuTriggerDirective {
  /** The menu this button opens — `<gog-menu #rowMenu>` plus `[gogMenuTrigger]="rowMenu"`. */
  readonly menu = input.required<MenuComponent>({ alias: 'gogMenuTrigger' });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen = computed(() => this.menu().isOpenFrom(this.elementRef.nativeElement));

  protected onClick(event: MouseEvent): void {
    event.preventDefault();
    this.menu().toggle(this.elementRef.nativeElement);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.menu().open(this.elementRef.nativeElement, event.key === 'ArrowUp' ? 'last' : 'first');
    }
  }
}
