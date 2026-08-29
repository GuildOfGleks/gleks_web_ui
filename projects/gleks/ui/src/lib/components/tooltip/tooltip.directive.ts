import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { GOG_CONFIG } from '../../shared/config';
import { resolveLengthToken, resolveNumberToken } from '../../shared/token-values';
import { GogTooltipOverlay } from '../../shared/tooltip-overlay';
import {
  GogTooltipTargetRect,
  GogTooltipViewport,
  resolveTooltipPlacement,
} from '../../shared/tooltip-position';
import { GogTooltipPosition } from '../../shared/types';
import { GogTooltipBubbleComponent } from './tooltip-bubble.component';

const DEFAULT_SHOW_DELAY = 300;
const DEFAULT_HIDE_DELAY = 100;
const DEFAULT_POSITION: GogTooltipPosition = 'auto';
const DEFAULT_GAP = 8;
const DEFAULT_Z_INDEX = 400;
const VIEWPORT_PADDING = 8;

let nextUid = 0;

/**
 * Adds a hover/focus tooltip to any element — a `gog-*` component's host tag or a plain
 * native one — without that element needing to know anything about it:
 * `<button gogTooltip="Save changes">` or `<gog-chip [gogTooltip]="hint">` both just work,
 * since this only ever reads the host `ElementRef` and never assumes what created it.
 *
 * The bubble itself is a separate component (`GogTooltipBubbleComponent`) created on demand
 * and moved into `document.body` via `GogTooltipOverlay` — see that file for why a portal is
 * necessary here (clipping/position ancestors) and why it isn't built on `GogDropdownOverlay`.
 */
