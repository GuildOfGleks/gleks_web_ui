import { Signal, computed } from '@angular/core';

/** The slice of a list that is worth rendering, as indices into the full list. */
export interface GogVirtualRange {
  /** First index to render, inclusive. */
  readonly start: number;
  /** One past the last index to render, so `slice(start, end)` is the window. */
  readonly end: number;
}

/** What `GogVirtualWindow` needs to do its arithmetic. Every input is a signal it reads. */
export interface GogVirtualWindowInputs {
  /** How many rows the list has in total — not how many are rendered. */
  readonly count: Signal<number>;
  /**
   * One row's height in px, measured rather than assumed.
   *
   * The library learned this the expensive way: `--gog-*-option-height` described itself as an
   * estimate and was wrong in all eleven shipped themes, low by up to 8.38px a row, while a
   * placement decision depended on it. A window is far less forgiving than a placement — the error
   * accumulates once per row — so this takes a number that came from `getBoundingClientRect`.
   */
  readonly rowHeight: Signal<number>;
  /** The scroller's visible height in px. Not the panel's max-height, which is a cap. */
  readonly viewportHeight: Signal<number>;
  /** How far the scroller is scrolled, in px. */
  readonly scrollTop: Signal<number>;
  /**
   * Rows rendered beyond each edge of the viewport, so a scroll does not expose blank space
   * before the next frame lands. Defaults to 4.
   */
  readonly overscan?: number;
}

const DEFAULT_OVERSCAN = 4;

/**
 * The arithmetic behind a windowed list, and nothing else.
 *
 * **No DOM, no template, no scroll listener.** The component that uses this owns its scroller —
 * the three dropdowns already own theirs (a `gog-scroll` inside the panel) and `gog-table` owns a
 * different one — so a primitive that grabbed an element would have to be told which, and would
 * still not know when that element moved. It reads signals and returns numbers; everything that
 * touches the page stays in the component.
 *
 * That is the same division `GogRippleController` made, for the reason `docs/ripple.md` records:
 * the engine lives beside the components rather than inside a directive, because the things that
 * need it cannot all reach a directive through `hostDirectives`.
 *
 * ```ts
 * private readonly window = new GogVirtualWindow({
 *   count: computed(() => this.visibleOptions().length),
 *   rowHeight: this.measuredRowHeight,
 *   viewportHeight: this.panelHeight,
 *   scrollTop: this.panelScrollTop,
 * });
 * // window.range() -> { start, end }
 * // window.padBefore() / window.padEnd() -> px of filler above and below the rendered slice
 * ```
 *
 * **Why padding rather than absolute positioning.** A spacer above and below the rendered rows
 * keeps the list in normal flow, so the rows stay `display: flex` children of the same container
 * and every selector, gap and `:last-child` a component already relies on keeps working. Absolute
 * positioning each row is the other common shape and it changes what the component's own CSS
 * means, which is a large price for a list that is one column wide.
 *
 * @see docs/virtualization.md — the plan, its measurements, and what still has to be got right in
 * the components that adopt this (ARIA counts, keyboard reach, panel height, filter resets).
 */
export class GogVirtualWindow {
  private readonly overscan: number;

  constructor(private readonly inputs: GogVirtualWindowInputs) {
    this.overscan = Math.max(0, Math.trunc(inputs.overscan ?? DEFAULT_OVERSCAN));
  }

  /**
   * The total height the list would have if every row were rendered. What the scroller needs to
   * believe so its thumb is the right size and `scrollTop` spans the whole list.
   */
  readonly totalHeight = computed(() => {
    const rowHeight = this.safeRowHeight();
    return rowHeight === 0 ? 0 : this.safeCount() * rowHeight;
  });

  /**
   * The slice worth rendering.
   *
   * **Degrades to the whole list rather than to nothing.** A row height of zero is what a caller
   * has before it has measured anything, and a window computed from it would be `{0, 0}` — an
   * empty panel that looks like a bug and hides the data. Rendering everything is the pre-window
   * behaviour, which is slow and correct; that is the right way round for a fallback.
   */
  readonly range = computed<GogVirtualRange>(() => {
    const count = this.safeCount();
    const rowHeight = this.safeRowHeight();
    const viewportHeight = this.safeViewportHeight();

    if (count === 0) return { start: 0, end: 0 };
    if (rowHeight === 0 || viewportHeight === 0) return { start: 0, end: count };

    const first = Math.floor(this.safeScrollTop() / rowHeight);
    // `ceil` on the viewport, then one more: a viewport that is not an exact multiple of the row
    // height always straddles one extra row, and scrolling by a fraction of a row straddles
    // another. Getting this wrong leaves a sliver of blank at the bottom edge on every scroll.
    const visible = Math.ceil(viewportHeight / rowHeight) + 1;

    const start = Math.max(0, first - this.overscan);
    const end = Math.min(count, first + visible + this.overscan);
    return { start, end };
  });

  /** Filler above the rendered slice, in px, so the rows sit where their indices say. */
  readonly padBefore = computed(() => this.range().start * this.safeRowHeight());

  /** Filler below, in px. Derived from the total so rounding cannot leave a gap. */
  readonly padAfter = computed(() => {
    const rendered = this.range().end * this.safeRowHeight();
    return Math.max(0, this.totalHeight() - rendered);
  });

  /**
   * Where the scroller has to be for `index` to be fully visible, or `null` if it already is.
   *
   * This is what keyboard navigation needs: arrowing to a row outside the window is a scroll
   * first and a focus move second, because the element does not exist until the scroll has
   * re-rendered the slice. Returning `null` rather than the current position lets a caller skip
   * the scroll entirely, which matters because scrolling when nothing needs to move cancels a
   * user's own in-progress scroll in some browsers.
   */
  scrollOffsetFor(index: number): number | null {
    const count = this.safeCount();
    const rowHeight = this.safeRowHeight();
    const viewportHeight = this.safeViewportHeight();
    if (count === 0 || rowHeight === 0 || viewportHeight === 0) return null;

    const clamped = Math.min(Math.max(0, Math.trunc(index)), count - 1);
    const rowTop = clamped * rowHeight;
    const rowBottom = rowTop + rowHeight;
    const scrollTop = this.safeScrollTop();

    if (rowTop < scrollTop) return rowTop;
    if (rowBottom > scrollTop + viewportHeight) return rowBottom - viewportHeight;
    return null;
  }

  /** Guards against the shapes a caller can legitimately be in before it has measured anything. */
  private safeCount(): number {
    return Math.max(0, Math.trunc(this.inputs.count()));
  }

  private safeRowHeight(): number {
    const value = this.inputs.rowHeight();
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private safeViewportHeight(): number {
    const value = this.inputs.viewportHeight();
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private safeScrollTop(): number {
    const value = this.inputs.scrollTop();
    if (!Number.isFinite(value) || value <= 0) return 0;
    // A scroller can report a scrollTop past its own end during an elastic/overscroll bounce.
    // Clamping keeps `range()` inside the list instead of returning an empty slice at the moment
    // a user flicks to the bottom.
    return Math.min(value, Math.max(0, this.totalHeight() - this.safeViewportHeight()));
  }
}
