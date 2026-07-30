const ROVING_FOCUS_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'] as const;

export type RovingFocusKey = (typeof ROVING_FOCUS_KEYS)[number];

export function isRovingFocusKey(key: string): key is RovingFocusKey {
  return (ROVING_FOCUS_KEYS as readonly string[]).includes(key);
}

export function nextRovingFocusIndex(key: RovingFocusKey, currentIndex: number, count: number): number {
  const lastIndex = count - 1;
  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return lastIndex;
    case 'ArrowDown':
      return (currentIndex + 1) % count;
    case 'ArrowUp':
      return (currentIndex - 1 + count) % count;
  }
}

/**
 * Arrow/Home/End navigation across a roving-tabindex-style list of focusable elements.
 * `event.currentTarget` must be one of `items`. Returns false (and leaves the event
 * untouched) for any other key, or when `items` doesn't contain the current target,
 * so callers can safely invoke this unconditionally from a keydown handler.
 */
export function handleRovingFocusKeydown(event: KeyboardEvent, items: readonly HTMLElement[]): boolean {
  if (!isRovingFocusKey(event.key) || items.length === 0) {
    return false;
  }

  const current = event.currentTarget as HTMLElement;
  const index = items.indexOf(current);
  if (index === -1) {
    return false;
  }

  event.preventDefault();
  const nextIndex = nextRovingFocusIndex(event.key, index, items.length);
  items[nextIndex]?.focus();
  return true;
}
