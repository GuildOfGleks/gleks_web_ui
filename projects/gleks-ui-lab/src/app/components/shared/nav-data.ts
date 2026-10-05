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
  { label: 'AGENTS.md', path: 'general/agents' },
];

// 41 entries — 38 components and the three directives (gogBadge, gogTooltip, gogRipple) — grouped by what they're for rather
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
      { label: 'File Upload', path: 'components/file-upload' },
      { label: 'Input Field', path: 'components/inputfield' },
      { label: 'Multiselect', path: 'components/multiselect' },
      { label: 'Radio Group', path: 'components/radio-group' },
      { label: 'Rating', path: 'components/rating' },
      { label: 'Select', path: 'components/select' },
      { label: 'Slider', path: 'components/slider' },
      { label: 'Text Area', path: 'components/textarea' },
    ],
  },
  {
    title: 'Data Display',
    items: [
      { label: 'Avatar', path: 'components/avatar' },
      { label: 'Badge', path: 'components/badge' },
      { label: 'Chip', path: 'components/chip' },
      { label: 'Divider', path: 'components/divider' },
      { label: 'Icon', path: 'components/icon' },
      { label: 'Paginator', path: 'components/paginator' },
      { label: 'Progress Bar', path: 'components/progressbar' },
      { label: 'Ripple', path: 'components/ripple' },
      { label: 'Skeleton', path: 'components/skeleton' },
      { label: 'Table', path: 'components/table' },
      { label: 'Tag', path: 'components/tag' },
    ],
  },
  {
    title: 'Layout & Navigation',
    items: [
      { label: 'Accordion', path: 'components/accordion' },
      { label: 'Breadcrumbs', path: 'components/breadcrumbs' },
      { label: 'Card', path: 'components/card' },
      { label: 'Collapsible', path: 'components/collapsible' },
      { label: 'Panel', path: 'components/panel' },
      { label: 'Scroll', path: 'components/scroll' },
      { label: 'Stepper', path: 'components/stepper' },
      { label: 'Tabs', path: 'components/tabs' },
    ],
  },
  {
    title: 'Feedback & Overlays',
    items: [
      { label: 'Alert', path: 'components/alert' },
      { label: 'Dialog', path: 'components/dialog' },
      { label: 'Empty State', path: 'components/empty-state' },
      { label: 'Spinner', path: 'components/spinner' },
      { label: 'Toast', path: 'components/toast' },
      { label: 'Tooltip', path: 'components/tooltip' },
    ],
  },
];

export const NAV_SECTIONS: readonly NavSection[] = [
  { title: 'General', items: GENERAL_NAV_ITEMS },
  { title: 'Components', path: 'components', groups: COMPONENT_NAV_GROUPS },
];
