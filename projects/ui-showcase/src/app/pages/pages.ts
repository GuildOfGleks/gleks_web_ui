import type { Type } from '@angular/core';

import type { DocApi } from '../doc/doc-api';
import { ACCORDION_API } from './accordion/accordion.api';
import { ALERT_API } from './alert/alert.api';
import { AUTOCOMPLETE_API } from './autocomplete/autocomplete.api';
import { BADGE_API } from './badge/badge.api';
import { BUTTON_API } from './button/button.api';
import { BUTTON_TOGGLE_API } from './button-toggle/button-toggle.api';
import { CARD_API } from './card/card.api';
import { CHECKBOX_API } from './checkbox/checkbox.api';
import { CHIP_API } from './chip/chip.api';
import { COLLAPSIBLE_API } from './collapsible/collapsible.api';
import { DATEPICKER_API } from './datepicker/datepicker.api';
import { DIVIDER_API } from './divider/divider.api';
import { DROPDOWN_TEMPLATES_API } from './dropdown-templates/dropdown-templates.api';
import { ICON_API } from './icon/icon.api';
import { INPUTFIELD_API } from './inputfield/inputfield.api';
import { MULTISELECT_API } from './multiselect/multiselect.api';
import { PANEL_API } from './panel/panel.api';
import { RADIO_GROUP_API } from './radio-group/radio-group.api';
import { PROGRESSBAR_API } from './progressbar/progressbar.api';
import { RIPPLE_API } from './ripple/ripple.api';
import { SELECT_API } from './select/select.api';
import { SKELETON_API } from './skeleton/skeleton.api';
import { SLIDER_API } from './slider/slider.api';
import { SPINNER_API } from './spinner/spinner.api';
import { TAG_API } from './tag/tag.api';
import { TOGGLE_API } from './toggle/toggle.api';
import { TEXTAREA_API } from './textarea/textarea.api';

/** What `app-doc-page` renders on its own for a unit, after the page's hand-built sections. */
export interface DocPageEntry {
  readonly load: () => Promise<Type<unknown>>;
  /** One entry per component or directive in the unit, in registry order. */
  readonly api: readonly DocApi[];
  /** `GOG_TOKEN_GROUPS` section names. */
  readonly tokens: readonly string[];
}

