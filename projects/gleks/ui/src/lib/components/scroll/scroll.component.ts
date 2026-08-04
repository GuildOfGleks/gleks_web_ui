import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { GogScrollAxis, GogScrollSize } from '../../shared/types';

/** Snapshot of the viewport's native scroll geometry, emitted on every scroll/resize. */
export interface GogScrollMetrics {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

type GogScrollDirection = 'vertical' | 'horizontal';

/** A sub-pixel overflow reading is rounding noise, not real scrollable content. */
const OVERFLOW_EPSILON = 1;
/** Portion of the viewport paged per track click, leaving visual continuity with the old view. */
const TRACK_CLICK_PAGE_RATIO = 0.9;

function readPx(raw: string, fallback: number): number {
  const parsed = Number.parseFloat(raw.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Drop-in replacement for a native `overflow: auto` region: the content still scrolls
 * natively (wheel, touch, keyboard, focus-into-view all keep working unmodified), only the
 * browser's own scrollbar chrome is hidden and replaced with a themeable, draggable
 * overlay thumb built from plain pointer events + `ResizeObserver` — no CDK involved, to
 * stay consistent with the rest of this library's hand-rolled overlay/positioning code.
 */
@Component({
  selector: 'gog-scroll',
  imports: [],
  templateUrl: './scroll.component.html',
  styleUrl: './scroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollComponent {
  /** Which axes get an overlay thumb. Native scrolling on the other axis is unaffected. */
  readonly axis = input<GogScrollAxis>('vertical');
  readonly size = input<GogScrollSize>('normal');
  /** Fades the thumb out after `hideDelay` ms of inactivity; false keeps it always visible. */
  readonly autoHide = input(true);
  readonly hideDelay = input(800);
  /** Pixel distance from an edge that still counts as "reached" for gogReachStart/End. */
  readonly reachThreshold = input(0);
  /**
   * Renders the viewport as its own tab stop (`tabindex="0"`, `role="region"`) per the
   * WAI-ARIA scrollable-region pattern. Turn off when nesting inside a component that
   * already owns focus/keyboard handling (a listbox panel, a dialog body) so this doesn't
   * add a redundant stop — the descendants' own focus still auto-scrolls into view either way.
   */
  readonly focusable = input(true);
  /** Accessible name for the viewport when `focusable` is true and there is no visible label. */
  readonly ariaLabel = input('');

  readonly gogScroll = output<GogScrollMetrics>();
  readonly gogReachStart = output<GogScrollDirection>();
  readonly gogReachEnd = output<GogScrollDirection>();

  protected readonly viewportRef = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  protected readonly contentRef = viewChild.required<ElementRef<HTMLDivElement>>('content');

  protected readonly showTrackV = signal(false);
  protected readonly showTrackH = signal(false);
  protected readonly thumbSizeV = signal(100);
  protected readonly thumbPosV = signal(0);
  protected readonly thumbSizeH = signal(100);
  protected readonly thumbPosH = signal(0);
  protected readonly interacting = signal(false);
  protected readonly dragAxis = signal<GogScrollDirection | null>(null);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);

  private resizeObserver: ResizeObserver | null = null;
  private updateFrame: number | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Read once per token change instead of per drag/scroll tick — see refreshTokens(). */
  private thumbMinSizePx = 32;

  private dragStartPointer = 0;
  private dragStartScroll = 0;
  private dragTrackLength = 0;
  private dragThumbSizePct = 100;

  private readonly reachState: Record<GogScrollDirection, { start: boolean; end: boolean }> = {
    vertical: { start: true, end: false },
    horizontal: { start: true, end: false },
  };

  constructor() {
    if (!this.isBrowser) return;

    afterNextRender(() => {
      const viewportEl = this.viewportRef().nativeElement;
      const contentEl = this.contentRef().nativeElement;

      this.refreshTokens();

      // Not implemented by jsdom (so: absent in unit tests) and by very old browsers —
      // degrades to a single initial measurement instead of tracking live resizes.
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => this.scheduleMeasure());
        observer.observe(viewportEl);
        observer.observe(contentEl);
        this.resizeObserver = observer;
      }

      this.scheduleMeasure();
    });

    // Re-measures on axis/size changes; guarded because this also fires once before
    // afterNextRender has run, when there is nothing yet to measure.
    effect(() => {
      this.axis();
      this.size();
      if (!this.resizeObserver) return;
      this.refreshTokens();
      this.scheduleMeasure();
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      if (this.updateFrame !== null) cancelAnimationFrame(this.updateFrame);
      if (this.hideTimer !== null) clearTimeout(this.hideTimer);
    });
  }

  /** Scrolls the viewport exactly like `Element.scrollTo` — this simply forwards to it. */
  scrollTo(options: ScrollToOptions): void {
    this.viewportRef().nativeElement.scrollTo(options);
  }

  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    this.viewportRef().nativeElement.scrollTo({ top: 0, behavior });
  }

  scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    const el = this.viewportRef().nativeElement;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  scrollToLeft(behavior: ScrollBehavior = 'smooth'): void {
    this.viewportRef().nativeElement.scrollTo({ left: 0, behavior });
  }

  scrollToRight(behavior: ScrollBehavior = 'smooth'): void {
    const el = this.viewportRef().nativeElement;
    el.scrollTo({ left: el.scrollWidth, behavior });
  }

  protected onScroll(): void {
    this.interacting.set(true);
    this.restartHideTimer();
    this.scheduleMeasure();
  }

  protected onActivity(): void {
    this.interacting.set(true);
    this.restartHideTimer();
  }

  protected onTrackPointerDown(event: PointerEvent, axis: GogScrollDirection): void {
    // Only the empty track background pages the view; a click that landed on the thumb
    // itself already got a dedicated handler and stopped propagation before reaching here.
    if (event.target !== event.currentTarget) return;
    event.preventDefault();

    const track = event.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const viewportEl = this.viewportRef().nativeElement;

    if (axis === 'vertical') {
      const clickRatio = (event.clientY - rect.top) / rect.height;
      const thumbCenter = this.thumbPosV() / 100 + this.thumbSizeV() / 200;
      const direction = clickRatio < thumbCenter ? -1 : 1;
      viewportEl.scrollBy({
        top: direction * viewportEl.clientHeight * TRACK_CLICK_PAGE_RATIO,
        behavior: 'smooth',
      });
    } else {
      const clickRatio = (event.clientX - rect.left) / rect.width;
      const thumbCenter = this.thumbPosH() / 100 + this.thumbSizeH() / 200;
      const direction = clickRatio < thumbCenter ? -1 : 1;
      viewportEl.scrollBy({
        left: direction * viewportEl.clientWidth * TRACK_CLICK_PAGE_RATIO,
        behavior: 'smooth',
      });
    }

    this.interacting.set(true);
    this.restartHideTimer();
  }

  protected onThumbPointerDown(event: PointerEvent, axis: GogScrollDirection): void {
    event.preventDefault();
    event.stopPropagation();

    const thumb = event.currentTarget as HTMLElement;
    thumb.setPointerCapture(event.pointerId);

    const track = thumb.parentElement as HTMLElement;
    const viewportEl = this.viewportRef().nativeElement;

    this.dragAxis.set(axis);
    this.dragStartPointer = axis === 'vertical' ? event.clientY : event.clientX;
    this.dragStartScroll = axis === 'vertical' ? viewportEl.scrollTop : viewportEl.scrollLeft;
    this.dragTrackLength = axis === 'vertical' ? track.clientHeight : track.clientWidth;
    this.dragThumbSizePct = axis === 'vertical' ? this.thumbSizeV() : this.thumbSizeH();
  }

