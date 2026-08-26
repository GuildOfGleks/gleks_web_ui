import { NavGroup, NavItem, NavSection } from '../types/nav-item';

export const GENERAL_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', path: 'general/overview' },
  {
    label: 'Getting Started',
    path: 'general/getting-started',
    children: [{ label: 'Global Configuration', path: 'general/global-config' }],
  },
  { label: 'Theming', path: 'general/theming' },
  { label: 'Right-to-left', path: 'general/rtl' },
  {
    label: 'Compare with Material and PrimeNG',
    path: 'general/compare',
    children: [{ label: 'Full Technical Comparison', path: 'general/compare-full' }],
  },
  { label: 'FAQ', path: 'general/faq' },
  { label: 'Releases', path: 'general/releases' },
];

// 31 entries — 29 components and the two directives — grouped by what they're for rather
// than one long alphabetical run —
// alphabetical within each group.
const COMPONENT_NAV_GROUPS: readonly NavGroup[] = [
  {
    title: 'Actions',
    items: [
      { label: 'Button', path: 'components/button' },
      { label: 'Button Toggle', path: 'components/button-toggle' },
      { label: 'Menu', path: 'components/menu' },
      { label: 'Toggle', path: 'components/toggle' },
    ],
  },
  {
    title: 'Forms & Inputs',
    items: [
      { label: 'Autocomplete', path: 'components/autocomplete' },
      { label: 'Calendar', path: 'components/calendar' },
      { label: 'Checkbox', path: 'components/checkbox' },
      { label: 'Datepicker', path: 'components/datepicker' },
      { label: 'Input Field', path: 'components/inputfield' },
      { label: 'Multiselect', path: 'components/multiselect' },
      { label: 'Radio Group', path: 'components/radio-group' },
      { label: 'Select', path: 'components/select' },
      { label: 'Slider', path: 'components/slider' },
      { label: 'Text Area', path: 'components/textarea' },
    ],
  },
  {
    title: 'Data Display',
    items: [
      { label: 'Badge', path: 'components/badge' },
      { label: 'Chip', path: 'components/chip' },
      { label: 'Divider', path: 'components/divider' },
      { label: 'Icon', path: 'components/icon' },
      { label: 'Paginator', path: 'components/paginator' },
      { label: 'Progress Bar', path: 'components/progressbar' },
      { label: 'Skeleton', path: 'components/skeleton' },
      { label: 'Table', path: 'components/table' },
      { label: 'Tag', path: 'components/tag' },
    ],
  },
  {
    title: 'Layout & Navigation',
    items: [
      { label: 'Accordion', path: 'components/accordion' },
      { label: 'Collapsible', path: 'components/collapsible' },
      { label: 'Panel', path: 'components/panel' },
      { label: 'Scroll', path: 'components/scroll' },
      { label: 'Tabs', path: 'components/tabs' },
    ],
  },
  {
    title: 'Feedback & Overlays',
    items: [
      { label: 'Dialog', path: 'components/dialog' },
      { label: 'Spinner', path: 'components/spinner' },
      { label: 'Toast', path: 'components/toast' },
      { label: 'Tooltip', path: 'components/tooltip' },
    ],
  },
];

export const NAV_SECTIONS: readonly NavSection[] = [
  { title: 'General', items: GENERAL_NAV_ITEMS },
  { title: 'Components', groups: COMPONENT_NAV_GROUPS },
];
