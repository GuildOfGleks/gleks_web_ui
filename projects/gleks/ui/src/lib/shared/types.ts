export type GogSize = 'xsm' | 'sm' | 'md' | 'lg' | 'slg';
export type GogVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
/**
 * The `aria-haspopup` values that make sense on a button, matching the ARIA 1.2 enumeration.
 * `true` is a synonym for `'menu'` in the spec; prefer the specific value, since a screen
 * reader announces it ("has menu", "has dialog").
 */
export type GogAriaHasPopup = boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
/**
 * How a surface paints itself, shared by `gog-card` and `gog-panel` so the two agree:
 * - `'outlined'` — a border, no shadow. The quietest, and right for a grid of many.
 * - `'elevated'` — the shared surface shadow (`--gog-panel-shadow`), no border.
 * - `'filled'` — a tinted background, neither border nor shadow.
 */
export type GogSurfaceVariant = 'outlined' | 'elevated' | 'filled';
/**
 * Which way a component lays its children out. Shared rather than re-declared per component:
 * `gog-radio-group`, `gog-slider`, `gog-divider`, `gog-tabs` and `gog-button-toggle-group` all
 * mean the same thing by it, and `roving-focus.ts` picks its arrow pair from this.
 */
export type GogOrientation = 'horizontal' | 'vertical';
export type GogSpinnerVariant = 'runic' | 'ring' | 'custom';
export type GogTagVariant = 'success' | 'danger' | 'warning' | 'info';
export type GogTagShape = 'rounded' | 'pill';
export type GogSkeletonShape = 'text' | 'circle' | 'rect';
export type GogSkeletonAnimation = 'pulse' | 'wave' | 'none';
export type GogPaginatorRangeMode = 'window' | 'ellipsis';
export type GogSliderOrientation = GogOrientation;
/** A `gog-slider`'s value pair when `range` is on. `start` is always kept ≤ `end`. */
export interface GogSliderRange {
  start: number;
  end: number;
}
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

/** How `gog-divider` paints its rule. */
export type GogDividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Which corner of its host a `gogBadge` sits on. Named by block/inline edge rather than
 * left/right so it follows the writing direction in an RTL layout.
 */
export type GogBadgePosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';

/**
 * - `'determinate'` — the bar reflects `value`.
 * - `'indeterminate'` — work of unknown length; the bar animates and reports no value to
 *   assistive tech, which is what marks it indeterminate.
 * - `'buffer'` — `value` plus a second, lighter `buffer` level ahead of it (streaming/preload).
 */
export type GogProgressbarMode = 'determinate' | 'indeterminate' | 'buffer';

/**
 * `gog-progressbar`'s colour. Wider than `GogTagVariant` by one: progress is usually just
 * "the app is working", which is the accent colour rather than any of the four status hues —
 * so `'accent'` is the default and the status names are the exception.
 */
export type GogProgressbarVariant = 'accent' | 'success' | 'danger' | 'warning' | 'info';

/**
 * - `'joined'` — one segmented control, buttons sharing borders (Material's look).
 * - `'separated'` — discrete buttons with a gap between them.
 */
export type GogButtonToggleAppearance = 'joined' | 'separated';

/** How the tab headers distribute along the tablist. `'stretch'` makes them share the width. */
export type GogTabsAlign = 'start' | 'center' | 'end' | 'stretch';

/** Whether `gog-datepicker` picks one day or a start/end pair. */
export type GogDateSelectionMode = 'single' | 'range';

/** Clock convention for `gog-datepicker`'s time section. */
export type GogHourFormat = '12' | '24';

/** Matches the native CSS `resize` value space, applied to `gog-textarea`'s field. */
export type GogTextareaResize = 'vertical' | 'horizontal' | 'both' | 'none';

/**
 * The `type`s `gog-inputfield` renders as a single-line text-entry field.
 *
 * Deliberately not the whole native list: `checkbox`, `radio`, `range`, `file`, `color`,
 * `submit`, `hidden` and friends are different controls with different markup and different
 * accessibility contracts — the library ships `gog-checkbox`, `gog-radio-group`, `gog-slider`
 * and `gog-button` for those rather than making one component shape-shift.
 */
export type GogInputType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime-local';

/**
 * Mirrors the native `inputmode` attribute — the hint that decides which on-screen keyboard a
 * touch device brings up. Worth setting whenever `type` alone doesn't imply it: a postcode or a
 * card number is `type="text"` (no browser validation wanted) but `inputmode="numeric"`.
 */
export type GogInputMode =
  'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
