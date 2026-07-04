import { describe, expect, it } from 'vitest';

import { resolveDropdownDirection, resolveDropdownPlacement } from './dropdown-position';

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
});
