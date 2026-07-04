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
    const maxHeight = Math.max(0, triggerRect.top - gap - viewportPadding);
    const actualHeight = Math.min(panelHeight, maxHeight || panelHeight);
    return {
      direction: resolvedDirection,
      top: Math.max(viewportPadding, triggerRect.top - gap - actualHeight),
      left: triggerRect.left,
      width: triggerRect.width,
      maxHeight,
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