  protected onThumbPointerMove(event: PointerEvent, axis: GogScrollDirection): void {
    if (this.dragAxis() !== axis) return;

    const viewportEl = this.viewportRef().nativeElement;
    const pointer = axis === 'vertical' ? event.clientY : event.clientX;
    const delta = pointer - this.dragStartPointer;
    // Only the track length left over once the thumb's own size is subtracted actually
    // maps to travel distance — a thumb spanning the whole track has nowhere to move.
    const freeTrackLength = this.dragTrackLength * (1 - this.dragThumbSizePct / 100);
    if (freeTrackLength <= 0) return;

    const scrollable =
      axis === 'vertical'
        ? viewportEl.scrollHeight - viewportEl.clientHeight
        : viewportEl.scrollWidth - viewportEl.clientWidth;
    const nextScroll = this.dragStartScroll + (delta / freeTrackLength) * scrollable;

    if (axis === 'vertical') {
      viewportEl.scrollTop = nextScroll;
    } else {
      viewportEl.scrollLeft = nextScroll;
    }
  }

  protected onThumbPointerUp(event: PointerEvent): void {
    const thumb = event.currentTarget as HTMLElement;
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
    this.dragAxis.set(null);
    this.restartHideTimer();
  }

  private restartHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (!this.autoHide()) return;

    this.hideTimer = setTimeout(() => {
      if (this.dragAxis() === null) this.interacting.set(false);
    }, this.hideDelay());
  }

  /** Reads the tokens that feed thumb-size math. Cheap, but still only once per change. */
  private refreshTokens(): void {
    const styles = getComputedStyle(this.viewportRef().nativeElement);
    this.thumbMinSizePx = readPx(styles.getPropertyValue('--gog-scroll-thumb-min-size'), 32);
  }

  /** Coalesces scroll/resize bursts into one measurement per frame. */
  private scheduleMeasure(): void {
    if (this.updateFrame !== null) return;
    this.updateFrame = requestAnimationFrame(() => {
      this.updateFrame = null;
      this.measure();
    });
  }

  private measure(): void {
    const el = this.viewportRef().nativeElement;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;

    const axis = this.axis();
    const canV = axis !== 'horizontal';
    const canH = axis !== 'vertical';
    const overflowV = canV && scrollHeight - clientHeight > OVERFLOW_EPSILON;
    const overflowH = canH && scrollWidth - clientWidth > OVERFLOW_EPSILON;

    this.showTrackV.set(overflowV);
    this.showTrackH.set(overflowH);

    if (overflowV) {
      const minPct = clientHeight > 0 ? (this.thumbMinSizePx / clientHeight) * 100 : 0;
      const sizePct = clamp((clientHeight / scrollHeight) * 100, minPct, 100);
      const scrollableV = scrollHeight - clientHeight;
      const ratioV = scrollableV > 0 ? scrollTop / scrollableV : 0;
      this.thumbSizeV.set(sizePct);
      this.thumbPosV.set(ratioV * (100 - sizePct));
    }

    if (overflowH) {
      const minPct = clientWidth > 0 ? (this.thumbMinSizePx / clientWidth) * 100 : 0;
      const sizePct = clamp((clientWidth / scrollWidth) * 100, minPct, 100);
      const scrollableH = scrollWidth - clientWidth;
      const ratioH = scrollableH > 0 ? scrollLeft / scrollableH : 0;
      this.thumbSizeH.set(sizePct);
      this.thumbPosH.set(ratioH * (100 - sizePct));
    }

    this.gogScroll.emit({ scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth });
    // Only for axes this instance actually scrolls — otherwise the disabled axis is
    // trivially "at both ends" on the very first measurement and fires once for free.
    if (canV) this.checkReach('vertical', scrollTop, scrollHeight, clientHeight, overflowV);
    if (canH) this.checkReach('horizontal', scrollLeft, scrollWidth, clientWidth, overflowH);
  }

  private checkReach(
    axis: GogScrollDirection,
    position: number,
    scrollSize: number,
    clientSize: number,
    overflow: boolean,
  ): void {
    const threshold = this.reachThreshold();
    const atStart = !overflow || position <= threshold;
    const atEnd = !overflow || position + clientSize >= scrollSize - threshold;
    const state = this.reachState[axis];

    if (atStart && !state.start) this.gogReachStart.emit(axis);
    if (atEnd && !state.end) this.gogReachEnd.emit(axis);
    state.start = atStart;
    state.end = atEnd;
  }
}
