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
  /** Viewport offset for a menu that drops down. `null` for one that flips up. */
  top: number | null;
  /** Viewport offset for a menu that flips up. `null` for one that drops down. */
  bottom: number | null;
  left: number;
  /**
   * How much room there is on the panel's own side of the trigger — **not** the height it will
   * take. The panel takes `min(availableHeight, --gog-menu-max-height, its content)`, resolved
   * in CSS, which is why only one edge is anchored here: an up-menu is pinned by its `bottom`,
   * so it grows towards the viewport edge and stays welded to the trigger whatever height it
   * settles on.
   */
  availableHeight: number;
}

const DEFAULT_GAP = 4;
const DEFAULT_VIEWPORT_PADDING = 8;

/**
 * Floor for `availableHeight`, so a forced `direction="up"` on a trigger already at the top of
 * the viewport still shows a scrollable panel rather than a zero-height one. Roughly two items
 * plus the panel's padding — enough to read and to arrow through.
 */
const MIN_AVAILABLE_HEIGHT = 88;

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
 *
 * **This function does not decide the panel's height, only the room available for one.** It used
 * to write that room onto the panel as an inline `max-height`, which beat the stylesheet rule
 * `--gog-menu-max-height` feeds and made the token inert — a consumer could set it to `150px` on
 * a page with 500px of room and nothing happened. Anchoring an up-menu by its `bottom` is what
 * lets the cap move into CSS: with a `top` computed from a height the panel then does not take,
 * a token-capped panel would float away from its trigger by the difference.
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

  const availableHeight = Math.max(
    resolvedDirection === 'up' ? spaceAbove : spaceBelow,
    MIN_AVAILABLE_HEIGHT,
  );

  /*
   * One edge each, never both: a `position: fixed` element given both `top` and `bottom` is
   * stretched between them, which would override the height CSS just worked out.
   */
  const top = resolvedDirection === 'up' ? null : triggerRect.bottom + gap;
  const bottom =
    resolvedDirection === 'up'
      ? Math.max(viewportPadding, viewport.height - triggerRect.top + gap)
      : null;

  const alignedLeft = direction === 'rtl' ? triggerRect.right - menuSize.width : triggerRect.left;
  const maxLeft = Math.max(viewportPadding, viewport.width - menuSize.width - viewportPadding);
  const left = Math.min(Math.max(alignedLeft, viewportPadding), maxLeft);

  return { direction: resolvedDirection, top, bottom, left, availableHeight };
}
