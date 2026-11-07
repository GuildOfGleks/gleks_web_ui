import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { GOG_FOCUSABLE } from '@guildofgleks/ui/shared';
import { MenuComponent } from '@guildofgleks/ui/menu';

/** What a `gogContextMenuContent` template is handed: the data the menu was opened with. */
export interface GogContextMenuContext<T> {
  $implicit: T | null;
  data: T | null;
}

/**
 * The context menu's items, as a template that receives the data it was opened with:
 *
 * ```html
 * <gog-context-menu #rowMenu>
 *   <ng-template gogContextMenuContent let-row [gogContextMenuContentTypeOf]="rows">
 *     <button gogMenuItem (click)="edit(row)">Edit {{ row.name }}</button>
 *   </ng-template>
 * </gog-context-menu>
 * ```
 *
 * A template rather than projected content because the items usually depend on what was
 * right-clicked — a row, a cell, a file — and one menu serves every one of them.
 */
@Directive({ selector: '[gogContextMenuContent]' })
export class GogContextMenuContentDirective<T = unknown> {
  readonly templateRef = inject<TemplateRef<GogContextMenuContext<T>>>(TemplateRef);

  /**
   * Types the template's context; never read at runtime. Bind an array of what the menu is opened
   * with and `let-row` is checked against its element type.
   */
  readonly gogContextMenuContentTypeOf = input<readonly T[]>();

