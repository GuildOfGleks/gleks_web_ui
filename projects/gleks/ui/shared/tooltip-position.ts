import { GogTooltipPosition } from './types';

export type GogTooltipSide = 'top' | 'bottom' | 'left' | 'right';

/** Writing direction of the element a placement is resolved against. */
export type GogWritingDirection = 'ltr' | 'rtl';

export interface GogTooltipTargetRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface GogTooltipSize {
  width: number;
  height: number;
}

export interface GogTooltipViewport {
  width: number;
  height: number;
}

export interface GogTooltipPlacement {
  side: GogTooltipSide;
  top: number;
  left: number;
}

const DEFAULT_GAP = 8;
const DEFAULT_VIEWPORT_PADDING = 8;

function spaceFor(
  side: GogTooltipSide,
  target: GogTooltipTargetRect,
  viewport: GogTooltipViewport,
): number {
  switch (side) {
    case 'top':
      return target.top;
    case 'bottom':
      return viewport.height - target.bottom;
    case 'left':
      return target.left;
    case 'right':
      return viewport.width - target.right;
  }
}

function fits(
  side: GogTooltipSide,
  target: GogTooltipTargetRect,
  bubble: GogTooltipSize,
  viewport: GogTooltipViewport,
  gap: number,
  viewportPadding: number,
): boolean {
  const needed =
    (side === 'top' || side === 'bottom' ? bubble.height : bubble.width) + gap + viewportPadding;
  return spaceFor(side, target, viewport) >= needed;
}

const OPPOSITE: Record<GogTooltipSide, GogTooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * Picks which side the bubble renders on. `'auto'` tries top, bottom, then the two horizontal
 * sides — top-first matches the conventional tooltip default — and falls back to whichever
 * side has the most room if the bubble doesn't fully fit anywhere. An explicit side flips to
 * its opposite when it has no room but the opposite does, same as `resolveDropdownDirection`
 * does for up/down; unlike that helper, a request for a specific side is honoured as-is
 * (no flip) whenever it fits, since the caller asked for that side deliberately.
 *
 * **`direction` mirrors the horizontal preference only.** In RTL, `'auto'` prefers the left
 * side where LTR prefers the right, so a tooltip opens away from the text it belongs to in the
 * same way in both. An explicit `'left'`/`'right'` is *not* mirrored: those are physical words
 * in a physical API, and a consumer who wrote `position="right"` meant the right of the screen.
 * `'start'`/`'end'` would be the logical spelling, and there is deliberately no such value —
 * `'auto'` already does the right thing for a direction-aware layout.
 */
export function resolveTooltipSide(
  position: GogTooltipPosition,
  target: GogTooltipTargetRect,
  bubble: GogTooltipSize,
  viewport: GogTooltipViewport,
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
  direction: GogWritingDirection = 'ltr',
): GogTooltipSide {
  if (position !== 'auto') {
    if (fits(position, target, bubble, viewport, gap, viewportPadding)) return position;
    const opposite = OPPOSITE[position];
    return fits(opposite, target, bubble, viewport, gap, viewportPadding) ? opposite : position;
  }

  const preferenceOrder: GogTooltipSide[] =
    direction === 'rtl' ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom', 'right', 'left'];
  const fitting = preferenceOrder.find((side) =>
    fits(side, target, bubble, viewport, gap, viewportPadding),
  );
  if (fitting) return fitting;

  return preferenceOrder.reduce((best, side) =>
    spaceFor(side, target, viewport) > spaceFor(best, target, viewport) ? side : best,
  );
}

/**
 * Resolves the bubble's side and its `position: fixed` top/left, centered on the target's
 * midpoint along the cross axis and clamped so it never renders past the viewport edge —
 * the centering can push it there for a target near a corner.
 */
export function resolveTooltipPlacement(
  position: GogTooltipPosition,
  target: GogTooltipTargetRect,
  bubble: GogTooltipSize,
  viewport: GogTooltipViewport,
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
  direction: GogWritingDirection = 'ltr',
): GogTooltipPlacement {
  const side = resolveTooltipSide(
    position,
    target,
    bubble,
    viewport,
    gap,
    viewportPadding,
    direction,
  );

  const centerX = target.left + target.width / 2;
  const centerY = target.top + target.height / 2;

  let top: number;
  let left: number;

  switch (side) {
    case 'top':
      top = target.top - gap - bubble.height;
      left = centerX - bubble.width / 2;
      break;
    case 'bottom':
      top = target.bottom + gap;
      left = centerX - bubble.width / 2;
      break;
    case 'left':
      top = centerY - bubble.height / 2;
      left = target.left - gap - bubble.width;
      break;
    case 'right':
      top = centerY - bubble.height / 2;
      left = target.right + gap;
      break;
  }

  const maxLeft = Math.max(viewportPadding, viewport.width - bubble.width - viewportPadding);
  const maxTop = Math.max(viewportPadding, viewport.height - bubble.height - viewportPadding);
  left = Math.min(Math.max(left, viewportPadding), maxLeft);
  top = Math.min(Math.max(top, viewportPadding), maxTop);

  return { side, top, left };
}
