/*
 * Public API Surface of ui
 */

export * from '@guildofgleks/ui/button';
export * from '@guildofgleks/ui/accordion';
export * from '@guildofgleks/ui/alert';
export * from '@guildofgleks/ui/avatar';
export * from '@guildofgleks/ui/breadcrumbs';
export * from '@guildofgleks/ui/stepper';
export * from '@guildofgleks/ui/file-upload';
export * from '@guildofgleks/ui/rating';
export * from '@guildofgleks/ui/empty-state';
export * from '@guildofgleks/ui/collapsible';
export * from '@guildofgleks/ui/autocomplete';
export * from '@guildofgleks/ui/badge';
export * from '@guildofgleks/ui/button-toggle';
export * from '@guildofgleks/ui/tabs';
export * from '@guildofgleks/ui/card';
export * from '@guildofgleks/ui/panel';
export * from '@guildofgleks/ui/checkbox';
/*
 * Named, not wholesale, though nothing is dropped: `AGENTS.md` advertises `formatDate`,
 * `parseDate` and "a family of date-math helpers", so this whole set is supported on purpose.
 *
 * The list is here for what an `export *` cannot do -- make the next addition a decision. A
 * helper added to `date-utils.ts` used to become public API the moment it was written, with
 * nobody choosing that and no diff showing it. Adding a line here is the choosing.
 */
export {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  clampDate,
  copyTimeOnto,
  daysInMonth,
  formatDate,
  gogFromZonedTime,
  gogToZonedTime,
  isAfterDay,
  isBeforeDay,
  isInRange,
  isSameDay,
  isSameMonth,
  isWithinBounds,
  localeFirstDayOfWeek,
  monthNames,
  parseDate,
  startOfDay,
  weekdayNames,
  withTime,
} from '@guildofgleks/ui/shared';
export type { GogDateRange } from '@guildofgleks/ui/shared';
export * from '@guildofgleks/ui/divider';
export * from '@guildofgleks/ui/progressbar';
export * from '@guildofgleks/ui/popover';
export * from '@guildofgleks/ui/context-menu';
export * from '@guildofgleks/ui/ripple';
export * from '@guildofgleks/ui/toggle';
export * from '@guildofgleks/ui/radio-group';
export * from '@guildofgleks/ui/icon';
export * from '@guildofgleks/ui/toast';
export * from '@guildofgleks/ui/inputfield';
export * from '@guildofgleks/ui/textarea';
export * from '@guildofgleks/ui/chip';
export * from '@guildofgleks/ui/tag';
export * from '@guildofgleks/ui/select';
export * from '@guildofgleks/ui/menu';
export * from '@guildofgleks/ui/multiselect';
export * from '@guildofgleks/ui/slider';
export * from '@guildofgleks/ui/skeleton';
export * from '@guildofgleks/ui/paginator';
export * from '@guildofgleks/ui/scroll';
export * from '@guildofgleks/ui/spinner';
export * from '@guildofgleks/ui/tooltip';
export * from '@guildofgleks/ui/theme';
export type {
  GogAlertLive,
  GogAriaCurrent,
  GogAriaHasPopup,
  GogBadgePosition,
  GogButtonToggleAppearance,
  GogDateSelectionMode,
  GogDividerVariant,
  GogDropdownFilterPosition,
  GogFloatLabelVariant,
  GogHourFormat,
  GogInputMode,
  GogInputType,
  GogOrientation,
  GogPaginatorRangeMode,
  GogProgressbarAnimation,
  GogProgressbarMode,
  GogProgressbarVariant,
  GogScrollAxis,
  GogScrollOverscrollBehavior,
  GogScrollSize,
  GogSeverity,
  GogSize,
  GogSkeletonAnimation,
  GogSkeletonShape,
  GogAvatarShape,
  GogSliderOrientation,
  GogSliderRange,
  GogSpinnerVariant,
  GogSurfaceVariant,
  GogTabsAlign,
  GogTagShape,
  GogTagVariant,
  GogTextareaResize,
  GogTooltipPosition,
  GogVariant,
  ToastPosition,
} from '@guildofgleks/ui/shared';
export { GOG_CONFIG, provideGogConfig, resolveConfigured } from '@guildofgleks/ui/shared';
export type { GogGlobalConfig } from '@guildofgleks/ui/shared';
export {
  GogDropdownBase,
  GogFilterableDropdownBase,
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
} from '@guildofgleks/ui/shared';
export type {
  GogDropdownChevronContext,
  GogDropdownOption,
  GogDropdownOptionContext,
} from '@guildofgleks/ui/shared';
export { GogFloatLabelState } from '@guildofgleks/ui/shared';
/*
 * Named, not wholesale: `GogOptionAccessor` is the type every collection control's `optionLabel`
 * / `optionValue` / `optionDisabled` inputs are declared with, so a consumer needs it. The three
 * functions beside it -- `getByPath`, `readOption`, `isSameOptionValue` -- are this library's own
 * plumbing, nothing advertises them, and they went public only because this line used to be an
 * `export *`. Deprecated in 21.13.0 and gone from here in 21.14.0; they live on in the internal
 * `@guildofgleks/ui/shared`, which is not an API to build on.
 */
export type { GogOptionAccessor } from '@guildofgleks/ui/shared';
export { GOG_DEPRECATIONS } from '@guildofgleks/ui/shared';
export type { GogDeprecation, GogDeprecationKind } from '@guildofgleks/ui/shared';
export { GOG_TOKEN_GROUPS } from '@guildofgleks/ui/shared';
export type { GogTokenGroup, GogTokenLayer, GogTokenName } from '@guildofgleks/ui/shared';
export type { GogDropdownDirection } from '@guildofgleks/ui/shared';
export type { GogTooltipSide } from '@guildofgleks/ui/shared';
export type { GogIconName, GogBuiltinIconName } from '@guildofgleks/ui/shared';
export { ICON_DEFS } from '@guildofgleks/ui/shared';
export { GOG_ICONS, provideGogIcons } from '@guildofgleks/ui/shared';
