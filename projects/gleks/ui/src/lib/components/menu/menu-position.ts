import {
  resolveDropdownDirection,
  type GogDropdownDirection,
  type GogDropdownTriggerRect,
} from '../../shared/dropdown-position';
import type { GogWritingDirection } from '../../shared/tooltip-position';

export interface GogMenuSize {
  width: number;
  height: number;
}

export interface GogMenuViewport {
  width: number;
  height: number;
}

export interface GogMenuPlacement {
  direction: 'up' | 'down';
  top: number;
  left: number;
  maxHeight: number;
}

const DEFAULT_GAP = 4;
const DEFAULT_VIEWPORT_PADDING = 8;

/**
 * Where a menu panel goes relative to its trigger.
 *
 * Deliberately *not* `resolveDropdownPlacement`: a dropdown panel is the width of the control it
 * belongs to and lines up with it edge to edge, because it is showing that control's own value
 * space. A menu is a list of commands sized by its longest label, so it only shares one edge with
 * its trigger — the inline start, which is where the eye goes back to — and floats free on the
 * other. The vertical half *is* shared, through `resolveDropdownDirection`, since "flip up when
 * there is no room below" is the same decision for both.
 *
 * `direction` mirrors the alignment: an RTL menu hangs from the trigger's right edge, so it opens
 * back under the trigger rather than away from it. Both are then clamped into the viewport, which
 * is what keeps an icon button in the last table column from opening a menu half off-screen.
 */
export function resolveMenuPlacement(
  triggerRect: GogDropdownTriggerRect & { right: number },
  menuSize: GogMenuSize,
  viewport: GogMenuViewport,
  direction: GogWritingDirection = 'ltr',
  preferred: GogDropdownDirection = 'auto',
  gap = DEFAULT_GAP,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
): GogMenuPlacement {
  const spaceAbove = Math.max(0, triggerRect.top - gap - viewportPadding);
  const spaceBelow = Math.max(0, viewport.height - triggerRect.bottom - gap - viewportPadding);

  /*
   * A menu drops *down* whenever it fits, even with more room above — that is the convention a
   * menu button sets, and flipping a menu that fits would read as a glitch. `resolveDropdownDirection`
   * decides on room alone (right for a listbox, which is showing a value the user is picking
   * inside), so it is asked only for the case a menu genuinely cannot take: no room below.
   */
  const resolvedDirection =
    preferred !== 'auto'
      ? preferred
      : spaceBelow >= menuSize.height
        ? 'down'
        : resolveDropdownDirection(
            'auto',
            triggerRect,
            menuSize.height,
            viewport.height,
            gap,
            viewportPadding,
          );

  const maxHeight =
    resolvedDirection === 'up'
      ? Math.min(menuSize.height, spaceAbove || menuSize.height)
      : spaceBelow;

  const top =
    resolvedDirection === 'up'
      ? Math.max(viewportPadding, triggerRect.top - gap - maxHeight)
      : triggerRect.bottom + gap;

  const alignedLeft = direction === 'rtl' ? triggerRect.right - menuSize.width : triggerRect.left;
  const maxLeft = Math.max(viewportPadding, viewport.width - menuSize.width - viewportPadding);
  const left = Math.min(Math.max(alignedLeft, viewportPadding), maxLeft);

  return { direction: resolvedDirection, top, left, maxHeight };
}
