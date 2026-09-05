// Per-component `GOG_CONFIG` keys, for the "Global Configuration" section every component doc
// page renders (`global-config-note.ts`). docs/feedback-triage.md item 8.
//
// This table exists because `@guildofgleks/ui`'s `shared/config.ts` is organised by key and a
// reader on a component page needs the other direction: which keys reach *this* component. It is
// not transcribed from that file's JSDoc either — it is built from the library's actual source,
// every `globalConfig.<key>?.<field>` read traced through the shared state classes
// (`GogDropdownBase`, `GogClearableState`, `GogFloatLabelState`, `GogErrorState`) that several
// components resolve their config in, then cross-checked against each component's own template so
// an inherited-but-unused field (gog-autocomplete inherits `dropdown.filter`/`filterPosition` from
// `GogDropdownBase` but never renders the filter box that reads them) is correctly left out.
//
// Verified against the source again for 21.8.0, which corrected `config.ts`'s own "Applies to …"
// sentences on four keys: the two now agree, so a difference between them is a bug in one of them
// rather than the known gap it used to be.
//
// Verified again for 21.9.x, when `spinner` was added. Two differences from `config.ts`'s own
// "Applies to" sentence, both traced through the templates rather than the JSDoc: `gog-table`
// draws a `gog-spinner` in place of its rows and is not named there, and `gog-spinner-overlay`
// *is* named there but bound `[variant]="variant()"` on an input defaulting to `'runic'`, so a
// configured component never reached it. Listed here as the library behaves, not as it is
// documented to — which is what made both of them visible.
//
// **21.10.0 closed both.** The overlay's `variant` is unset by default now, so it honours the key,
// and `config.ts` names `gog-table`. The two sources agree again; the reason for keeping this list
// derived from the templates does not go away with them, because that is how the gap was found.

export interface GlobalConfigEntry {
  /** A `GOG_CONFIG` path, e.g. `'control.size'`. */
  readonly key: string;
  /** Shown after the key when the field name alone doesn't say what it does. */
  readonly note?: string;
}

