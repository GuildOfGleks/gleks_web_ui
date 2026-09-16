import { Injectable } from '@angular/core';

/** One completed run's numbers, kept in a page's own history list. */
export interface BenchmarkResult {
  count: number;
  /** Building the data fed to the component under test — the caller's own cost, reported
   *  separately so it's never mistaken for the library's. */
  prepMs: number;
  /** From handing that data to Angular to the next real paint. This is the number that
   *  actually answers "how does the component handle N". */
  renderMs: number;
  totalMs: number;
  /** `container.querySelectorAll('*').length` right after the paint — a rough proxy for how
   *  much DOM the browser now has to keep alive because of this run. */
  domNodes: number;
  /** `performance.memory.usedJSHeapSize` delta, in MB. `null` outside Chromium, where that API
   *  doesn't exist — never fall back to guessing, an absent number is more honest than a wrong
   *  one. */
  heapDeltaMb: number | null;
  timestamp: number;
  /**
   * False if the tab was ever backgrounded during the run. A browser suspends/throttles
   * `requestAnimationFrame` for a hidden tab — sometimes to well under 1fps — so `renderMs`
   * measures how long the *tab itself* took to come back and paint, not how long the
   * component took to render. Real, just not what the number claims to be; the panel flags
   * these rather than presenting them next to genuine readings.
   */
  tabWasVisible: boolean;
}

/**
 * Standard preset ladder every benchmark page offers, from "should be instant" to "the two
 * numbers actually asked about" (500k, 1M). A page can widen or narrow this per component —
 * see each page's own `presets` array.
 */
export const BENCHMARK_PRESETS: readonly number[] = [
  100, 1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000,
];

/** Counts at or above this need the explicit "I understand" confirmation in `BenchmarkPanel` —
 *  below it, a run is assumed cheap enough not to be worth gating. */
export const BENCHMARK_DANGER_THRESHOLD = 50_000;

/**
 * Times a render in two separately-reported phases and reads back what it cost the page.
 *
 * Not framework-instrumented (no `ApplicationRef` hooks, no zone patching) — deliberately: the
 * point is to measure what a consumer actually experiences (the tab freezing, the fan spinning
 * up), not Angular's own internal accounting, and to work the same way regardless of whether
 * the app happens to be zoneless.
 */
@Injectable({ providedIn: 'root' })
export class BenchmarkRunner {
  /**
   * @param count What this run is testing — carried through to the result, not used for timing.
   * @param prepare Builds the data to feed the component. Timed on its own.
   * @param apply Hands that data to Angular (a `signal.set`, typically) — and may also, for a
   *   dropdown-style component, perform the follow-up interaction that actually renders
   *   something (opening the panel). Whatever it does, everything it triggers is included in
   *   `renderMs` up to the next paint.
   * @param containerEl Root of the subtree to count DOM nodes in once the paint lands.
   */
  async run<T>(
    count: number,
    prepare: () => T,
    apply: (data: T) => void,
    containerEl: Element,
  ): Promise<BenchmarkResult> {
    const heapBefore = this.heapUsedMb();

    // See `tabWasVisible`'s doc — a tab that goes to the background mid-run turns `renderMs`
    // into "how long until this tab got a frame again", not a render duration.
    let tabWasVisible = document.visibilityState === 'visible';
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') tabWasVisible = false;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    try {
      const t0 = now();
      const data = prepare();
      const t1 = now();

      apply(data);
      await nextPaint();
      const t2 = now();

      const heapAfter = this.heapUsedMb();

      return {
        count,
        prepMs: round(t1 - t0),
        renderMs: round(t2 - t1),
        totalMs: round(t2 - t0),
        domNodes: containerEl.querySelectorAll('*').length,
        heapDeltaMb:
          heapBefore !== null && heapAfter !== null ? round(heapAfter - heapBefore, 2) : null,
        timestamp: Date.now(),
        tabWasVisible,
      };
    } finally {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  }

  /** Whether `performance.memory` exists on this browser (Chromium only). Pages use this to
   *  decide whether to even show the memory column, rather than rendering a column of `—`. */
  hasMemoryApi(): boolean {
    return this.heapUsedMb() !== null;
  }

  private heapUsedMb(): number | null {
    const mem = (performance as PerformanceWithMemory).memory;
    return mem ? mem.usedJSHeapSize / (1024 * 1024) : null;
  }
}

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}

function now(): number {
  return performance.now();
}

/** Two frames, not one: the first `requestAnimationFrame` fires *before* the browser paints
 *  the current frame, only the callback scheduled from inside it is guaranteed to run after —
 *  the classic "wait for an actual paint" double-rAF. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
