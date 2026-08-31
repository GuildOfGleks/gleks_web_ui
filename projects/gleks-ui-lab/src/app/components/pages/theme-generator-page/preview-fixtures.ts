import type { GogAccordionItem, GogDropdownOption, GogRadioOption, Toast } from '@guildofgleks/ui';

export const PREVIEW_ACCORDION_ITEMS: (GogAccordionItem & { body: string })[] = [
  { id: 'preview', title: 'Accordion item', body: 'This is the accordion body content.' },
];

export const PREVIEW_SELECT_OPTIONS: GogDropdownOption[] = [
  { id: 'angular', name: 'Angular' },
  { id: 'react', name: 'React' },
  { id: 'vue', name: 'Vue' },
];

export const PREVIEW_MULTISELECT_OPTIONS: GogDropdownOption[] = [
  { id: 'toast', name: 'Toast' },
  { id: 'dialog', name: 'Dialog' },
  { id: 'table', name: 'Table' },
];

export const PREVIEW_RADIO_OPTIONS: GogRadioOption[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'express', label: 'Express' },
];

export const PREVIEW_TABLE_ROWS: { component: string; status: string }[] = [
  { component: 'Button', status: 'Ready' },
  { component: 'Checkbox', status: 'Ready' },
  { component: 'Dialog', status: 'Ready' },
];

// Long enough, at the gallery card's width, to force gog-scroll's own overflow past the
// fixed-height wrapper around it — otherwise there is nothing for the themed thumb to scroll.
export const PREVIEW_SCROLL_LINES: string[] = [
  'Line one of a list too long to fit.',
  'Line two, still scrolling.',
  'Line three.',
  'Line four.',
  'Line five.',
  'Line six — the themed thumb should be visible by now.',
];

export const PREVIEW_TOAST: Toast = {
  id: 'preview',
  message: 'Saved successfully',
  type: 'success',
  iconName: 'success',
  actions: [],
  isSticky: true,
  duration: 4000,
  position: 'bottom-right',
  dedupeKey: 'preview',
  revision: 0,
};
