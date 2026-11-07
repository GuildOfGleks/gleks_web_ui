import { signal } from '@angular/core';

import { GogVirtualWindow } from './virtual-window';

/** A window over `count` rows of `rowHeight`, in a `viewportHeight` scroller. */
function makeWindow(options: {
  count?: number;
  rowHeight?: number;
  viewportHeight?: number;
  scrollTop?: number;
  overscan?: number;
}) {
  const count = signal(options.count ?? 1000);
  const rowHeight = signal(options.rowHeight ?? 40);
  const viewportHeight = signal(options.viewportHeight ?? 260);
  const scrollTop = signal(options.scrollTop ?? 0);
  const window = new GogVirtualWindow({
    count,
    rowHeight,
    viewportHeight,
    scrollTop,
    overscan: options.overscan,
  });
  return { window, count, rowHeight, viewportHeight, scrollTop };
}

describe('GogVirtualWindow', () => {
  it('renders a window whose size does not grow with the list', () => {
    const small = makeWindow({ count: 100 });
    const huge = makeWindow({ count: 1_000_000 });

    const smallSize = small.window.range().end - small.window.range().start;
    const hugeSize = huge.window.range().end - huge.window.range().start;

    expect(smallSize).toBe(hugeSize);
    // 260/40 -> 7 straddling rows, +1, +4 of overscan below. The top edge has no overscan to
    // spend at scrollTop 0, which is why this is not symmetrical.
    expect(hugeSize).toBe(12);
  });

  /*
   * The measurement that justified the whole plan: ten thousand rows built to show six. This is
   * that ratio, asserted rather than quoted.
   */
  it('renders a constant number of rows out of ten thousand', () => {
    const { window } = makeWindow({ count: 10_000, rowHeight: 44, viewportHeight: 264 });
    const size = window.range().end - window.range().start;

    expect(size).toBeLessThan(20);
    expect(window.totalHeight()).toBe(440_000);
  });

  it('moves the window as the scroller moves, and keeps the padding consistent', () => {
    const { window, scrollTop } = makeWindow({ count: 1000, rowHeight: 40, viewportHeight: 200 });

    scrollTop.set(4000); // row 100
    const range = window.range();
    expect(range.start).toBe(96); // 100 - 4 of overscan
    expect(window.padBefore()).toBe(96 * 40);
    // Padding and rendered rows always add up to the full height, whatever the rounding.
    expect(window.padBefore() + (range.end - range.start) * 40 + window.padAfter()).toBe(
      window.totalHeight(),
    );
  });

  it('never renders past either end of the list', () => {
    const { window, scrollTop } = makeWindow({ count: 10, rowHeight: 40, viewportHeight: 200 });

    scrollTop.set(0);
    expect(window.range().start).toBe(0);

    scrollTop.set(100_000); // far past the end; a scroller can report this mid-bounce
    const range = window.range();
    expect(range.end).toBe(10);
    expect(range.start).toBeGreaterThanOrEqual(0);
    expect(window.padAfter()).toBeGreaterThanOrEqual(0);
  });

  /*
   * A row height of zero is what a caller has before it has measured anything, and the arithmetic
   * would make that an empty window — a panel that renders nothing and looks broken. Falling back
   * to the whole list is the pre-window behaviour: slow, and correct. That is the right way round.
   */
  it('degrades to the whole list rather than to nothing when it has no measurement yet', () => {
    const { window, rowHeight, viewportHeight } = makeWindow({ count: 50 });

    rowHeight.set(0);
    expect(window.range()).toEqual({ start: 0, end: 50 });
    expect(window.padBefore()).toBe(0);
    expect(window.padAfter()).toBe(0);

    rowHeight.set(40);
    viewportHeight.set(0);
    expect(window.range()).toEqual({ start: 0, end: 50 });
  });

  it('has an empty window for an empty list', () => {
    const { window } = makeWindow({ count: 0 });
    expect(window.range()).toEqual({ start: 0, end: 0 });
    expect(window.totalHeight()).toBe(0);
  });

  describe('scrollOffsetFor', () => {
    it('returns null when the row is already fully visible', () => {
      const { window } = makeWindow({ count: 100, rowHeight: 40, viewportHeight: 200 });
      expect(window.scrollOffsetFor(0)).toBeNull();
      expect(window.scrollOffsetFor(4)).toBeNull(); // last fully visible row: 160..200
    });

    it('scrolls the minimum distance to bring a row into view', () => {
      const { window, scrollTop } = makeWindow({
        count: 100,
        rowHeight: 40,
        viewportHeight: 200,
      });

      // Below the fold: bring its bottom edge to the viewport's bottom edge.
      expect(window.scrollOffsetFor(5)).toBe(40);

      scrollTop.set(400); // rows 10..15 visible
      // Above the fold: bring its top edge to the viewport's top edge.
      expect(window.scrollOffsetFor(3)).toBe(120);
    });

    it('clamps an index outside the list instead of scrolling nowhere', () => {
      const { window } = makeWindow({ count: 10, rowHeight: 40, viewportHeight: 200 });
      expect(window.scrollOffsetFor(999)).toBe(10 * 40 - 200);
      expect(window.scrollOffsetFor(-5)).toBeNull(); // row 0, already visible
    });

    it('returns null rather than 0 when it cannot know', () => {
      const { window, rowHeight } = makeWindow({ count: 10 });
      rowHeight.set(0);
      expect(window.scrollOffsetFor(5)).toBeNull();
    });
  });

  it('honours a custom overscan', () => {
    const none = makeWindow({ count: 1000, rowHeight: 40, viewportHeight: 200, overscan: 0 });
    const lots = makeWindow({ count: 1000, rowHeight: 40, viewportHeight: 200, overscan: 10 });

    none.scrollTop.set(4000);
    lots.scrollTop.set(4000);

    expect(none.window.range().start).toBe(100);
    expect(lots.window.range().start).toBe(90);
  });
});
