import type { Type } from '@angular/core';

import type { DocApi } from '../doc/doc-api';
import { BUTTON_API } from './button/button.api';
import { BUTTON_TOGGLE_API } from './button-toggle/button-toggle.api';
import { INPUTFIELD_API } from './inputfield/inputfield.api';

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
};
