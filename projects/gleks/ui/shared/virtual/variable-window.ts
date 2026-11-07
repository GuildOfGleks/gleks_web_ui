import { Signal, computed, signal } from '@angular/core';

import type { GogVirtualRange } from './virtual-window';

/** What `GogVariableWindow` needs. Every input is a signal it reads. */
export interface GogVariableWindowInputs {
  /** How many rows the list has in total — not how many are rendered. */
  readonly count: Signal<number>;
  /**
   * The height in px to assume for a row that has never been measured.
   *
   * Seeded from the first row the caller measures rather than from a token: `gog-table`'s row
   * height is padding plus leading plus a border, and `docs/virtualization.md`'s iteration 0
   * measured the equivalent token wrong in all eleven shipped themes.
   */
  readonly estimatedRowHeight: Signal<number>;
  /** The scroller's visible height in px. Not a `max-height`, which is a cap. */
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
 * The arithmetic behind a windowed list whose rows are **not** all the same height.
 *
 * `GogVirtualWindow` is the one to reach for wherever the rows are uniform — it is exact, it needs
 * no measurements, and a multiplication beats a binary search. This exists because `gog-table`
 * cannot use it, for a reason that is a fact about CSS rather than about this library:
 *
 * **A table row's height cannot be pinned.** `height` on a `<tr>` or a `<td>` is a *minimum* in
 * table layout, so a cell whose content wraps makes its row taller and nothing can stop it — one
 * cell taken from 40 to 600 characters measured 39px → 173.75px, under `table-layout: fixed`, with
 * the column width unchanged. A single-pitch window cannot describe that list.
 *
 * So this holds a height per row: the measured one where a row has ever been rendered, and an
 * estimate everywhere else. `range()` is then a binary search over the prefix sums rather than a
 * division.
 *
 * **Being an estimate is the whole difficulty**, and it lives in `applyMeasurements`, not here.
 * See its note: correcting a row *above* the viewport moves everything below it, under the reader,
 * while they scroll — so the correction has to be reported as a scroll delta and applied in the
 * same frame.
 *
 * @see docs/table-virtualization.md — the survey behind this, and what adopting it has to get right
 */
export class GogVariableWindow {
  private readonly overscan: number;

  /**
   * Measured heights by row index, `undefined` where a row has never been rendered.
   *
   * A sparse array rather than a `Map`: the index *is* the key, the reads are sequential, and the
   * prefix sum walks it start to finish either way.
   */
  private readonly measured = signal<readonly (number | undefined)[]>([]);

  constructor(private readonly inputs: GogVariableWindowInputs) {
    this.overscan = Math.max(0, Math.trunc(inputs.overscan ?? DEFAULT_OVERSCAN));
  }

  /**
   * Running total of row heights: `offsets[i]` is where row `i` starts, and `offsets[count]` is
   * the list's full height.
   *
   * Recomputed whole rather than patched. It is O(n) on a signal that changes only when a
   * measurement actually differs, and an incremental structure here would be a Fenwick tree
   * guarding a loop that costs a fraction of the layout it feeds.
   */
  private readonly offsets = computed<readonly number[]>(() => {
    const count = this.safeCount();
    const estimate = this.safeEstimate();
    const measured = this.measured();

    const offsets = new Array<number>(count + 1);
    offsets[0] = 0;
    for (let i = 0; i < count; i++) {
      const height = measured[i];
      offsets[i + 1] = offsets[i] + (height === undefined ? estimate : height);
    }
    return offsets;
  });

  /** What the scroller has to believe, so its thumb is the right size. */
  readonly totalHeight = computed(() => {
    const offsets = this.offsets();
    return offsets[offsets.length - 1] ?? 0;
  });

  /**
   * The slice worth rendering.
   *
   * **Degrades to the whole list rather than to nothing**, the same rule `GogVirtualWindow`
   * follows and for the same reason: a caller that has not measured anything yet has an estimate
   * of zero, and a window computed from it renders an empty panel that reads as broken. Rendering
   * everything is the pre-window behaviour — slow, and correct.
   */
  readonly range = computed<GogVirtualRange>(() => {
    const count = this.safeCount();
    if (count === 0) return { start: 0, end: 0 };

    const viewportHeight = this.safeViewportHeight();
    if (viewportHeight === 0 || this.totalHeight() === 0) return { start: 0, end: count };

    const offsets = this.offsets();
    const scrollTop = this.safeScrollTop();

    const first = this.indexAt(offsets, scrollTop);
    const last = this.indexAt(offsets, scrollTop + viewportHeight);

    return {
      start: Math.max(0, first - this.overscan),
      // `last` is the row the viewport's bottom edge falls in, so it is rendered: +1 for the
      // exclusive end, and another because a viewport that ends exactly on a boundary still
      // straddles the next row the moment it moves by a fraction of a pixel.
      end: Math.min(count, last + 1 + this.overscan),
    };
  });

