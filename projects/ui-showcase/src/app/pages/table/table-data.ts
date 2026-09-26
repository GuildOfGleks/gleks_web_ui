import type { GogTagVariant } from '@guildofgleks/ui';

export interface DemoRow {
  readonly component: string;
  readonly status: string;
  readonly owner: string | null;
  readonly updated: string;
}

export interface ServerRow {
  readonly id: number;
  readonly name: string;
  readonly team: string;
  readonly score: number;
}

export const STATUS_VARIANTS: Readonly<Record<string, GogTagVariant>> = {
  Ready: 'success',
  'In review': 'warning',
  Planned: 'info',
};

const OWNERS = ['Design', 'Forms', 'Data', 'Navigation', 'Feedback'];
const STATUSES = ['Ready', 'In review', 'Planned'];

/** Mutable arrays: `value` is typed `T[]`, and a readonly one does not type-check. */
export const ROWS: DemoRow[] = [
  { component: 'Button', status: 'Ready', owner: 'Design', updated: 'Today' },
  { component: 'Checkbox', status: 'Ready', owner: 'Forms', updated: 'Yesterday' },
  { component: 'Table', status: 'In review', owner: 'Data', updated: '2 days ago' },
  { component: 'Accordion', status: 'Planned', owner: null, updated: 'This week' },
  { component: 'Spinner', status: 'Ready', owner: 'Feedback', updated: 'This month' },
];

/** Long enough that a capped table has something to scroll. */
export const TALL_ROWS: DemoRow[] = Array.from({ length: 24 }, (_, i) => ({
  component: `Component ${i + 1} with a deliberately long name`,
  status: STATUSES[i % 3],
  owner: OWNERS[i % 5],
  updated: `${i + 1} days ago`,
}));

/**
 * 10 000 rows whose heights differ — every seventh wraps — so the window places measured rows
 * beside estimated ones, which is what a table's virtualization has to handle and a dropdown's
 * does not.
 */
export const MANY_ROWS: DemoRow[] = Array.from({ length: 10000 }, (_, i) => ({
  component:
    i % 7 === 0
      ? `Component ${i + 1} — with a long note attached that wraps across several lines in a narrow column`
      : `Component ${i + 1}`,
  status: STATUSES[i % 3],
  owner: OWNERS[i % 5],
  updated: `${(i % 30) + 1} days ago`,
}));

/**
 * Stands in for a backend: 137 rows that only ever leave this module one page at a time, sorted
 * and sliced here — `gog-table` in `lazy` mode must not re-order or re-slice what it is handed.
 */
export const SERVER_ROWS: ServerRow[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  name: `Record ${String(i + 1).padStart(3, '0')}`,
  team: ['Design', 'Forms', 'Data', 'Navigation'][i % 4],
  score: ((i * 37) % 100) + 1,
}));
