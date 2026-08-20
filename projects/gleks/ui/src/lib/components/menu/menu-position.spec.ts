import { resolveMenuPlacement } from './menu-position';

const viewport = { width: 800, height: 600 };
const menu = { width: 200, height: 120 };

/** A 32px icon button, by default in the middle of the viewport with room everywhere. */
function trigger(overrides: Partial<Record<string, number>> = {}) {
  return {
    top: 300,
    bottom: 332,
    left: 400,
    right: 432,
    width: 32,
    ...overrides,
  };
}

describe('resolveMenuPlacement', () => {
  it('hangs the menu under the trigger, aligned to its inline start', () => {
    const placement = resolveMenuPlacement(trigger(), menu, viewport);

    expect(placement.direction).toBe('down');
    expect(placement.top).toBe(332 + 4);
    expect(placement.left).toBe(400);
  });

  it('flips above the trigger when the space below cannot hold the menu', () => {
    const placement = resolveMenuPlacement(trigger({ top: 520, bottom: 552 }), menu, viewport);

    expect(placement.direction).toBe('up');
    expect(placement.top).toBe(520 - 4 - placement.maxHeight);
  });

  it('honours an explicit direction even where the other side has more room', () => {
    const placement = resolveMenuPlacement(trigger(), menu, viewport, 'ltr', 'up');

    expect(placement.direction).toBe('up');
  });

  it('aligns to the trigger’s right edge in RTL, so it opens back under the trigger', () => {
    const placement = resolveMenuPlacement(trigger(), menu, viewport, 'rtl');

    expect(placement.left).toBe(432 - menu.width);
  });

  it('clamps a menu that would hang off the right edge', () => {
    const placement = resolveMenuPlacement(trigger({ left: 780, right: 796 }), menu, viewport);

    expect(placement.left).toBe(viewport.width - menu.width - 8);
  });

  it('clamps a menu that would hang off the left edge in RTL', () => {
    const placement = resolveMenuPlacement(trigger({ left: 4, right: 36 }), menu, viewport, 'rtl');

    expect(placement.left).toBe(8);
  });

  it('caps the height to the room below, so a long menu scrolls instead of overflowing', () => {
    const tall = { width: 200, height: 900 };
    const placement = resolveMenuPlacement(trigger(), tall, viewport);

    expect(placement.direction).toBe('up');
    expect(placement.maxHeight).toBeLessThanOrEqual(300);
  });

  it('never places the panel above the viewport padding', () => {
    const placement = resolveMenuPlacement(
      trigger({ top: 10, bottom: 42 }),
      { width: 200, height: 900 },
      viewport,
      'ltr',
      'up',
    );

    expect(placement.top).toBeGreaterThanOrEqual(8);
  });
});
