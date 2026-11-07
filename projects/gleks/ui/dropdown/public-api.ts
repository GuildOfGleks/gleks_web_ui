/*
 * `@guildofgleks/ui/dropdown` -- the base classes and directives for building a dropdown of your own. Opt-in; the root re-exports all of it
 * (docs/component-entry-points.md). The code lives in the internal `@guildofgleks/ui/shared`;
 * this list is what of it is public.
 */
export {
  GogDropdownBase,
  GogDropdownChevronDirective,
  GogDropdownOptionDirective,
  GogFilterableDropdownBase,
  GogFloatLabelState,
} from '@guildofgleks/ui/shared';
/*
 * Named, not wholesale: `GogOptionAccessor` is the type every collection control's `optionLabel`
 * / `optionValue` / `optionDisabled` inputs are declared with, so a consumer needs it. The
 * functions beside it in `shared` -- `getByPath`, `readOption`, `isSameOptionValue` -- are this
 * library's own plumbing; they were public until 21.14.0 only because a line like this was an
 * `export *`.
 */
export type {
  GogDropdownChevronContext,
  GogDropdownDirection,
  GogDropdownFilterPosition,
  GogDropdownOption,
  GogDropdownOptionContext,
  GogOptionAccessor,
} from '@guildofgleks/ui/shared';
