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
