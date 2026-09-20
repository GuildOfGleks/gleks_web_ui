import type { Type } from '@angular/core';

import type { DocApi } from '../doc/doc-api';
import { AUTOCOMPLETE_API } from './autocomplete/autocomplete.api';
import { BUTTON_API } from './button/button.api';
import { BUTTON_TOGGLE_API } from './button-toggle/button-toggle.api';
import { DATEPICKER_API } from './datepicker/datepicker.api';
import { INPUTFIELD_API } from './inputfield/inputfield.api';
import { MULTISELECT_API } from './multiselect/multiselect.api';
import { SELECT_API } from './select/select.api';
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
};
