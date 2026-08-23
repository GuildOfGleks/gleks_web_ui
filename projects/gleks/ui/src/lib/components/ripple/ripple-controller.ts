import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, PLATFORM_ID, Renderer2, effect, inject } from '@angular/core';

/** One live ripple node and where it is in its two-phase life. */
interface GogRippleInstance {
  readonly node: HTMLElement;
  /** The enter animation has finished, so the exit animation may start. */
  entered: boolean;
  /** The pointer/key has been let go, so the exit animation *should* start. */
  released: boolean;
}

/**
 * The ripple itself, as a plain class rather than as part of the directive.
 *
 * It is split out because **two kinds of caller need it**. `[gogRipple]` is the one a consumer
 * writes on their own element; the other is the library's own directives that already own a
 * consumer's element — `[gogButton]`, `gogMenuItem`, `gogCollapsibleTrigger` — which cannot use
 * `hostDirectives` here. `hostDirectives` can forward an input but cannot *compute* one, and what
 * those directives need is the negation of a value resolved through `GOG_CONFIG`. Owning a
 * controller is three lines; the alternative was either a ripple those elements could not turn
 * off or one that ignored the app-wide setting.
 *
 * ## What it does not do to its host
 *
 * The obvious ripple gives the host `overflow: hidden` and paints inside it, which clips
 * `gogBadge` — the badge sits outside the host's box on purpose. So the host only ever gets
 * `position: relative` (via `.gog-ripple-host`, and only while enabled), and the wash lives in a
 * layer that clips *itself* and takes the host's corner radius with `border-radius: inherit`.
 * See `styles/ripple.css`.
 *
 * ## Cost when disabled
 *
 * Nothing but the instance. `setEnabled(false)` detaches both trigger listeners and drops the
 * host class, so a component that wires a ripple in behind an input that is off pays for no
 * listeners, no class and no DOM. That is what makes `GOG_CONFIG.ripple.enabled` worth having as
 * a config key rather than as a `--gog-ripple-opacity: 0` token.
 */
export class GogRippleController {
  private layer: HTMLElement | null = null;
  private readonly active = new Set<GogRippleInstance>();
  /** Set while a key is held, so auto-repeat does not stack a ripple per repeat event. */
  private keyHeld = false;

  /** `renderer.listen` teardowns: the two on the host, and the three on the document. */
  private triggerListeners: (() => void)[] = [];
  private releaseListeners: (() => void)[] = [];

  constructor(
    private readonly host: HTMLElement,
    private readonly renderer: Renderer2,
    private readonly document: Document,
    private readonly isBrowser: boolean,
    /** Start every ripple from the middle, ignoring where the pointer landed. */
    private readonly centred: () => boolean,
  ) {}

  setEnabled(enabled: boolean): void {
    if (!this.isBrowser) return;
    if (enabled) this.attachTriggers();
    else this.detachTriggers();
  }

  destroy(): void {
    this.detachTriggers();
    this.stopListeningForRelease();

    for (const instance of [...this.active]) this.remove(instance);
    if (this.layer?.parentNode) {
      this.renderer.removeChild(this.layer.parentNode, this.layer);
    }
    this.layer = null;
  }

  private attachTriggers(): void {
    if (this.triggerListeners.length > 0) return;

    // The layer is positioned against the host, so it has to be a containing block. A class
    // rather than an inline style, so a host that is itself absolutely positioned can say so.
    this.renderer.addClass(this.host, 'gog-ripple-host');
    this.triggerListeners = [
      this.renderer.listen(this.host, 'pointerdown', (event: PointerEvent) =>
        this.onPointerDown(event),
      ),
      this.renderer.listen(this.host, 'keydown', (event: KeyboardEvent) => this.onKeyDown(event)),
    ];
  }

  private detachTriggers(): void {
    for (const unlisten of this.triggerListeners) unlisten();
    this.triggerListeners = [];
    this.renderer.removeClass(this.host, 'gog-ripple-host');
    // Switched off mid-press: the wave has nothing left to answer to, so it goes at once rather
    // than hanging until a release that is no longer being listened for.
    this.release();
  }

  private onPointerDown(event: PointerEvent): void {
    // Secondary buttons open context menus and never produce a click, so they get no feedback.
    if (event.button !== undefined && event.button !== 0) return;
    this.launch(event.clientX, event.clientY);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    if (event.repeat || this.keyHeld) return;
    this.keyHeld = true;
    this.launch();
  }