/** Keyed by the same slug `nav-data.ts` and the routes use (`components/<slug>`). */
export const GLOBAL_CONFIG_BY_COMPONENT: Readonly<Record<string, readonly GlobalConfigEntry[]>> = {
  accordion: [{ key: 'ripple.enabled' }],
  autocomplete: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'dropdown.appendToBody' },
    { key: 'dropdown.direction' },
    { key: 'ripple.enabled' },
    { key: 'autocomplete.minLength' },
    { key: 'autocomplete.searchDebounce' },
    { key: 'autocomplete.openOnFocus' },
    { key: 'spinner.component', note: 'the spinner loading draws, which has no input of its own' },
    { key: 'spinner.variant', note: 'the same spinner, when no component is set' },
    { key: 'labels.clearSelection' },
  ],
  badge: [],
  button: [
    { key: 'control.size' },
    { key: 'button.debounce' },
    { key: 'ripple.enabled' },
    { key: 'spinner.component', note: 'the spinner loading draws, which has no input of its own' },
    { key: 'spinner.variant', note: 'the same spinner, when no component is set' },
  ],
  'button-toggle': [{ key: 'control.size' }, { key: 'ripple.enabled' }],
  calendar: [
    { key: 'datepicker.locale' },
    { key: 'datepicker.firstDayOfWeek' },
    { key: 'labels.today' },
    { key: 'labels.thisMonth' },
    { key: 'labels.previousMonth' },
    { key: 'labels.nextMonth' },
    { key: 'labels.previousYear' },
    { key: 'labels.nextYear' },
    { key: 'labels.hours', note: 'time selection' },
    { key: 'labels.minutes', note: 'time selection' },
    { key: 'labels.seconds', note: 'time selection' },
  ],
  card: [],
  checkbox: [{ key: 'control.size' }],
  chip: [{ key: 'ripple.enabled' }],
  collapsible: [{ key: 'ripple.enabled', note: 'on gogCollapsibleTrigger' }],
  datepicker: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'dropdown.appendToBody' },
    { key: 'dropdown.direction' },
    { key: 'datepicker.locale' },
    { key: 'datepicker.firstDayOfWeek' },
    { key: 'datepicker.format' },
    { key: 'labels.clearDate' },
    { key: 'labels.openCalendar' },
    { key: 'labels.today', note: 'and the rest of Calendar’s labels, once the panel is open' },
  ],
  dialog: [{ key: 'labels.closeDialog' }],
  divider: [],
  icon: [],
  inputfield: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'inputfield.showSpinButtons' },
    { key: 'labels.clear' },
    { key: 'labels.increment', note: 'type="number" spin buttons' },
    { key: 'labels.decrement', note: 'type="number" spin buttons' },
    { key: 'labels.showPassword' },
    { key: 'labels.hidePassword' },
  ],
  menu: [{ key: 'ripple.enabled', note: 'on menu items' }],
  multiselect: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'dropdown.appendToBody' },
    { key: 'dropdown.direction' },
    { key: 'dropdown.filter' },
    { key: 'dropdown.filterPosition' },
    { key: 'ripple.enabled', note: 'on the panel’s options' },
    { key: 'labels.clearSelection' },
    { key: 'labels.selectAll' },
    { key: 'labels.clearAll' },
  ],
  paginator: [
    { key: 'paginator.showPageSizeSelect' },
    { key: 'paginator.pageSizeOptions' },
    { key: 'labels.pagination' },
    { key: 'labels.previousPage' },
    { key: 'labels.nextPage' },
    { key: 'labels.page' },
    { key: 'labels.rowsPerPage' },
  ],
  panel: [{ key: 'labels.togglePanel', note: 'only when the panel has no gogPanelHeader' }],
  progressbar: [],
  'radio-group': [{ key: 'control.size' }, { key: 'control.errorDisplay' }],
  ripple: [
    {
      key: 'ripple.enabled',
      note: 'turns the press ripple on app-wide for nine other components — see each one’s own section. [gogRipple] on your own element is not covered; the attribute is already the per-element decision.',
    },
  ],
  scroll: [
    { key: 'scroll.size' },
    { key: 'scroll.autoHide' },
    { key: 'scroll.hideDelay' },
    { key: 'scroll.overscrollBehavior' },
    { key: 'scroll.showTrack' },
    {
      key: 'scroll.horizontalWheel',
      note: 'turns a vertical wheel into horizontal scrolling on a region with nothing to scroll vertically. Off by default, and it never takes a gesture the browser already handles — a horizontal delta, a pinch-zoom, or a turn at the content’s end.',
    },
  ],
  select: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'dropdown.appendToBody' },
    { key: 'dropdown.direction' },
    { key: 'dropdown.filter' },
    { key: 'dropdown.filterPosition' },
    { key: 'ripple.enabled', note: 'on the panel’s options' },
    { key: 'labels.clearSelection' },
  ],
  skeleton: [],
  slider: [{ key: 'control.errorDisplay' }],
  spinner: [
    {
      key: 'spinner.component',
      note: 'your own component drawn in place of the built-in look, everywhere the library’s spinner appears — an instance’s own variant still wins over it. gog-spinner-overlay forwards a variant of its own, but only when one is set: it honours this key from 21.10.0 on.',
    },
    { key: 'spinner.variant', note: 'the app-wide preset an instance that asks for none gets' },
  ],
  table: [
    { key: 'paginator.showPageSizeSelect', note: 'through the built-in pagination' },
    { key: 'paginator.pageSizeOptions', note: 'through the built-in pagination' },
    { key: 'labels.total' },
    { key: 'labels.tablePagination' },
    { key: 'labels.selectRow' },
    { key: 'labels.selectAllRows' },
    { key: 'spinner.component', note: 'the spinner shown in place of rows while loading' },
    { key: 'spinner.variant', note: 'the same spinner, when no component is set' },
  ],
  tabs: [{ key: 'ripple.enabled' }],
  tag: [],
  textarea: [
    { key: 'control.size' },
    { key: 'control.errorDisplay' },
    { key: 'control.clearable' },
    { key: 'floatLabel.variant' },
    { key: 'floatLabel.showPlaceholder' },
    { key: 'textarea.resize' },
    { key: 'labels.clear' },
  ],
  toast: [{ key: 'toast.position' }, { key: 'toast.duration' }, { key: 'labels.closeToast' }],
  toggle: [{ key: 'control.size' }],
  tooltip: [
    { key: 'tooltip.position' },
    { key: 'tooltip.showDelay' },
    { key: 'tooltip.hideDelay' },
  ],
};
