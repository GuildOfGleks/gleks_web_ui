import { describe, expect, it } from 'vitest';

import {
  resolveCssLengthPx,
  resolveDropdownDirection,
  resolveDropdownPlacement,
} from './dropdown-position';

describe('dropdown-position', () => {
  it('prefers down when there is enough space below', () => {
    expect(
      resolveDropdownDirection(
        'auto',
        { top: 100, bottom: 140, left: 20, width: 200 },
        120,
        600,
        2,
        8,
      ),
    ).toBe('down');
  });

  it('prefers up when there is more space above', () => {
    expect(
      resolveDropdownDirection(
        'auto',
        { top: 420, bottom: 460, left: 20, width: 200 },
        180,
        500,
        2,
        8,
      ),
    ).toBe('up');
  });

  it('resolves fixed placement upward when requested', () => {
    const placement = resolveDropdownPlacement(
      'up',
      { top: 420, bottom: 460, left: 20, width: 200 },
      180,
      500,
      2,
      8,
    );

    expect(placement.direction).toBe('up');
    expect(placement.top).toBeLessThan(420);
    expect(placement.maxHeight).toBeGreaterThan(0);
  });

  // Regression: `maxHeight` used to be the raw space above the trigger rather than the
  // height `top` was actually computed from. Real content taller than the estimate (but
  // still under that raw space) could then render past `top` and cover the trigger.
  it('caps maxHeight to the height top was computed from, so the panel never grows past the trigger', () => {
    const gap = 2;
    const placement = resolveDropdownPlacement(
      'up',
      { top: 420, bottom: 460, left: 20, width: 200 },
      180,
      500,
      gap,
      8,
    );

    expect(placement.top + placement.maxHeight).toBe(420 - gap);
  });
});

describe('resolveCssLengthPx', () => {
  it('resolves px lengths as-is', () => {
    expect(resolveCssLengthPx('320px', 800)).toBe(320);
  });

  it('resolves % and vh relative to the viewport height', () => {
    expect(resolveCssLengthPx('20%', 800)).toBe(160);
    expect(resolveCssLengthPx('20vh', 800)).toBe(160);
  });

  it('returns null for units it cannot resolve without layout', () => {
    expect(resolveCssLengthPx('20rem', 800)).toBeNull();
    expect(resolveCssLengthPx('auto', 800)).toBeNull();
    expect(resolveCssLengthPx('', 800)).toBeNull();
  });
});
