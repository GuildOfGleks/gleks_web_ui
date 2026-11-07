import { signal } from '@angular/core';

import { GogVariableWindow } from './variable-window';

/** A window over `count` rows estimated at `estimatedRowHeight`, in a `viewportHeight` scroller. */
function makeWindow(options: {
  count?: number;
  estimatedRowHeight?: number;
  viewportHeight?: number;
  scrollTop?: number;
  overscan?: number;
}) {
  const count = signal(options.count ?? 1000);
  const estimatedRowHeight = signal(options.estimatedRowHeight ?? 40);
  const viewportHeight = signal(options.viewportHeight ?? 260);
  const scrollTop = signal(options.scrollTop ?? 0);
  const window = new GogVariableWindow({
    count,
    estimatedRowHeight,
    viewportHeight,
    scrollTop,
    overscan: options.overscan,
  });
  return { window, count, estimatedRowHeight, viewportHeight, scrollTop };
}

describe('GogVariableWindow', () => {
  it('renders a window whose size does not grow with the list', () => {
    const small = makeWindow({ count: 100 });
    const huge = makeWindow({ count: 1_000_000 });

    const size = (w: GogVariableWindow) => w.range().end - w.range().start;

    expect(size(small.window)).toBe(size(huge.window));
    expect(size(huge.window)).toBeLessThan(20);
  });

  it('behaves exactly like a fixed window while every row is still an estimate', () => {
    const { window } = makeWindow({ count: 1000, estimatedRowHeight: 40, scrollTop: 4000 });

    // Row 100 starts at 4000, and the 260px viewport ends inside row 106.
    expect(window.range()).toEqual({ start: 96, end: 111 });
    expect(window.totalHeight()).toBe(40_000);
    expect(window.padBefore()).toBe(96 * 40);
    expect(window.padAfter()).toBe(40_000 - 111 * 40);
  });

  /*
   * The reason this class exists: a table row's height cannot be pinned, because `height` on a
   * `<tr>` or `<td>` is a minimum in table layout. One cell taken from 40 to 600 characters
   * measured 39px -> 173.75px with its column width unchanged.
   */
  it('places rows by their own heights once they have been measured', () => {
    const { window } = makeWindow({ count: 10, estimatedRowHeight: 40, viewportHeight: 100 });

    window.applyMeasurements(new Map([[0, 174]]));

    expect(window.totalHeight()).toBe(174 + 9 * 40);
    // Row 1 starts at 174 now rather than at 40, and a 174px row fills the whole 100px viewport
    // on its own — so reaching row 1 is a scroll, which it would not have been at the estimate.
    expect(window.scrollOffsetFor(1)).toBe(214 - 100);
    window.applyMeasurements(new Map([[1, 174]]));
    expect(window.totalHeight()).toBe(2 * 174 + 8 * 40);
  });

  it('ignores a zero or negative measurement rather than collapsing the list', () => {
    const { window } = makeWindow({ count: 10, estimatedRowHeight: 40 });

    const delta = window.applyMeasurements(
      new Map([
        [0, 0],
        [1, -5],
        [2, Number.NaN],
      ]),
    );

    expect(delta).toBe(0);
    expect(window.totalHeight()).toBe(400);
  });

  it('degrades to the whole list rather than to an empty one', () => {
    const noEstimate = makeWindow({ count: 500, estimatedRowHeight: 0 });
    const noViewport = makeWindow({ count: 500, viewportHeight: 0 });

    expect(noEstimate.window.range()).toEqual({ start: 0, end: 500 });
    expect(noViewport.window.range()).toEqual({ start: 0, end: 500 });
  });

  it('reports nothing for an empty list', () => {
    const { window } = makeWindow({ count: 0 });

    expect(window.range()).toEqual({ start: 0, end: 0 });
    expect(window.totalHeight()).toBe(0);
    expect(window.padBefore()).toBe(0);
    expect(window.padAfter()).toBe(0);
    expect(window.scrollOffsetFor(3)).toBeNull();
  });

  describe('the correction delta', () => {
    /*
     * The whole difficulty of a variable window, and the part the arithmetic does not make
     * obvious. Correcting a row *above* the viewport moves every row after it — including the ones
     * the reader is looking at. The caller adds this delta to `scrollTop` in the same frame, which
     * holds the visible rows still.
     */
    it('reports how far the content above the viewport moved', () => {
      const { window } = makeWindow({
        count: 1000,
        estimatedRowHeight: 40,
        viewportHeight: 200,
        scrollTop: 4000,
      });

      // Rows 0..9 turn out to be 60px rather than 40 — 20px each, all of them above the viewport.
      const measurements = new Map<number, number>();
      for (let i = 0; i < 10; i++) measurements.set(i, 60);

      expect(window.applyMeasurements(measurements)).toBe(200);
    });

    it('reports nothing for a correction at or below the viewport', () => {
      const { window } = makeWindow({
        count: 1000,
        estimatedRowHeight: 40,
        viewportHeight: 200,
        scrollTop: 4000,
      });

      // Row 100 is the first visible one; 100 and 140 are it and one below it.
      expect(
        window.applyMeasurements(
          new Map([
            [100, 90],
            [140, 90],
          ]),
        ),
      ).toBe(0);
    });

    it('reports nothing when a measurement agrees with what it already had', () => {
      const { window } = makeWindow({ count: 100, estimatedRowHeight: 40, scrollTop: 2000 });

      expect(
        window.applyMeasurements(
          new Map([
            [0, 40],
            [1, 40.3],
          ]),
        ),
      ).toBe(0);
    });

    /*
     * The delta is what keeps the *rendered* rows still, which is the assertion worth making:
     * after correcting the rows above and scrolling by the delta, the window shows the same first
     * row it did before.
     */
    it('holds the rendered slice still when the caller applies it', () => {
      const { window, scrollTop } = makeWindow({
        count: 1000,
        estimatedRowHeight: 40,
        viewportHeight: 200,
        scrollTop: 4000,
      });
      const before = window.range().start;

      const measurements = new Map<number, number>();
      for (let i = 0; i < 100; i++) measurements.set(i, 50);
      const delta = window.applyMeasurements(measurements);
      scrollTop.set(4000 + delta);

      expect(delta).toBe(1000);
      expect(window.range().start).toBe(before);
    });
  });

  it('clamps a scroll position past the end of the list', () => {
    const { window, count } = makeWindow({
      count: 1000,
      estimatedRowHeight: 40,
      scrollTop: 39_000,
    });

    count.set(3);

    expect(window.range()).toEqual({ start: 0, end: 3 });
    expect(window.padBefore()).toBe(0);
  });

  it('forgets its measurements on reset, for when the rows stop being the same rows', () => {
    const { window } = makeWindow({ count: 10, estimatedRowHeight: 40 });
    window.applyMeasurements(new Map([[0, 174]]));
    expect(window.totalHeight()).toBe(174 + 9 * 40);

    window.reset();

    expect(window.totalHeight()).toBe(400);
  });

  describe('scrollOffsetFor', () => {
    it('returns null when the row is already fully visible', () => {
      const { window } = makeWindow({ count: 100, estimatedRowHeight: 40, viewportHeight: 200 });

      expect(window.scrollOffsetFor(0)).toBeNull();
      expect(window.scrollOffsetFor(4)).toBeNull();
    });

    it('scrolls to a row above, and to the bottom edge of one below', () => {
      const { window } = makeWindow({
        count: 100,
        estimatedRowHeight: 40,
        viewportHeight: 200,
        scrollTop: 400,
      });

      expect(window.scrollOffsetFor(3)).toBe(120);
      expect(window.scrollOffsetFor(20)).toBe(840 - 200);
    });

    it('honours a measured height rather than the estimate', () => {
      const { window } = makeWindow({ count: 100, estimatedRowHeight: 40, viewportHeight: 200 });
      window.applyMeasurements(new Map([[0, 200]]));

      // Row 1 now starts at 200 and ends at 240, past the viewport's 200.
      expect(window.scrollOffsetFor(1)).toBe(40);
    });
  });
});
