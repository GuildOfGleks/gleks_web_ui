// Shared by scripts/check-tokens.mjs and scripts/generate-tokens.mjs.
/**
 * Layer 3 of the token system: read by a component, declared *nowhere* on purpose, so that a
 * consumer setting one anywhere always out-cascades the variant/size classes. Declaring any
 * of these — even as a "harmless default" on the block — pins every instance to that value
 * and is the one change that breaks per-instance theming library-wide.
 *
 * This list is therefore the definition of that layer, not a suppression list. Adding an
 * entry is a public-API decision: it becomes a documented override point in the README.
 */
export const INSTANCE_TOKENS = new Set([
  // gog-accordion
  '--gog-accordion-body-font-size',
  '--gog-accordion-body-padding-bottom',
  '--gog-accordion-body-padding-top',
  '--gog-accordion-chevron-font-size',
  '--gog-accordion-chevron-size',
  '--gog-accordion-content-gap',
  '--gog-accordion-font-size',
  '--gog-accordion-letter-spacing',
  '--gog-accordion-padding-x',
  '--gog-accordion-padding-y',
  // gog-button — the spelled-out names are the current ones; each `--gog-btn-*` twin below is
  // the deprecated spelling button.css still falls through to (removed in 21.7.0).
  '--gog-button-bg',
  '--gog-button-border',
  '--gog-button-color',
  '--gog-button-hover-bg',
  '--gog-button-hover-color',
  '--gog-button-hover-shadow',
  '--gog-button-shadow',
  '--gog-button-spinner-color',
  '--gog-btn-bg',
  '--gog-btn-border',
  '--gog-btn-color',
  '--gog-btn-hover-bg',
  '--gog-btn-hover-color',
  '--gog-btn-hover-shadow',
  '--gog-btn-shadow',
  '--gog-btn-spinner-color',
  // Padding and font-size are the same escape hatch; they are only listed under the
  // deprecated spelling because `--gog-button-padding`/`-font-size` are written (as instance
  // overrides) by gog-toast's own stylesheet, which counts as a declaration to rule B.
  '--gog-btn-font-size',
  '--gog-btn-padding',
  // gog-autocomplete
  '--gog-autocomplete-bg',
  '--gog-autocomplete-color',
  '--gog-autocomplete-float-label-on-bg',
  '--gog-autocomplete-font-size',
  '--gog-autocomplete-padding-x',
  '--gog-autocomplete-padding-y',
  // gogBadge — styled from utilities.css, since the badge lands in a consumer's element
  '--gog-badge-bg',
  '--gog-badge-color',
  // gog-button-toggle-group
  '--gog-button-toggle-bg',
  '--gog-button-toggle-color',
  '--gog-button-toggle-font-size',
  '--gog-button-toggle-padding',
  // gog-calendar
  '--gog-calendar-day-bg',
  '--gog-calendar-day-color',
  '--gog-calendar-day-size',
  // gog-datepicker
  '--gog-datepicker-bg',
  '--gog-datepicker-color',
  '--gog-datepicker-float-label-on-bg',
  '--gog-datepicker-font-size',
  '--gog-datepicker-padding-x',
  '--gog-datepicker-padding-y',
  // gog-checkbox
  '--gog-checkbox-box-size',
  '--gog-checkbox-icon-size',
  '--gog-checkbox-label-size',
  '--gog-checkbox-padding',
  // gog-chip
  '--gog-chip-avatar-size',
  '--gog-chip-font-size',
  '--gog-chip-gap',
  '--gog-chip-icon-size',
  '--gog-chip-padding-block',
  '--gog-chip-padding-inline',
  '--gog-chip-remove-size',
  // gog-dialog — written as inline styles by the drag handler, not by a theme
  '--gog-dialog-offset-x',
  '--gog-dialog-offset-y',
  // gog-divider
  '--gog-divider-color',
  '--gog-divider-spacing',
  '--gog-divider-thickness',
  // gog-inputfield / gog-textarea (shared --gog-input-* block)
  '--gog-input-float-label-on-bg',
  '--gog-input-font',
  '--gog-input-padding-x',
  '--gog-input-padding-y',
  // gog-tabs
  '--gog-tabs-tab-bg',
  '--gog-tabs-tab-color',
  '--gog-tabs-tab-font-size',
  '--gog-tabs-tab-padding',
  // gog-menu — written as an inline style from the room measured between the trigger and the
  // viewport edge, not by a theme. `menu.css` takes the smaller of it and
  // `--gog-menu-max-height`; before 21.5.1 the measurement was written straight onto the
  // panel's `max-height`, where it beat the token instead of combining with it.
  '--gog-menu-available-height',
  // gog-textarea — written as an inline style from the measured scrollbar width, not by a theme
  '--gog-textarea-scrollbar-width',
  // gog-toggle
  '--gog-toggle-padding',
  '--gog-toggle-thumb-bg',
  '--gog-toggle-track-bg',
  // gog-multiselect
  '--gog-multiselect-float-label-on-bg',
  '--gog-multiselect-font-size',
  '--gog-multiselect-padding-x',
  '--gog-multiselect-padding-y',
  // gog-progressbar
  '--gog-progressbar-buffer-bg',
  '--gog-progressbar-fill-bg',
  '--gog-progressbar-height',
  '--gog-progressbar-track-bg',
  // gog-radio-group
  '--gog-radio-box-size',
  '--gog-radio-label-size',
  '--gog-radio-padding',
  // gog-select
  '--gog-select-control-font',
  '--gog-select-control-padding-x',
  '--gog-select-control-padding-y',
  '--gog-select-float-label-on-bg',
  // gog-table
  '--gog-table-td-font-size',
  '--gog-table-td-padding-v',
  '--gog-table-th-font-size',
  '--gog-table-th-padding-v',
  // gog-tag
  '--gog-tag-accent',
  '--gog-tag-bg',
  '--gog-tag-border',
  '--gog-tag-color',
  '--gog-tag-font-size',
  '--gog-tag-gap',
  '--gog-tag-icon-size',
  '--gog-tag-padding-block',
  '--gog-tag-padding-inline',
]);
