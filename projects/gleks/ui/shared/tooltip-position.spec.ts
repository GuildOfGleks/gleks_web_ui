import { describe, expect, it } from 'vitest';

import { resolveTooltipPlacement, resolveTooltipSide } from './tooltip-position';

const viewport = { width: 800, height: 600 };
const bubble = { width: 100, height: 30 };

describe('resolveTooltipSide', () => {
  it('prefers top when there is room', () => {
    const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
    expect(resolveTooltipSide('auto', target, bubble, viewport)).toBe('top');
  });

  it('falls back to bottom when there is no room above', () => {
    const target = { top: 4, bottom: 24, left: 350, right: 400, width: 50, height: 20 };
    expect(resolveTooltipSide('auto', target, bubble, viewport)).toBe('bottom');
  });

  it('falls back to right, then left, when neither top nor bottom fit', () => {
    const target = { top: 4, bottom: 596, left: 350, right: 400, width: 50, height: 592 };
    expect(resolveTooltipSide('auto', target, bubble, viewport)).toBe('right');
  });

  it('picks the side with the most room when nothing fully fits', () => {
    // Nothing fits (top/bottom/left all have only 4px), but the right side has 100px —
    // still short of the 116px the bubble needs, so it wins on "most room" rather than
    // a genuine fit.
    const target = { top: 4, bottom: 596, left: 4, right: 700, width: 696, height: 592 };
    expect(resolveTooltipSide('auto', target, bubble, viewport)).toBe('right');
  });

  describe('in RTL', () => {
    // Only the horizontal half of the `auto` preference mirrors; top-first is a convention,
    // not a direction, and an explicit side is a physical request the caller made on purpose.
    it('prefers left over right when neither top nor bottom fit', () => {
      const target = { top: 4, bottom: 596, left: 350, right: 400, width: 50, height: 592 };
      expect(resolveTooltipSide('auto', target, bubble, viewport, 8, 8, 'rtl')).toBe('left');
      expect(resolveTooltipSide('auto', target, bubble, viewport, 8, 8, 'ltr')).toBe('right');
    });

    it('still prefers top when there is room', () => {
      const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
      expect(resolveTooltipSide('auto', target, bubble, viewport, 8, 8, 'rtl')).toBe('top');
    });

    it('does not mirror an explicit side', () => {
      const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
      expect(resolveTooltipSide('right', target, bubble, viewport, 8, 8, 'rtl')).toBe('right');
      expect(resolveTooltipSide('left', target, bubble, viewport, 8, 8, 'rtl')).toBe('left');
    });

    it('falls back to the roomiest side, mirrored, when nothing fits', () => {
      // Mirror of the LTR "most room" case: the left side has the space here.
      const target = { top: 4, bottom: 596, left: 700, right: 796, width: 96, height: 592 };
      expect(resolveTooltipSide('auto', target, bubble, viewport, 8, 8, 'rtl')).toBe('left');
    });

    it('places the bubble on the resolved side', () => {
      const target = { top: 4, bottom: 596, left: 350, right: 400, width: 50, height: 592 };
      const placement = resolveTooltipPlacement('auto', target, bubble, viewport, 8, 8, 'rtl');

      expect(placement.side).toBe('left');
      expect(placement.left).toBe(350 - 8 - bubble.width);
    });
  });

  it('honours an explicit side when it fits', () => {
    const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
    expect(resolveTooltipSide('bottom', target, bubble, viewport)).toBe('bottom');
  });

  it('flips an explicit side to its opposite when it has no room but the opposite does', () => {
    const target = { top: 4, bottom: 24, left: 350, right: 400, width: 50, height: 20 };
    expect(resolveTooltipSide('top', target, bubble, viewport)).toBe('bottom');
  });

  it('keeps the explicit side when neither it nor its opposite fit', () => {
    const target = { top: 4, bottom: 596, left: 350, right: 400, width: 50, height: 592 };
    expect(resolveTooltipSide('top', target, bubble, viewport)).toBe('top');
  });
});

describe('resolveTooltipPlacement', () => {
  it('centers the bubble above the target for the top side', () => {
    const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
    const placement = resolveTooltipPlacement('top', target, bubble, viewport, 8, 8);

    expect(placement.side).toBe('top');
    expect(placement.top).toBe(300 - 8 - bubble.height);
    expect(placement.left).toBe(350 + 25 - bubble.width / 2);
  });

  it('places the bubble below the target for the bottom side', () => {
    const target = { top: 300, bottom: 320, left: 350, right: 400, width: 50, height: 20 };
    const placement = resolveTooltipPlacement('bottom', target, bubble, viewport, 8, 8);

    expect(placement.side).toBe('bottom');
    expect(placement.top).toBe(320 + 8);
  });

  it('clamps left so the bubble never renders past the viewport edge', () => {
    const target = { top: 300, bottom: 320, left: 2, right: 12, width: 10, height: 20 };
    const placement = resolveTooltipPlacement('top', target, bubble, viewport, 8, 8);

    expect(placement.left).toBeGreaterThanOrEqual(8);
  });

  it('clamps top so the bubble never renders past the viewport edge', () => {
    const target = { top: -5, bottom: 25, left: 350, right: 400, width: 50, height: 30 };
    const placement = resolveTooltipPlacement('right', target, bubble, viewport, 8, 8);

    expect(placement.top).toBeGreaterThanOrEqual(8);
    expect(placement.top + bubble.height).toBeLessThanOrEqual(viewport.height - 8);
  });
});
