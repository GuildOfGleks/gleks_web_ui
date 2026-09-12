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
export * from './lib/components/datepicker/calendar/calendar.component';
export * from './lib/components/datepicker/datepicker.component';
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
} from './lib/components/datepicker/date-utils';
export type { GogDateRange } from './lib/components/datepicker/date-utils';
export * from './lib/components/divider/divider.component';
export * from './lib/components/progressbar/progressbar.component';
export * from './lib/components/ripple/ripple.directive';
export * from './lib/components/toggle/toggle.component';
export * from './lib/components/radio-group/radio-group.component';
export * from './lib/components/dialog/confirmation-dialog/confirmation-dialog.component';
export * from './lib/components/dialog/dialog.component';
export * from './lib/components/dialog/dialog.tokens';
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
export * from './lib/components/table/column';
export * from './lib/components/table/table.component';
export * from './lib/components/spinner/spinner.component';
export * from './lib/components/tooltip/tooltip.directive';
export * from './lib/services/dialog-service/dialog.service';
export * from './lib/services/toast-service/toast-service';
export * from './lib/services/theme-service/theme.service';
export * from './lib/shared/types';
export * from './lib/shared/config';
export * from './lib/shared/dropdown-base';
export * from './lib/shared/float-label-state';
/*
 * Named, not wholesale: `GogOptionAccessor` is the type every collection control's `optionLabel`
 * / `optionValue` / `optionDisabled` inputs are declared with, so a consumer needs it. The three
 * functions beside it -- `getByPath`, `readOption`, `isSameOptionValue` -- are this library's own
 * plumbing, nothing advertises them, and they went public only because this line used to be an
 * `export *`. They are deprecated in place and this list drops them in 21.14.0.
 */
export type { GogOptionAccessor } from './lib/shared/option-accessor';
export { getByPath, isSameOptionValue, readOption } from './lib/shared/option-accessor';
export * from './lib/shared/deprecations';
export * from './lib/shared/token-names';
export type { GogDropdownDirection } from './lib/shared/dropdown-position';
export type { GogTooltipSide } from './lib/shared/tooltip-position';
export type { GogIconName, GogBuiltinIconName } from './lib/shared/icons';
export { ICON_DEFS } from './lib/shared/icons';
export { GOG_ICONS, provideGogIcons } from './lib/shared/icon-registry';
