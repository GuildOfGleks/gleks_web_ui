import { describe, expect, it, vi } from 'vitest';

import { handleRovingFocusKeydown, isRovingFocusKey, nextRovingFocusIndex } from './roving-focus';

describe('isRovingFocusKey', () => {
  it('recognizes the four vertical navigation keys by default', () => {
    expect(isRovingFocusKey('ArrowDown')).toBe(true);
    expect(isRovingFocusKey('ArrowUp')).toBe(true);
    expect(isRovingFocusKey('Home')).toBe(true);
    expect(isRovingFocusKey('End')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isRovingFocusKey('Enter')).toBe(false);
    expect(isRovingFocusKey('a')).toBe(false);
  });

  it('takes the horizontal arrows only when the orientation asks for them', () => {
    expect(isRovingFocusKey('ArrowRight', 'horizontal')).toBe(true);
    expect(isRovingFocusKey('ArrowLeft', 'horizontal')).toBe(true);
    expect(isRovingFocusKey('ArrowRight', 'vertical')).toBe(false);
    expect(isRovingFocusKey('ArrowDown', 'horizontal')).toBe(false);
  });

  it('accepts Home/End in either orientation', () => {
    expect(isRovingFocusKey('Home', 'horizontal')).toBe(true);
    expect(isRovingFocusKey('End', 'horizontal')).toBe(true);
  });
});

describe('nextRovingFocusIndex', () => {
  it('wraps ArrowDown past the last index back to 0', () => {
    expect(nextRovingFocusIndex('ArrowDown', 2, 3)).toBe(0);
  });

  it('wraps ArrowUp past the first index to the last', () => {
    expect(nextRovingFocusIndex('ArrowUp', 0, 3)).toBe(2);
  });

  it('advances/retreats by one otherwise', () => {
    expect(nextRovingFocusIndex('ArrowDown', 0, 3)).toBe(1);
    expect(nextRovingFocusIndex('ArrowUp', 1, 3)).toBe(0);
  });

  it('treats ArrowRight/ArrowLeft as the horizontal equivalents', () => {
    expect(nextRovingFocusIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nextRovingFocusIndex('ArrowRight', 2, 3)).toBe(0);
    expect(nextRovingFocusIndex('ArrowLeft', 0, 3)).toBe(2);
  });

  it('Home always resolves to 0, End to the last index', () => {
    expect(nextRovingFocusIndex('Home', 2, 5)).toBe(0);
    expect(nextRovingFocusIndex('End', 0, 5)).toBe(4);
  });

  describe('with disabled items', () => {
    // index 1 and 2 unreachable
    const enabled = (index: number) => index !== 1 && index !== 2;

    it('steps over them rather than landing on one', () => {
      expect(nextRovingFocusIndex('ArrowDown', 0, 4, enabled)).toBe(3);
      expect(nextRovingFocusIndex('ArrowUp', 3, 4, enabled)).toBe(0);
    });

    it('wraps over them too', () => {
      expect(nextRovingFocusIndex('ArrowDown', 3, 4, enabled)).toBe(0);
    });

    it('makes Home/End mean the first/last reachable item', () => {
      const trailingDisabled = (index: number) => index === 0 || index === 1;
      expect(nextRovingFocusIndex('Home', 3, 4, trailingDisabled)).toBe(0);
      expect(nextRovingFocusIndex('End', 0, 4, trailingDisabled)).toBe(1);
    });

    it('stays put when nothing else is reachable', () => {
      const onlyZero = (index: number) => index === 0;
      expect(nextRovingFocusIndex('ArrowDown', 0, 4, onlyZero)).toBe(0);
      expect(nextRovingFocusIndex('End', 0, 4, onlyZero)).toBe(0);
    });

    it('returns the current index when every item is disabled', () => {
      expect(nextRovingFocusIndex('ArrowDown', 2, 4, () => false)).toBe(2);
    });
  });

  it('is a no-op on an empty list', () => {
    expect(nextRovingFocusIndex('ArrowDown', 0, 0)).toBe(0);
  });
});

describe('handleRovingFocusKeydown', () => {
  function makeItems(count: number): HTMLButtonElement[] {
    // jsdom only updates document.activeElement for elements attached to the document.
    return Array.from({ length: count }, () =>
      document.body.appendChild(document.createElement('button')),
    );
  }

  function keydown(key: string, currentTarget: HTMLElement): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key });
    Object.defineProperty(event, 'currentTarget', { value: currentTarget });
    return event;
  }

  it('moves focus to the next item and prevents default', () => {
    const items = makeItems(3);
    const event = keydown('ArrowDown', items[0]);
    const preventDefault = vi.spyOn(event, 'preventDefault');

    const handled = handleRovingFocusKeydown(event, items);

    expect(handled).toBe(true);
    expect(preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(items[1]);
  });

  it('ignores keys outside the roving-focus set', () => {
    const items = makeItems(2);
    const event = keydown('Enter', items[0]);
    const preventDefault = vi.spyOn(event, 'preventDefault');

    expect(handleRovingFocusKeydown(event, items)).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does nothing when the list is empty', () => {
    const event = keydown('ArrowDown', document.createElement('button'));
    expect(handleRovingFocusKeydown(event, [])).toBe(false);
  });

  it('does nothing when currentTarget is not one of the items', () => {
    const items = makeItems(2);
    const outsider = document.createElement('button');
    const event = keydown('ArrowDown', outsider);

    expect(handleRovingFocusKeydown(event, items)).toBe(false);
  });

  it('leaves the vertical arrows alone in a horizontal group', () => {
    const items = makeItems(3);
    items[0].focus();
    const event = keydown('ArrowDown', items[0]);

    expect(handleRovingFocusKeydown(event, items, { orientation: 'horizontal' })).toBe(false);
    expect(document.activeElement).toBe(items[0]);
  });

  it('moves on ArrowRight in a horizontal group', () => {
    const items = makeItems(3);
    const event = keydown('ArrowRight', items[0]);

    expect(handleRovingFocusKeydown(event, items, { orientation: 'horizontal' })).toBe(true);
    expect(document.activeElement).toBe(items[1]);
  });

  it('skips items the isDisabled predicate rejects', () => {
    const items = makeItems(3);
    const event = keydown('ArrowDown', items[0]);

    handleRovingFocusKeydown(event, items, { isDisabled: (_item, index) => index === 1 });

    expect(document.activeElement).toBe(items[2]);
  });

  it('still swallows the key when there is nowhere to move', () => {
    const items = makeItems(1);
    const event = keydown('ArrowDown', items[0]);
    const preventDefault = vi.spyOn(event, 'preventDefault');

    // An open listbox owns its arrows; letting one through would scroll the page underneath.
    expect(handleRovingFocusKeydown(event, items)).toBe(true);
    expect(preventDefault).toHaveBeenCalled();
  });
});