  /**
   * Starts one ripple. Coordinates are viewport-relative (`clientX`/`clientY`); omitted, or with
   * `centred`, it starts from the middle of the host.
   */
  private launch(clientX?: number, clientY?: number): void {
    if (this.suppressed()) return;

    const rect = this.host.getBoundingClientRect();
    const centred = this.centred() || clientX === undefined || clientY === undefined;
    const x = centred ? rect.width / 2 : clientX - rect.left;
    const y = centred ? rect.height / 2 : clientY - rect.top;

    // The circle has to reach the farthest corner, or a press near one edge leaves the opposite
    // corner untouched — which reads as a bug rather than as a deliberate partial wash.
    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

    const node = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(node, 'class', 'gog-ripple gog-ripple--entering');
    this.renderer.setStyle(node, 'left', `${x - radius}px`);
    this.renderer.setStyle(node, 'top', `${y - radius}px`);
    this.renderer.setStyle(node, 'width', `${radius * 2}px`);
    this.renderer.setStyle(node, 'height', `${radius * 2}px`);

    const instance: GogRippleInstance = { node, entered: false, released: false };
    this.active.add(instance);

    // One listener for both phases. Which animation just ended is read from the instance's own
    // state rather than from `event.animationName`, so renaming a keyframe in the stylesheet
    // cannot silently strand a node in the DOM.
    this.renderer.listen(node, 'animationend', () => this.onAnimationEnd(instance));

    this.renderer.appendChild(this.ensureLayer(), node);
    this.listenForRelease();
  }

  /**
   * The release listeners live on the **document**, and only while something is in flight.
   *
   * On the host they would be three more permanent listeners per rippling element — the cost
   * that matters on a panel rendering a thousand options — and they would still miss the
   * ordinary case of pressing a button and letting go somewhere else on the page, which fires no
   * `pointerup` on the host at all.
   */
  private listenForRelease(): void {
    if (this.releaseListeners.length > 0) return;

    this.releaseListeners = [
      // `pointercancel` is also what the browser sends when it takes a touch gesture over for
      // scrolling, so a drag-to-scroll inside a `gog-scroll` fades the ripple instead of
      // stranding it.
      this.renderer.listen(this.document, 'pointerup', () => this.release()),
      this.renderer.listen(this.document, 'pointercancel', () => this.release()),
      this.renderer.listen(this.document, 'keyup', () => this.release()),
    ];
  }

  private stopListeningForRelease(): void {
    for (const unlisten of this.releaseListeners) unlisten();
    this.releaseListeners = [];
  }

  /** The pointer or key was let go: every live ripple may now fade out. */
  private release(): void {
    this.keyHeld = false;
    this.stopListeningForRelease();

    for (const instance of this.active) {
      instance.released = true;
      if (instance.entered) this.beginExit(instance);
    }
  }

  private onAnimationEnd(instance: GogRippleInstance): void {
    if (!instance.entered) {
      instance.entered = true;
      // Released mid-expansion: the fade was owed and is paid now the wave has finished growing.
      if (instance.released) this.beginExit(instance);
      return;
    }
    this.remove(instance);
  }

  private beginExit(instance: GogRippleInstance): void {
    this.renderer.setAttribute(instance.node, 'class', 'gog-ripple gog-ripple--leaving');
  }

  private remove(instance: GogRippleInstance): void {
    if (instance.node.parentNode) {
      this.renderer.removeChild(instance.node.parentNode, instance.node);
    }
    this.active.delete(instance);
  }

  private ensureLayer(): HTMLElement {
    if (this.layer) return this.layer;

    const layer = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setAttribute(layer, 'class', 'gog-ripple-layer');
    // Decoration, and nothing an assistive technology should meet.
    this.renderer.setAttribute(layer, 'aria-hidden', 'true');
    this.renderer.appendChild(this.host, layer);
    this.layer = layer;
    return layer;
  }

  private suppressed(): boolean {
    // A host the user cannot act on must not answer as though they had. `disabled` covers the
    // native controls; `aria-disabled` covers the ones this library keeps focusable on purpose.
    if (this.host.hasAttribute('disabled')) return true;
    if (this.host.getAttribute('aria-disabled') === 'true') return true;

    return this.prefersReducedMotion();
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}

/**
 * Wires a ripple onto the current injection context's own host element, driven by `enabled`.
 *
 * One line in any directive or component that already owns the element it wants to ripple:
 *
 * ```ts
 * private readonly rippleControl = bindRipple(this.rippleEnabled);
 * ```
 *
 * Must be called from an injection context (a field initialiser or a constructor).
 */
export function bindRipple(
  enabled: () => boolean,
  centred: () => boolean = () => false,
): GogRippleController {
  const controller = new GogRippleController(
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
    inject(Renderer2),
    inject(DOCUMENT),
    isPlatformBrowser(inject(PLATFORM_ID)),
    () => centred(),
  );

  effect(() => controller.setEnabled(enabled()));
  inject(DestroyRef).onDestroy(() => controller.destroy());

  return controller;
}