/** Rebuilt component pages, by registry unit id. A unit listed here is routed at `/<id>`. */
export const PAGES: Readonly<Record<string, DocPageEntry>> = {
  button: {
    load: () => import('./button/button-page').then((m) => m.ButtonPage),
    api: BUTTON_API,
    tokens: ['Button', 'Button severity'],
  },
  'button-toggle': {
    load: () => import('./button-toggle/button-toggle-page').then((m) => m.ButtonTogglePage),
    api: BUTTON_TOGGLE_API,
    tokens: ['Button toggle group'],
  },
  inputfield: {
    load: () => import('./inputfield/inputfield-page').then((m) => m.InputfieldPage),
    api: INPUTFIELD_API,
    tokens: [
      'Input field',
      'Field sizing (input / select / multiselect share one scale)',
      'Float label geometry (input / textarea / select / multiselect)',
    ],
  },
  textarea: {
    load: () => import('./textarea/textarea-page').then((m) => m.TextareaPage),
    api: TEXTAREA_API,
    tokens: ['Input field', 'Float label geometry (input / textarea / select / multiselect)'],
  },
  select: {
    load: () => import('./select/select-page').then((m) => m.SelectPage),
    api: SELECT_API,
    tokens: [
      'Select',
      'Field sizing (input / select / multiselect share one scale)',
      'Float label geometry (input / textarea / select / multiselect)',
    ],
  },
  multiselect: {
    load: () => import('./multiselect/multiselect-page').then((m) => m.MultiselectPage),
    api: MULTISELECT_API,
    tokens: [
      'Multiselect',
      'Field sizing (input / select / multiselect share one scale)',
      'Float label geometry (input / textarea / select / multiselect)',
    ],
  },
  autocomplete: {
    load: () => import('./autocomplete/autocomplete-page').then((m) => m.AutocompletePage),
    api: AUTOCOMPLETE_API,
    tokens: ['Autocomplete', 'Float label geometry (input / textarea / select / multiselect)'],
  },
  datepicker: {
    load: () => import('./datepicker/datepicker-page').then((m) => m.DatepickerPage),
    api: DATEPICKER_API,
    tokens: [
      'Datepicker (the field; the grid inside it is themed by --gog-calendar-*)',
      'Calendar (the month grid inside gog-datepicker, and gog-calendar on its own)',
      'Float label geometry (input / textarea / select / multiselect)',
    ],
  },
  'dropdown-templates': {
    load: () =>
      import('./dropdown-templates/dropdown-templates-page').then((m) => m.DropdownTemplatesPage),
    api: DROPDOWN_TEMPLATES_API,
    tokens: [],
  },
  checkbox: {
    load: () => import('./checkbox/checkbox-page').then((m) => m.CheckboxPage),
    api: CHECKBOX_API,
    tokens: ['Checkbox', 'Control metrics'],
  },
  toggle: {
    load: () => import('./toggle/toggle-page').then((m) => m.TogglePage),
    api: TOGGLE_API,
    tokens: ['Toggle'],
  },
  'radio-group': {
    load: () => import('./radio-group/radio-group-page').then((m) => m.RadioGroupPage),
    api: RADIO_GROUP_API,
    tokens: ['Radio group', 'Control metrics'],
  },
  slider: {
    load: () => import('./slider/slider-page').then((m) => m.SliderPage),
    api: SLIDER_API,
    tokens: ['Slider'],
  },
  icon: {
    load: () => import('./icon/icon-page').then((m) => m.IconPage),
    api: ICON_API,
    tokens: ['Icon & spinner', 'Icon'],
  },
  badge: {
    load: () => import('./badge/badge-page').then((m) => m.BadgePage),
    api: BADGE_API,
    tokens: ['Badge (the `gogBadge` directive; its classes live in utilities.css)'],
  },
  chip: {
    load: () => import('./chip/chip-page').then((m) => m.ChipPage),
    api: CHIP_API,
    tokens: ['Chip'],
  },
  tag: {
    load: () => import('./tag/tag-page').then((m) => m.TagPage),
    api: TAG_API,
    tokens: ['Tag'],
  },
  alert: {
    load: () => import('./alert/alert-page').then((m) => m.AlertPage),
    api: ALERT_API,
    tokens: ['Alert'],
  },
  spinner: {
    load: () => import('./spinner/spinner-page').then((m) => m.SpinnerPage),
    api: SPINNER_API,
    tokens: ['Spinner', 'Icon & spinner'],
  },
  skeleton: {
    load: () => import('./skeleton/skeleton-page').then((m) => m.SkeletonPage),
    api: SKELETON_API,
    tokens: ['Skeleton'],
  },
  progressbar: {
    load: () => import('./progressbar/progressbar-page').then((m) => m.ProgressbarPage),
    api: PROGRESSBAR_API,
    tokens: ['Progressbar'],
  },
  divider: {
    load: () => import('./divider/divider-page').then((m) => m.DividerPage),
    api: DIVIDER_API,
    tokens: ['Divider'],
  },
  ripple: {
    load: () => import('./ripple/ripple-page').then((m) => m.RipplePage),
    api: RIPPLE_API,
    tokens: ['Ripple (the `gogRipple` directive; its classes live in ripple.css)'],
  },
  card: {
    load: () => import('./card/card-page').then((m) => m.CardPage),
    api: CARD_API,
    tokens: ['Card'],
  },
  panel: {
    load: () => import('./panel/panel-page').then((m) => m.PanelPage),
    api: PANEL_API,
    tokens: ['Panel'],
  },
  accordion: {
    load: () => import('./accordion/accordion-page').then((m) => m.AccordionPage),
    api: ACCORDION_API,
    tokens: ['Accordion'],
  },
  collapsible: {
    load: () => import('./collapsible/collapsible-page').then((m) => m.CollapsiblePage),
    api: COLLAPSIBLE_API,
    tokens: ['Collapsible'],
  },
};
