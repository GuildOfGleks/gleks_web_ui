import type {
  GogAccordionItem,
  GogDropdownOption,
  GogRadioOption,
  GogSize,
} from '@guildofgleks/ui';

export const SIZES: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

export const COUNTRIES: GogDropdownOption[] = [
  { id: 'de', name: 'Germany' },
  { id: 'fr', name: 'France' },
  { id: 'pl', name: 'Poland' },
  { id: 'pt', name: 'Portugal' },
  { id: 'ua', name: 'Ukraine' },
];

export const CITIES: GogDropdownOption[] = [
  'Berlin',
  'Hamburg',
  'Kyiv',
  'Lisbon',
  'Lviv',
  'Lyon',
  'Paris',
  'Porto',
  'Warsaw',
].map((name) => ({ id: name.toLowerCase(), name }));

export const LANGUAGES: GogDropdownOption[] = [
  { id: 'en', name: 'English' },
  { id: 'de', name: 'German' },
  { id: 'fr', name: 'French' },
  { id: 'pl', name: 'Polish' },
  { id: 'uk', name: 'Ukrainian' },
];

export const PLANS: GogRadioOption[] = [
  { id: 'free', label: 'Free' },
  { id: 'team', label: 'Team' },
  { id: 'enterprise', label: 'Enterprise', disabled: true },
];

export const APPEARANCES: (GogDropdownOption & { icon: string })[] = [
  { id: 'light', name: 'Light', icon: 'eye' },
  { id: 'dark', name: 'Dark', icon: 'eye-off' },
];

export const NOTIFICATION_ITEMS: GogAccordionItem[] = [
  { id: 'email', title: 'Email', icon: 'mail', hint: 'A digest every morning' },
  { id: 'push', title: 'Push', icon: 'info', hint: 'Only mentions and failures' },
  { id: 'sms', title: 'SMS', icon: 'lock', hint: 'Sign-in codes', disabled: true },
];

export interface Session {
  readonly id: number;
  readonly device: string;
  readonly place: string;
  readonly seen: string;
  readonly current: boolean;
}

export const SESSIONS: Session[] = [
  { id: 1, device: 'Firefox on Fedora', place: 'Kyiv', seen: 'now', current: true },
  { id: 2, device: 'Safari on iPhone', place: 'Kyiv', seen: '2 hours ago', current: false },
  { id: 3, device: 'Chrome on Windows', place: 'Warsaw', seen: '3 days ago', current: false },
];

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Order {
  readonly id: string;
  readonly customer: string;
  readonly total: number;
  readonly status: OrderStatus;
  readonly tags: string[];
}

export const STATUS_VARIANT: Readonly<
  Record<OrderStatus, 'success' | 'warning' | 'info' | 'danger'>
> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'danger',
};

const CUSTOMERS = ['Northwind', 'Contoso', 'Globex', 'Fabrikam', 'Initech', 'Umbrella'];
const STATUSES: readonly OrderStatus[] = ['paid', 'pending', 'paid', 'refunded', 'failed'];
const TAGS = ['priority', 'gift', 'wholesale', 'repeat'];

export const ORDERS: Order[] = Array.from({ length: 23 }, (_, index) => ({
  id: `SO-${1040 + index}`,
  customer: CUSTOMERS[index % CUSTOMERS.length],
  total: Math.round(((index * 37) % 400) * 10 + 49.9) / 10,
  status: STATUSES[index % STATUSES.length],
  tags: TAGS.filter((_, tag) => (index + tag) % 3 === 0),
}));

export const STATUS_OPTIONS: (GogDropdownOption & { status: OrderStatus })[] = (
  ['paid', 'pending', 'refunded', 'failed'] as const
).map((status) => ({ id: status, name: status[0].toUpperCase() + status.slice(1), status }));

export const TAG_OPTIONS: GogDropdownOption[] = TAGS.map((tag) => ({
  id: tag,
  name: tag,
}));

export const CUSTOMER_OPTIONS: GogDropdownOption[] = CUSTOMERS.map((name) => ({
  id: name.toLowerCase(),
  name,
}));

export const PERIODS: GogDropdownOption[] = [
  { id: 'day', name: 'Day' },
  { id: 'week', name: 'Week' },
  { id: 'month', name: 'Month' },
];

export const PRIORITIES: GogRadioOption[] = [
  { id: 'any', label: 'Any' },
  { id: 'high', label: 'High' },
];

export const FAQ_ITEMS: GogAccordionItem[] = [
  {
    id: 'refund',
    title: 'How long does a refund take?',
    answer: 'Three to five working days after the order is marked refunded.',
  },
  {
    id: 'export',
    title: 'Which formats can I export?',
    answer: 'CSV and XLSX, with the columns the table shows.',
  },
];

export const ACTIVITY: readonly string[] = Array.from(
  { length: 30 },
  (_, index) =>
    `${String(9 + Math.floor(index / 4)).padStart(2, '0')}:${String((index * 13) % 60).padStart(2, '0')} · ` +
    ['Order paid', 'Refund issued', 'Customer created', 'Invoice sent', 'Export finished'][
      index % 5
    ],
);
