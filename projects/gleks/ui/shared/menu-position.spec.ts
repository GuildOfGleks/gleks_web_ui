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
    expect(placement.bottom).toBeNull();
    expect(placement.left).toBe(400);
  });

  it('flips above the trigger when the space below cannot hold the menu', () => {
    const placement = resolveMenuPlacement(trigger({ top: 520, bottom: 552 }), menu, viewport);

    expect(placement.direction).toBe('up');
    expect(placement.top).toBeNull();
    // Anchored by its bottom edge, one gap above the trigger's top: 600 - 520 + 4.
    expect(placement.bottom).toBe(84);
  });

  /*
   * The regression this shape exists for. An up-menu used to be positioned by a `top` derived
   * from the height it was assumed to take; a panel capped shorter by `--gog-menu-max-height`
   * then floated away from its trigger by the difference. A `bottom` anchor cannot drift,
   * because it does not depend on the height at all.
   */
  it('anchors an up-menu to the trigger regardless of the height it settles on', () => {
    const short = resolveMenuPlacement(trigger({ top: 520, bottom: 552 }), menu, viewport);
    const tall = resolveMenuPlacement(
      trigger({ top: 520, bottom: 552 }),
      { width: 200, height: 5000 },
      viewport,
    );

    expect(short.bottom).toBe(tall.bottom);
  });

  it('never reports a zero-height panel for a direction forced against the viewport edge', () => {
    const placement = resolveMenuPlacement(
      trigger({ top: 6, bottom: 38 }),
      menu,
      viewport,
      'ltr',
      'up',
    );

    expect(placement.availableHeight).toBeGreaterThan(0);
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

  it('reports only the room available, so a long menu scrolls instead of overflowing', () => {
    const tall = { width: 200, height: 900 };
    const placement = resolveMenuPlacement(trigger(), tall, viewport);

    expect(placement.direction).toBe('up');
    // The room above a trigger at y=300, less the gap and the viewport padding.
    expect(placement.availableHeight).toBe(300 - 4 - 8);
  });

  it('leaves the viewport padding below an up-menu that reaches the bottom of the screen', () => {
    const placement = resolveMenuPlacement(
      trigger({ top: 598, bottom: 630 }),
      { width: 200, height: 900 },
      viewport,
      'ltr',
      'up',
    );

    expect(placement.bottom).toBeGreaterThanOrEqual(8);
  });
});
