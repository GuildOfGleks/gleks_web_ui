export type GogDropdownDirection = 'auto' | 'up' | 'down';

export interface GogDropdownTriggerRect {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

export interface GogDropdownPlacement {
  direction: 'up' | 'down';
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const DEFAULT_GAP = 8;
const DEFAULT_VIEWPORT_PADDING = 8;

export function resolveDropdownDirection(
  direction: GogDropdownDirection,
  triggerRect: GogDropdownTriggerRect,
  panelHeight: number,
  viewportHeight: number,
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
): 'up' | 'down' {
  if (direction !== 'auto') {
    return direction;
  }

  const spaceAbove = Math.max(0, triggerRect.top - gap - viewportPadding);
  const spaceBelow = Math.max(0, viewportHeight - triggerRect.bottom - gap - viewportPadding);

  if (spaceBelow >= panelHeight && spaceAbove < panelHeight) {
    return 'down';
  }

  if (spaceAbove >= panelHeight && spaceBelow < panelHeight) {
    return 'up';
  }

  return spaceBelow >= spaceAbove ? 'down' : 'up';
}

export function resolveDropdownPlacement(
  direction: GogDropdownDirection,
  triggerRect: GogDropdownTriggerRect,
  panelHeight: number,
  viewportHeight: number,
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
): GogDropdownPlacement {
  const resolvedDirection = resolveDropdownDirection(direction, triggerRect, panelHeight, viewportHeight, gap, viewportPadding);

  if (resolvedDirection === 'up') {
    const availableSpace = Math.max(0, triggerRect.top - gap - viewportPadding);
    const actualHeight = Math.min(panelHeight, availableSpace || panelHeight);
    return {
      direction: resolvedDirection,
      top: Math.max(viewportPadding, triggerRect.top - gap - actualHeight),
      left: triggerRect.left,
      width: triggerRect.width,
      // Must match actualHeight, not availableSpace: `top` above was computed assuming
      // the panel is actualHeight tall, so this is what goes into the panel's CSS
      // max-height too. Returning the full availableSpace here let real content taller
      // than actualHeight (but still under availableSpace) render past its computed
      // top and cover the trigger it's supposed to sit above.
      maxHeight: actualHeight,
    };
  }

  const maxHeight = Math.max(0, viewportHeight - triggerRect.bottom - gap - viewportPadding);
  return {
    direction: resolvedDirection,
    top: triggerRect.bottom + gap,
    left: triggerRect.left,
    width: triggerRect.width,
    maxHeight,
  };
}

/**
 * Resolves a CSS length to pixels for the placement math. Only `px`, `%` and `vh` can be
 * resolved without laying out the DOM — `%` and `vh` are taken relative to the viewport
 * height, which is exactly what a `position: fixed` panel's height resolves against in CSS.
 * Any other unit (`rem`, `em`, `auto`, a bare number, …) returns null: the caller falls back
 * to its own estimate for the up/down decision, while the original string is still written
 * to the panel's `style.max-height` as-is — only the direction heuristic loses precision.
 */
export function resolveCssLengthPx(value: string, viewportHeight: number): number | null {
  const match = /^(-?[\d.]+)(px|%|vh)$/.exec(value.trim());
  if (!match) return null;

  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount)) return null;

  return match[2] === 'px' ? amount : (amount / 100) * viewportHeight;
}
