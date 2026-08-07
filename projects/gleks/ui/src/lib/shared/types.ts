export type GogSize = 'xsm' | 'sm' | 'md' | 'lg' | 'slg';
export type GogVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type GogSpinnerVariant = 'runic' | 'ring' | 'custom';
export type GogTagVariant = 'success' | 'danger' | 'warning' | 'info';
export type GogTagShape = 'rounded' | 'pill';
export type GogSkeletonShape = 'text' | 'circle' | 'rect';
export type GogSkeletonAnimation = 'pulse' | 'wave' | 'none';
export type GogPaginatorRangeMode = 'window' | 'ellipsis';
export type GogSliderOrientation = 'horizontal' | 'vertical';
export type GogScrollAxis = 'vertical' | 'horizontal' | 'both';
export type GogScrollSize = 'normal' | 'thin';
/**
 * Mirrors the CSS `overscroll-behavior` value space directly:
 * - `'auto'` — scrolling past this instance's edge chains to the next scrollable ancestor
 *   (a page, a dialog body, another gog-scroll), the same as an un-customized native
 *   `overflow: auto` div. The default — matches what most embedded content expects.
 * - `'contain'` — scrolling stops dead at this instance's edge; nothing behind it moves.
 *   Suited to overlay-style panels (a dropdown, a modal) where scrolling past the end
 *   shouldn't also scroll whatever is behind them.
 * - `'none'` — like `'contain'`, and additionally suppresses the platform's own overscroll
 *   affordances (rubber-banding, pull-to-refresh) for this instance.
 */
export type GogScrollOverscrollBehavior = 'auto' | 'contain' | 'none';
/**
 * Which side of the trigger the tooltip bubble renders on. `'auto'` (the default) picks
 * whichever of the four sides has room for the bubble, preferring top, then bottom, then
 * right, then left — see `resolveTooltipPlacement` in `tooltip-position.ts`. An explicit
 * side still flips to its opposite if the requested side has no room but the opposite does.
 */
export type GogTooltipPosition = 'auto' | 'top' | 'bottom' | 'left' | 'right';
/**
 * Where a field's label sits once it "floats" out of its resting position (overlapping the
 * field like a placeholder) on focus or once the field has content. `'none'` (the default)
 * keeps today's static label-above-the-field layout — nothing floats.
 * - `'in'` — floats up but stays fully inside the field's border.
 * - `'on'` — floats up until vertically centered on the top border line.
 * - `'over'` — floats all the way above the field, outside the border.
 */
export type GogFloatLabelVariant = 'none' | 'in' | 'on' | 'over';

/**
 * Which end of a dropdown panel the search box sticks to. Matches `gog-multiselect`'s
 * `controlsPosition` vocabulary — the same idea applied to its select-all row.
 */
export type GogDropdownFilterPosition = 'top' | 'bottom';
