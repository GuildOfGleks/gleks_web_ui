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