  /** Filler above the rendered slice, in px, so the rows sit where their offsets say. */
  readonly padBefore = computed(() => this.offsets()[this.range().start] ?? 0);

  /** Filler below, in px. Derived from the total so rounding cannot leave a gap. */
  readonly padAfter = computed(() =>
    Math.max(0, this.totalHeight() - (this.offsets()[this.range().end] ?? 0)),
  );

  /**
   * Records what the rendered rows actually measured, and returns **how far the content above the
   * viewport moved** — which the caller must add to the scroller's `scrollTop`, in the same frame.
   *
   * This is the whole difficulty of a variable window, and it is not obvious from the arithmetic.
   * Every row starts as an estimate. The moment one is measured and disagrees, every row after it
   * shifts by the difference — including, when the corrected row is *above* the viewport, the rows
   * the reader is looking at. Scroll up into a region of taller-than-estimated rows and the
   * content jumps away from the pointer on every frame; the list appears to fight the scroll.
   *
   * Adding the delta back to `scrollTop` holds the visible rows still: the content moved down by
   * `delta`, so the viewport moves down by `delta` too and the same pixels stay under the reader.
   *
   * `heights[i]` is keyed by **real row index**, and a `0` or a negative is ignored rather than
   * stored — an unlaid-out row measures zero, and believing it would collapse the list.
   */
  applyMeasurements(heights: ReadonlyMap<number, number>): number {
    if (heights.size === 0) return 0;

    const estimate = this.safeEstimate();
    const current = this.measured();
    const next = current.slice();

    let changed = false;
    let deltaAbove = 0;
    const firstVisible = this.indexAt(this.offsets(), this.safeScrollTop());

    for (const [index, height] of heights) {
      if (!Number.isFinite(height) || height <= 0 || index < 0) continue;

      const previous = next[index] ?? estimate;
      if (Math.abs(previous - height) < 0.5) continue;

      next[index] = height;
      changed = true;
      // Only rows that start above the first visible one move it. A correction to a row the
      // reader is looking at, or below it, moves what comes after and leaves the viewport alone.
      if (index < firstVisible) deltaAbove += height - previous;
    }

    if (!changed) return 0;
    this.measured.set(next);
    return deltaAbove;
  }

  /**
   * Drops every measurement. For when the rows stop describing the same data — a new page, a new
   * sort, a filter — after which a cached height belongs to a row that is no longer there.
   */
  reset(): void {
    if (this.measured().length > 0) this.measured.set([]);
  }

  /** Where the scroller has to be for `index` to be fully visible, or `null` if it already is. */
  scrollOffsetFor(index: number): number | null {
    const count = this.safeCount();
    const viewportHeight = this.safeViewportHeight();
    if (count === 0 || viewportHeight === 0) return null;

    const offsets = this.offsets();
    const clamped = Math.min(Math.max(0, Math.trunc(index)), count - 1);
    const rowTop = offsets[clamped];
    const rowBottom = offsets[clamped + 1];
    const scrollTop = this.safeScrollTop();

    if (rowTop < scrollTop) return rowTop;
    if (rowBottom > scrollTop + viewportHeight) return rowBottom - viewportHeight;
    return null;
  }

  /**
   * The index of the row containing `position`, by binary search over the offsets.
   *
   * Returns the **last** index whose start is `<= position`, clamped to the list. A linear scan
   * would be fine at a thousand rows and is not at the hundreds of thousands this exists for, and
   * it runs on every scroll frame.
   */
  private indexAt(offsets: readonly number[], position: number): number {
    const count = offsets.length - 1;
    if (count <= 0) return 0;

    let low = 0;
    let high = count - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (offsets[mid] <= position) low = mid;
      else high = mid - 1;
    }
    return low;
  }

  private safeCount(): number {
    return Math.max(0, Math.trunc(this.inputs.count()));
  }

  private safeEstimate(): number {
    const value = this.inputs.estimatedRowHeight();
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private safeViewportHeight(): number {
    const value = this.inputs.viewportHeight();
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private safeScrollTop(): number {
    const value = this.inputs.scrollTop();
    if (!Number.isFinite(value) || value <= 0) return 0;
    // A scroller can report past its own end during an elastic bounce, and — more often here —
    // right after a measurement shortened the list under it.
    return Math.min(value, Math.max(0, this.totalHeight() - this.safeViewportHeight()));
  }
}