  static ngTemplateContextGuard<T>(
    _dir: GogContextMenuContentDirective<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogContextMenuContext<T> {
    return true;
  }
}

/**
 * A menu that opens where the pointer right-clicks — or, from the keyboard, under the focused
 * element on the ContextMenu key or Shift+F10 — instead of under a button.
 *
 * ```html
 * <ul [gogContextMenu]="fileMenu" [gogContextMenuResolve]="fileAt">…</ul>
 *
 * <gog-context-menu #fileMenu ariaLabel="File actions">
 *   <ng-template gogContextMenuContent let-file>
 *     <button gogMenuItem (click)="rename(file)">Rename</button>
 *     <button gogMenuItem (click)="remove(file)">Delete</button>
 *   </ng-template>
 * </gog-context-menu>
 * ```
 *
 * It is `gog-menu` underneath — the same panel, items, keyboard and styling — opened at a point
 * and handed data. What it adds is the opening: from a `[gogContextMenu]` region, which can
 * resolve the data from what was clicked, or from code with `openAt()` / `openFor()`.
 */
@Component({
  selector: 'gog-context-menu',
  imports: [MenuComponent, NgTemplateOutlet],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent<T = unknown> {
  /** Accessible name of the menu, announced when it opens. */
  readonly ariaLabel = input('');
  /** Fires when the menu opens, with the data it was opened with. */
  readonly gogOpened = output<T | null>();
  /** Fires after the menu closes, whichever way. */
  readonly gogClosed = output<void>();

  protected readonly content = contentChild(GogContextMenuContentDirective);
  private readonly menu = viewChild.required(MenuComponent);

  private readonly dataState = signal<T | null>(null);
  /** The data the menu was last opened with. */
  readonly data = this.dataState.asReadonly();
  readonly isOpen = computed(() => this.menu().isOpen());

  protected readonly context = computed<GogContextMenuContext<T>>(() => ({
    $implicit: this.dataState(),
    data: this.dataState(),
  }));

  /**
   * Opens at a viewport point. `source` is what was clicked: focus returns to it — or to the
   * nearest focusable element around it — when the menu closes.
   */
  openAt(point: { x: number; y: number }, source: HTMLElement, data: T | null = null): void {
    this.dataState.set(data);
    this.menu().openAt(point, focusableFor(source));
    this.gogOpened.emit(data);
  }

  /** Opens under `element`, at its inline-start edge — the keyboard's way in. */
  openFor(element: HTMLElement, data: T | null = null): void {
    const rect = element.getBoundingClientRect();
    const rtl = getComputedStyle(element).direction === 'rtl';
    this.openAt({ x: rtl ? rect.right : rect.left, y: rect.bottom }, element, data);
  }

  close(restoreFocus = true): void {
    this.menu().close(restoreFocus);
  }

  protected onClosed(): void {
    this.gogClosed.emit();
  }
}

/** How long a touch or a pen must be held still to open the menu, in milliseconds. */
const LONG_PRESS_MS = 500;
/** How far it may drift meanwhile and still be a press rather than a scroll or a drag, in px. */
const LONG_PRESS_SLOP = 10;

/** The element focus should go back to: `source` if it takes focus, else its nearest ancestor that does. */
function focusableFor(source: HTMLElement): HTMLElement {
  return source.closest<HTMLElement>(GOG_FOCUSABLE) ?? source;
}

/**
 * Makes an element open a `gog-context-menu` on right-click, and on the ContextMenu key or
 * Shift+F10 from anything focused inside it.
 *
 * ```html
 * <tr [gogContextMenu]="rowMenu" [gogContextMenuData]="row">…</tr>
 * <ul [gogContextMenu]="fileMenu" [gogContextMenuResolve]="fileAt">…</ul>
 * ```
 *
 * `gogContextMenuData` hands the menu one value. `gogContextMenuResolve` works it out from the
 * element that was clicked instead — one listener on a list rather than one per row — and
 * returning `null` or `undefined` from it leaves the browser's own menu alone for that spot.
 *
 * **A long press opens it too**, with a touch or a pen held still for half a second. Android
 * raises `contextmenu` for a long press itself; iOS Safari never does, so without this an iPhone
 * or iPad had no way to open the menu at all. Whichever comes first opens it, once per press, and
 * the click the finger's release makes is swallowed, so the element pressed is not also activated.
 */
@Directive({
  selector: '[gogContextMenu]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
    '(keydown)': 'onKeydown($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'endPress()',
    '(pointercancel)': 'endPress()',
    // iOS draws its own callout (open link, save image) for the same hold; the menu replaces it.
    '[style.-webkit-touch-callout]': "disabled() ? null : 'none'",
  },
})
export class GogContextMenuTriggerDirective<T = unknown> {
  readonly menu = input.required<ContextMenuComponent<T>>({ alias: 'gogContextMenu' });
  readonly data = input<T | null>(null, { alias: 'gogContextMenuData' });
  readonly resolve = input<((target: HTMLElement) => T | null | undefined) | null>(null, {
    alias: 'gogContextMenuResolve',
  });
  /** Leaves the browser's own menu in place. */
  readonly disabled = input(false, {
    alias: 'gogContextMenuDisabled',
    transform: booleanAttribute,
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** A touch or pen press that may become a long press. */
  private press: { pointerId: number; x: number; y: number; target: HTMLElement } | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  /** The current press already opened the menu — by the timer or by the platform's own event. */
  private pressOpened = false;
  /** The click the release of a long press makes, to be swallowed. */
  private swallowClick = false;

  constructor() {
    // Capture phase: the element pressed must not see the click a long press ends in.
    const onClick = (event: Event) => {
      if (!this.swallowClick) return;
      this.swallowClick = false;
      event.stopPropagation();
      event.preventDefault();
    };
    // iOS starts selecting text on the same hold; a press that is opening a menu is not a selection.
    const onSelectStart = (event: Event) => {
      if (this.press) event.preventDefault();
    };
    this.host.addEventListener('click', onClick, true);
    this.host.addEventListener('selectstart', onSelectStart);
    inject(DestroyRef).onDestroy(() => {
      this.clearTimer();
      this.host.removeEventListener('click', onClick, true);
      this.host.removeEventListener('selectstart', onSelectStart);
    });
  }

  protected onPointerDown(event: PointerEvent): void {
    this.cancelPress();
    this.pressOpened = false;
    this.swallowClick = false;
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    if (!event.isPrimary || this.disabled()) return;
    this.press = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      target: this.targetOf(event),
    };
    this.pressTimer = setTimeout(() => this.longPress(), LONG_PRESS_MS);
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press;
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > LONG_PRESS_SLOP) {
      this.cancelPress();
    }
  }

  /** The finger lifted, or a scroll took the touch: the press is over, and so is its timer. */
  protected endPress(): void {
    this.clearTimer();
    this.press = null;
    if (!this.pressOpened && !this.swallowClick) return;
    // The click a release makes comes right after it, and Android may still be about to raise
    // `contextmenu`; past that, a right-click or the menu key is a new request again.
    setTimeout(() => {
      this.pressOpened = false;
      this.swallowClick = false;
    }, LONG_PRESS_MS);
  }

  /** Moved too far to be a press — a scroll or a drag. */
  private cancelPress(): void {
    this.clearTimer();
    this.press = null;
  }

  private longPress(): void {
    const press = this.press;
    this.pressTimer = null;
    if (!press || this.pressOpened) return;
    const data = this.dataFor(press.target);
    if (data === undefined) return;
    this.pressOpened = true;
    this.swallowClick = true;
    this.host.ownerDocument.getSelection?.()?.removeAllRanges();
    this.menu().openAt({ x: press.x, y: press.y }, press.target, data);
  }

  private clearTimer(): void {
    if (this.pressTimer !== null) clearTimeout(this.pressTimer);
    this.pressTimer = null;
  }

  protected onContextMenu(event: MouseEvent): void {
    // The platform's own long press (Android) after — or before — ours: one menu per press.
    if (this.pressOpened) {
      event.preventDefault();
      return;
    }
    const target = this.targetOf(event);
    const data = this.dataFor(target);
    if (data === undefined) return;
    event.preventDefault();
    if (this.press) {
      // Android's long press arrived first: it opens the menu, and the timer stands down.
      this.pressOpened = true;
      this.swallowClick = true;
      this.clearTimer();
    }
    // A keyboard-raised `contextmenu` event (some platforms fire one) has no pointer position.
    if (event.clientX === 0 && event.clientY === 0 && event.button !== 2) {
      this.menu().openFor(target, data);
      return;
    }
    this.menu().openAt({ x: event.clientX, y: event.clientY }, target, data);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const isMenuKey = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    if (!isMenuKey) return;
    const target = this.targetOf(event);
    const data = this.dataFor(target);
    if (data === undefined) return;
    event.preventDefault();
    this.menu().openFor(target, data);
  }

  /** `undefined` means "no menu here"; anything else, `null` included, opens it. */
  private dataFor(target: HTMLElement): T | null | undefined {
    if (this.disabled()) return undefined;
    const resolve = this.resolve();
    if (!resolve) return this.data();
    const resolved = resolve(target);
    return resolved === null ? undefined : resolved;
  }

  private targetOf(event: Event): HTMLElement {
    const target = event.target;
    return target instanceof HTMLElement && this.host.contains(target) ? target : this.host;
  }
}