@Directive({
  selector: '[gogTooltip]',
  host: {
    '[attr.aria-describedby]': 'describedById()',
    '(mouseenter)': 'onPointerEnter()',
    '(mouseleave)': 'onPointerLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut()',
    '(keydown.escape)': 'onEscape()',
  },
})
export class GogTooltipDirective {
  /** The hint text, or a `TemplateRef` for richer content. Empty/null shows nothing. */
  readonly gogTooltip = input<string | TemplateRef<unknown> | null>(null);
  /** Unset, falls back to `GOG_CONFIG.tooltip.position`, then to `'auto'`. */
  readonly gogTooltipPosition = input<GogTooltipPosition | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.tooltip.showDelay`, then to `300` (ms). */
  readonly gogTooltipShowDelay = input<number | undefined>(undefined);
  /** Unset, falls back to `GOG_CONFIG.tooltip.hideDelay`, then to `100` (ms). */
  readonly gogTooltipHideDelay = input<number | undefined>(undefined);
  readonly gogTooltipDisabled = input(false);
  /**
   * Extra class(es) applied to the bubble itself, for restyling one specific tooltip
   * instance. The bubble is appended to `document.body`, so a `--gog-tooltip-*` override
   * scoped to an ancestor (anything short of `:root`) never reaches it — a class targeting
   * the bubble directly, e.g. `.my-tooltip { --gog-tooltip-bg: gold; }`, is what does.
   */
  readonly gogTooltipClass = input('');

  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly globalConfig = inject(GOG_CONFIG);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly uid = `gog-tooltip-${++nextUid}`;
  private readonly overlay = new GogTooltipOverlay(this.viewContainerRef, this.document);

  private readonly isVisible = signal(false);
  protected readonly describedById = computed(() => (this.isVisible() ? this.uid : null));

  private readonly resolvedPosition = computed(
    () => this.gogTooltipPosition() ?? this.globalConfig.tooltip?.position ?? DEFAULT_POSITION,
  );
  private readonly resolvedShowDelay = computed(
    () => this.gogTooltipShowDelay() ?? this.globalConfig.tooltip?.showDelay ?? DEFAULT_SHOW_DELAY,
  );
  private readonly resolvedHideDelay = computed(
    () => this.gogTooltipHideDelay() ?? this.globalConfig.tooltip?.hideDelay ?? DEFAULT_HIDE_DELAY,
  );

  private activeRef: ComponentRef<GogTooltipBubbleComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private repositionFrame: number | null = null;
  private readonly onReflow = () => this.scheduleReposition();
  /**
   * Bound to the bubble itself (see `show()`) so moving the pointer off the trigger and
   * onto the bubble — to read more of it, or to scroll one tall enough to need it — cancels
   * the pending hide instead of racing it; leaving the bubble then re-queues the same hide
   * delay leaving the trigger would. WCAG 2.1 SC 1.4.13 "hoverable" requires exactly this:
   * hover-triggered content has to stay visible while the pointer is over the content, not
   * just the trigger.
   */
  private readonly onBubbleMouseEnter = () => this.cancelTimers();
  private readonly onBubbleMouseLeave = () => this.queueHide();

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  protected onPointerEnter(): void {
    this.queueShow();
  }

  protected onPointerLeave(): void {
    this.queueHide();
  }

  protected onFocusIn(): void {
    this.queueShow();
  }

  protected onFocusOut(): void {
    this.queueHide();
  }

  protected onEscape(): void {
    if (!this.isVisible()) return;
    this.cancelTimers();
    this.hide();
  }

  private queueShow(): void {
    if (!this.isBrowser || this.gogTooltipDisabled() || !this.gogTooltip() || this.isVisible()) {
      return;
    }
    this.cancelTimers();
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      this.show();
    }, this.resolvedShowDelay());
  }

  private queueHide(): void {
    this.cancelTimers();
    if (!this.isVisible()) return;
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.hide();
    }, this.resolvedHideDelay());
  }

  private cancelTimers(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private show(): void {
    const content = this.gogTooltip();
    if (!this.isBrowser || !content || this.isVisible()) return;

    const hostEl = this.elRef.nativeElement;
    const ref = this.overlay.attach(hostEl);
    this.activeRef = ref;
    this.isVisible.set(true);

    const bubbleEl = this.overlay.bubbleElement;
    bubbleEl?.addEventListener('mouseenter', this.onBubbleMouseEnter);
    bubbleEl?.addEventListener('mouseleave', this.onBubbleMouseLeave);

    ref.setInput('bubbleId', this.uid);
    ref.setInput('content', content);
    ref.setInput('zIndex', this.resolveZIndex(hostEl));
    ref.setInput('extraClass', this.gogTooltipClass());
    // setInput alone doesn't flush to the DOM (that happens on the next change-detection
    // pass) — without this, applyPlacement below would measure the bubble before its real
    // content ever rendered, i.e. an empty box a few px wide/tall instead of its actual
    // size, which is exactly what put the bubble in the wrong place.
    ref.changeDetectorRef.detectChanges();
    this.applyPlacement(ref, hostEl);

    // Set on a later frame so the initial (opacity: 0, scale: 0.96) state the stylesheet
    // starts from actually paints before flipping to --visible — flipping both in the same
    // tick would let the browser coalesce them into one style recalc with no transition.
    requestAnimationFrame(() => {
      if (this.activeRef === ref) {
        ref.setInput('visible', true);
      }
    });

    window.addEventListener('scroll', this.onReflow, { passive: true, capture: true });
    window.addEventListener('resize', this.onReflow, { passive: true });
  }

  private hide(): void {
    if (!this.isVisible()) return;

    this.isVisible.set(false);
    this.activeRef = null;
    this.overlay.detach();

    window.removeEventListener('scroll', this.onReflow, { capture: true });
    window.removeEventListener('resize', this.onReflow);

    if (this.repositionFrame !== null) {
      cancelAnimationFrame(this.repositionFrame);
      this.repositionFrame = null;
    }
  }

  private scheduleReposition(): void {
    if (this.repositionFrame !== null || !this.activeRef) return;

    this.repositionFrame = requestAnimationFrame(() => {
      this.repositionFrame = null;
      if (this.activeRef) {
        this.applyPlacement(this.activeRef, this.elRef.nativeElement);
      }
    });
  }

  private applyPlacement(ref: ComponentRef<GogTooltipBubbleComponent>, hostEl: HTMLElement): void {
    const bubbleEl = this.overlay.bubbleElement;
    if (!bubbleEl) return;

    const targetRect: GogTooltipTargetRect = hostEl.getBoundingClientRect();
    // offsetWidth/Height, not getBoundingClientRect: the bubble's enter transition scales
    // it down to 0.96 until `visible` flips, and a transform changes the *painted* rect
    // measured by getBoundingClientRect without changing layout — offset* reads the
    // untransformed layout box, which is the size to position against.
    const bubbleSize = { width: bubbleEl.offsetWidth, height: bubbleEl.offsetHeight };
    const viewport: GogTooltipViewport = { width: window.innerWidth, height: window.innerHeight };
    const gap = resolveLengthToken(hostEl, '--gog-tooltip-gap', DEFAULT_GAP);

    const placement = resolveTooltipPlacement(
      this.resolvedPosition(),
      targetRect,
      bubbleSize,
      viewport,
      gap,
      VIEWPORT_PADDING,
      // Read from the target rather than the document: a tooltip on a trigger inside an RTL
      // region of an LTR page has to mirror with that region, not with the page.
      getComputedStyle(hostEl).direction === 'rtl' ? 'rtl' : 'ltr',
    );

    ref.setInput('side', placement.side);
    ref.setInput('top', placement.top);
    ref.setInput('left', placement.left);
    ref.changeDetectorRef.detectChanges();
  }

  /**
   * A tooltip appended to `document.body` loses whatever `--gog-tooltip-z` an ancestor
   * (e.g. a `gog-dialog` panel, which raises it so nested overlays stack above the dialog)
   * declared, since `body` isn't part of that subtree anymore — same problem
   * `GogDropdownBase.resolvePanelZIndex` solves for dropdown panels, resolved here from the
   * trigger while it's still in its real position in the tree, before the bubble moves out.
   */
  private resolveZIndex(hostEl: HTMLElement): number {
    const inherited = getComputedStyle(hostEl).getPropertyValue('--gog-tooltip-z').trim();
    if (inherited) return resolveNumberToken(hostEl, '--gog-tooltip-z', DEFAULT_Z_INDEX);

    for (let node: HTMLElement | null = hostEl; node; node = node.parentElement) {
      const declared = node.style.getPropertyValue('--gog-tooltip-z').trim();
      if (declared) return resolveNumberToken(node, '--gog-tooltip-z', DEFAULT_Z_INDEX);
    }

    return DEFAULT_Z_INDEX;
  }

  private cleanup(): void {
    this.cancelTimers();
    this.hide();
  }
}
