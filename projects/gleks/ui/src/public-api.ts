/*
 * Public API Surface of ui
 */

export * from './lib/components/button/button.component';
export * from './lib/components/button/button.directive';
export * from './lib/components/accordion/accordion.component';
export * from './lib/components/alert/alert.component';
export * from './lib/components/collapsible/collapsible.component';
export * from './lib/components/collapsible/collapsible-trigger.directive';
export * from './lib/components/collapsible/collapsible-content.directive';
export * from './lib/components/autocomplete/autocomplete.component';
export * from './lib/components/badge/badge.directive';
export * from './lib/components/button-toggle/button-toggle.component';
export * from './lib/components/tabs/tab.component';
export * from './lib/components/tabs/tabs.component';
export * from './lib/components/tabs/tabs-state';
export * from './lib/components/card/card.component';
export * from './lib/components/panel/panel.component';
export * from './lib/components/checkbox/checkbox.component';
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
export * from './lib/components/divider/divider.component';
export * from './lib/components/progressbar/progressbar.component';
export * from './lib/components/ripple/ripple.directive';
export * from './lib/components/toggle/toggle.component';
export * from './lib/components/radio-group/radio-group.component';
export * from './lib/components/icon/icon.component';
export * from './lib/components/toast/toast.component';
export * from './lib/components/toast/toast-container/toast-container.component';
export * from './lib/components/inputfield/inputfield.component';
export * from './lib/components/textarea/textarea.component';
export * from './lib/components/chip/chip.component';
export * from './lib/components/tag/tag.component';
export * from './lib/components/select/select.component';
export * from './lib/components/menu/menu.component';
export * from './lib/components/multiselect/multiselect.component';
export * from './lib/components/slider/slider.component';
export * from './lib/components/skeleton/skeleton.component';
export * from './lib/components/paginator/paginator.component';
export * from './lib/components/scroll/scroll.component';
export * from './lib/components/spinner/spinner-overlay/spinner-overlay.component';
export * from './lib/components/spinner/spinner.component';
export * from './lib/components/tooltip/tooltip.directive';
export * from './lib/services/toast-service/toast-service';
export * from './lib/services/theme-service/theme.service';
export type {
  GogAlertLive,
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
  GogProgressbarMode,
  GogProgressbarVariant,
  GogScrollAxis,
  GogScrollOverscrollBehavior,
  GogScrollSize,
  GogSeverity,
  GogSize,
  GogSkeletonAnimation,
  GogSkeletonShape,
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
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
} from '@guildofgleks/ui/shared';
export type { GogDropdownOption, GogDropdownOptionContext } from '@guildofgleks/ui/shared';
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
