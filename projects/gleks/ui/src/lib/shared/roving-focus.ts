import { GogOrientation } from './types';

const VERTICAL_ARROWS = ['ArrowDown', 'ArrowUp'] as const;
const HORIZONTAL_ARROWS = ['ArrowRight', 'ArrowLeft'] as const;
const EDGE_KEYS = ['Home', 'End'] as const;

export type RovingFocusKey =
  | (typeof VERTICAL_ARROWS)[number]
  | (typeof HORIZONTAL_ARROWS)[number]
  | (typeof EDGE_KEYS)[number];

/** Which arrow pair drives a given orientation. `Home`/`End` apply to both. */
function arrowsFor(orientation: GogOrientation): readonly string[] {
  return orientation === 'horizontal' ? HORIZONTAL_ARROWS : VERTICAL_ARROWS;
}

/**
 * Whether `key` navigates a roving-tabindex list laid out along `orientation`.
 *
 * The orientation filter is the point: a horizontal tablist must leave `ArrowDown` alone so
 * the page still scrolls, and a vertical listbox must not steal `ArrowRight` from a caret
 * inside a text field. `Home`/`End` are accepted for both.
 */
export function isRovingFocusKey(
  key: string,
  orientation: GogOrientation = 'vertical',
): key is RovingFocusKey {
  return arrowsFor(orientation).includes(key) || (EDGE_KEYS as readonly string[]).includes(key);
}

/** Whether `key` moves backwards (up / left) rather than forwards. */
function isBackwards(key: RovingFocusKey): boolean {
  return key === 'ArrowUp' || key === 'ArrowLeft';
}

/**
 * The index `key` moves to from `currentIndex`, wrapping at both ends.
 *
 * `isEnabled` lets a caller keep disabled items in the list — which it must, since they still
 * occupy a position in the DOM — while navigation steps over them. Without it every index is a
 * target, which is the behaviour the dropdowns rely on (they pre-filter their own list).
 * Returns `currentIndex` when nothing else is reachable, so a group of one enabled item cannot
 * spin.
 */
export function nextRovingFocusIndex(
  key: RovingFocusKey,
  currentIndex: number,
  count: number,
  isEnabled?: (index: number) => boolean,
): number {
  if (count === 0) return currentIndex;

  const enabled = isEnabled ?? (() => true);
  const lastIndex = count - 1;

  // Home/End mean the first/last *reachable* item, not the first/last element.
  if (key === 'Home' || key === 'End') {
    const order =
      key === 'Home'
        ? Array.from({ length: count }, (_, i) => i)
        : Array.from({ length: count }, (_, i) => lastIndex - i);
    return order.find(enabled) ?? currentIndex;
  }

  const step = isBackwards(key) ? -1 : 1;
  // At most `count` hops: enough to come back round to where we started, never more.
  for (let hop = 1; hop <= count; hop++) {
    const candidate = (currentIndex + step * hop + count * hop) % count;
    if (enabled(candidate)) return candidate;
  }

  return currentIndex;
}

/**
 * Arrow/Home/End navigation across a roving-tabindex-style list of focusable elements.
 * `event.currentTarget` must be one of `items`. Returns false (and leaves the event
 * untouched) for any other key, or when `items` doesn't contain the current target,
 * so callers can safely invoke this unconditionally from a keydown handler.
 *
 * Defaults to a vertical list with every item reachable — the shape the option lists and the
 * accordion were written against — so existing callers need no options object.
 */
export function handleRovingFocusKeydown(
  event: KeyboardEvent,
  items: readonly HTMLElement[],
  options: {
    orientation?: GogOrientation;
    /** Items this returns true for are skipped rather than focused. */
    isDisabled?: (item: HTMLElement, index: number) => boolean;
  } = {},
): boolean {
  const orientation = options.orientation ?? 'vertical';
  if (!isRovingFocusKey(event.key, orientation) || items.length === 0) {
    return false;
  }

  const current = event.currentTarget as HTMLElement;
  const index = items.indexOf(current);
  if (index === -1) {
    return false;
  }

  const { isDisabled } = options;
  const isEnabled = isDisabled
    ? (candidate: number) => !isDisabled(items[candidate], candidate)
    : undefined;

  // Swallowed even when there is nowhere else to go: an open listbox or a focused tablist owns
  // its arrow keys, and letting one through would scroll the page out from under the widget.
  event.preventDefault();

  const nextIndex = nextRovingFocusIndex(event.key, index, items.length, isEnabled);
  if (nextIndex !== index) {
    items[nextIndex]?.focus();
  }
  return true;
}
