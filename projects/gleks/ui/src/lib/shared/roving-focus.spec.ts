import { describe, expect, it, vi } from 'vitest';

import { handleRovingFocusKeydown, isRovingFocusKey, nextRovingFocusIndex } from './roving-focus';

describe('isRovingFocusKey', () => {
  it('recognizes the four navigation keys', () => {
    expect(isRovingFocusKey('ArrowDown')).toBe(true);
    expect(isRovingFocusKey('ArrowUp')).toBe(true);
    expect(isRovingFocusKey('Home')).toBe(true);
    expect(isRovingFocusKey('End')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isRovingFocusKey('Enter')).toBe(false);
    expect(isRovingFocusKey('a')).toBe(false);
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

  it('Home always resolves to 0, End to the last index', () => {
    expect(nextRovingFocusIndex('Home', 2, 5)).toBe(0);
    expect(nextRovingFocusIndex('End', 0, 5)).toBe(4);
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
});
