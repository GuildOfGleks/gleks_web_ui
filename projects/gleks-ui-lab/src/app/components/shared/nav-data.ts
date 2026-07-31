import { NavItem, NavSection } from '../types/nav-item';

const GENERAL_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', path: 'general/overview' },
  { label: 'Getting Started', path: 'general/getting-started' },
  { label: 'Compare with Material and PrimeNG', path: 'general/compare' },
  { label: 'FAQ', path: 'general/faq' },
];

const COMPONENT_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Accordion', path: 'components/accordion' },
  { label: 'Button', path: 'components/button' },
  { label: 'Checkbox', path: 'components/checkbox' },
  { label: 'Chip', path: 'components/chip' },
  { label: 'Dialog', path: 'components/dialog' },
  { label: 'Icon', path: 'components/icon' },
  { label: 'Input Field', path: 'components/inputfield' },
  { label: 'Multiselect', path: 'components/multiselect' },
  { label: 'Paginator', path: 'components/paginator' },
  { label: 'Select', path: 'components/select' },
  { label: 'Skeleton', path: 'components/skeleton' },
  { label: 'Slider', path: 'components/slider' },
  { label: 'Spinner', path: 'components/spinner' },
  { label: 'Table', path: 'components/table' },
  { label: 'Tag', path: 'components/tag' },
  { label: 'Toast', path: 'components/toast' },
];

export const NAV_SECTIONS: readonly NavSection[] = [
  { title: 'General', items: GENERAL_NAV_ITEMS },
  { title: 'Components', items: COMPONENT_NAV_ITEMS },
];
