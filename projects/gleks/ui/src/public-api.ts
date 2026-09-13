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
 * Table, datepicker and dialog: deprecated here, and the tags on these export specifiers are for
 * `check:deprecations` and the generated manifest, not for a consumer's editor. ng-packagr bundles
 * the root's types into one `export { ... }` statement and drops every comment on a specifier, so
 * nothing below reaches a published `.d.ts` -- measured in docs/entry-points.md (Part 2, finding 6).
 * A tag on the declaration would survive, and would strike through `@guildofgleks/ui/table` too,
 * because it is the same class. The announcement is CHANGELOG.md, AGENTS.md and GOG_DEPRECATIONS.
 */
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/datepicker`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  CalendarComponent,
} from './lib/components/datepicker/calendar/calendar.component';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/datepicker`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogCalendarDay,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/datepicker`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogDatepickerValue,
} from './lib/components/datepicker/calendar/calendar.component';
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/datepicker`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DatepickerComponent,
} from './lib/components/datepicker/datepicker.component';
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
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  ConfirmationDialogComponent,
} from './lib/components/dialog/confirmation-dialog/confirmation-dialog.component';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  ConfirmDialogData,
} from './lib/components/dialog/confirmation-dialog/confirmation-dialog.component';
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DialogComponent,
} from './lib/components/dialog/dialog.component';
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DIALOG_DATA,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DIALOG_REF,
} from './lib/components/dialog/dialog.tokens';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DialogRef,
} from './lib/components/dialog/dialog.tokens';
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
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogColumn,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogColumnBodyDirective,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogColumnHeaderDirective,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  defaultCompare,
} from './lib/components/table/column';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogColumnBodyContext,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogColumnHeaderContext,
} from './lib/components/table/column';
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  TableComponent,
} from './lib/components/table/table.component';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogTableRowClickEvent,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogTableSelectionMode,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  GogTableSortEvent,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/table`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  SortDirection,
} from './lib/components/table/table.component';
export * from './lib/components/spinner/spinner.component';
export * from './lib/components/tooltip/tooltip.directive';
export {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DialogService,
} from './lib/services/dialog-service/dialog.service';
export type {
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DialogConfig,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  DialogHandle,
  /**
   * @deprecated since 21.13.0 (2026-09-13) — import it from `@guildofgleks/ui/dialog`. From that
   * minor on it stays out of the initial bundle of an app that only uses it behind a lazy route.
   * Removed in 21.14.0.
   */
  OpenDialog,
} from './lib/services/dialog-service/dialog.service';
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
 * `export *`. They are deprecated in place and this list drops them in 21.14.0.
 */
export type { GogOptionAccessor } from '@guildofgleks/ui/shared';
/*
 * Deprecated on the export, not on the declaration: the table and the dropdown base still use all
 * three. The first version of this change tagged the functions themselves, which would have had
 * `check:deprecations` demand their deletion in 21.14.0 while the package depended on them.
 */
export {
  /**
   * @deprecated since 21.13.0 (2026-09-12) — read the field yourself; this is the package's own
   * plumbing and it leaves the root. It stays inside `@guildofgleks/ui/shared`, the internal entry
   * point, which is not a replacement to build on. Removed in 21.14.0.
   */
  getByPath,
  /**
   * @deprecated since 21.13.0 (2026-09-12) — read the field yourself; this is the package's own
   * plumbing and it leaves the root. It stays inside `@guildofgleks/ui/shared`, the internal entry
   * point, which is not a replacement to build on. Removed in 21.14.0.
   */
  isSameOptionValue,
  /**
   * @deprecated since 21.13.0 (2026-09-12) — read the field yourself; this is the package's own
   * plumbing and it leaves the root. It stays inside `@guildofgleks/ui/shared`, the internal entry
   * point, which is not a replacement to build on. Removed in 21.14.0.
   */
  readOption,
} from '@guildofgleks/ui/shared';
export { GOG_DEPRECATIONS } from '@guildofgleks/ui/shared';
export type { GogDeprecation, GogDeprecationKind } from '@guildofgleks/ui/shared';
export { GOG_TOKEN_GROUPS } from '@guildofgleks/ui/shared';
export type { GogTokenGroup, GogTokenLayer, GogTokenName } from '@guildofgleks/ui/shared';
export type { GogDropdownDirection } from '@guildofgleks/ui/shared';
export type { GogTooltipSide } from '@guildofgleks/ui/shared';
export type { GogIconName, GogBuiltinIconName } from '@guildofgleks/ui/shared';
export { ICON_DEFS } from '@guildofgleks/ui/shared';
export { GOG_ICONS, provideGogIcons } from '@guildofgleks/ui/shared';
