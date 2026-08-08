import { NavItem, NavSection } from '../types/nav-item';

export const GENERAL_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', path: 'general/overview' },
  { label: 'Getting Started', path: 'general/getting-started' },
  { label: 'Theming', path: 'general/theming' },
  { label: 'Global Configuration', path: 'general/global-config' },
  {
    label: 'Compare with Material and PrimeNG',
    path: 'general/compare',
    children: [{ label: 'Full Technical Comparison', path: 'general/compare-full' }],
  },
  { label: 'FAQ', path: 'general/faq' },
];

// Alphabetical by label — the order the sidebar renders them in.
const COMPONENT_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Accordion', path: 'components/accordion' },
  { label: 'Autocomplete', path: 'components/autocomplete' },
  { label: 'Badge', path: 'components/badge' },
  { label: 'Button', path: 'components/button' },
  { label: 'Button Toggle', path: 'components/button-toggle' },
  { label: 'Calendar', path: 'components/calendar' },
  { label: 'Checkbox', path: 'components/checkbox' },
  { label: 'Chip', path: 'components/chip' },
  { label: 'Collapsible', path: 'components/collapsible' },
  { label: 'Datepicker', path: 'components/datepicker' },
  { label: 'Dialog', path: 'components/dialog' },
  { label: 'Divider', path: 'components/divider' },
  { label: 'Icon', path: 'components/icon' },
  { label: 'Input Field', path: 'components/inputfield' },
  { label: 'Multiselect', path: 'components/multiselect' },
  { label: 'Paginator', path: 'components/paginator' },
  { label: 'Progress Bar', path: 'components/progressbar' },
  { label: 'Radio Group', path: 'components/radio-group' },
  { label: 'Scroll', path: 'components/scroll' },
  { label: 'Select', path: 'components/select' },
  { label: 'Skeleton', path: 'components/skeleton' },
  { label: 'Slider', path: 'components/slider' },
  { label: 'Spinner', path: 'components/spinner' },
  { label: 'Table', path: 'components/table' },
  { label: 'Tabs', path: 'components/tabs' },
  { label: 'Tag', path: 'components/tag' },
  { label: 'Text Area', path: 'components/textarea' },
  { label: 'Toast', path: 'components/toast' },
  { label: 'Toggle', path: 'components/toggle' },
  { label: 'Tooltip', path: 'components/tooltip' },
];

export const NAV_SECTIONS: readonly NavSection[] = [
  { title: 'General', items: GENERAL_NAV_ITEMS },
  { title: 'Components', items: COMPONENT_NAV_ITEMS },
];
