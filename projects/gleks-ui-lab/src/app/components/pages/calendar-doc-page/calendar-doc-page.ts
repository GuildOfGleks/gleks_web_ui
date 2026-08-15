import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogDatepickerValue } from '@guildofgleks/ui';
import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { CALENDAR_EXAMPLE_SOURCES } from '../../../examples/calendar/sources.generated';
import { CalendarDisabledExample } from '../../../examples/calendar/calendar-disabled/example';
import { CalendarLocaleExample } from '../../../examples/calendar/calendar-locale/example';
import { CalendarOverviewExample } from '../../../examples/calendar/calendar-overview/example';
import { CalendarRangeExample } from '../../../examples/calendar/calendar-range/example';
import { CalendarTimeExample } from '../../../examples/calendar/calendar-time/example';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
  readonly since?: string;
}

const API_INPUTS: readonly ApiRow[] = [
  {
    name: 'value',
    type: 'Date | GogDateRange | null',
    default: 'null',
    description:
      'The selection: a Date in single mode, a { start, end } pair in range mode. Two-way bindable with [(value)].',
  },
  {
    name: 'selectionMode',
    type: "'single' | 'range'",
    default: "'single'",
    description: 'Whether the grid picks one day or a start/end pair.',
  },
  {
    name: 'min / max',
    type: 'Date | null',
    default: 'null',
    description: 'Selectable bounds. Days outside them are disabled, not hidden.',
  },
  {
    name: 'disabledDates',
    type: '((date: Date) => boolean) | null',
    default: 'null',
    description:
      'Extra exclusions, as a predicate rather than a list — an array cannot express "weekends" or "public holidays" without materialising every date in range first.',
  },
  {
    name: 'locale',
    type: 'string | undefined',
    default: "'en-US'",
    description:
      'BCP-47 tag driving month and weekday names, through Intl. Unset, falls back to GOG_CONFIG.datepicker.locale — the calendar resolves it itself, with no datepicker involved.',
  },
  {
    name: 'firstDayOfWeek',
    type: 'number | undefined',
    default: "the locale's own",
    description:
      '0 = Sunday … 6 = Saturday. Unset, falls back to GOG_CONFIG.datepicker.firstDayOfWeek, then to the locale.',
  },
  {
    name: 'defaultMonth',
    type: 'Date | null',
    default: 'null',
    description: 'Which month to open on when there is no selection yet.',
  },
  {
    name: 'numberOfMonths',
    type: 'number',
    default: '1',
    description: 'How many months to show side by side. Two is what makes a range usable.',
  },
  {
    name: 'showTime',
    type: 'boolean',
    default: 'false',
    description: 'Adds a clock under the grid.',
  },
  {
    name: 'hourFormat / minuteStep / showSeconds',
    type: "'12' | '24' / number / boolean",
    default: "'24' / 1 / false",
    description: 'How that clock is configured.',
  },
  {
    name: 'showTodayButton',
    type: 'boolean',
    default: 'true',
    description:
      'The "Today" button, which SELECTS today. Disabled when min/max or disabledDates rule today out, rather than silently doing nothing.',
  },
  {
    name: 'showThisMonthButton',
    type: 'boolean',
    default: 'false',
    description:
      'The "This month" button, which only moves the VIEW back and leaves the selection alone.',
  },
  {
    name: 'size',
    type: "'xsm' | 'sm' | 'md' | 'lg' | 'slg'",
    default: "'md'",
    description: 'Day-cell and typography scale.',
  },
  {
    name: 'todayLabel / thisMonthLabel',
    type: 'string | undefined',
    default: "'Today' / 'This month'",
    description:
      'Wording for the two footer actions. Also settable app-wide via GOG_CONFIG.labels.',
  },
  {
    name: 'previousMonthLabel / nextMonthLabel / previousYearLabel / nextYearLabel',
    type: 'string | undefined',
    default: "'Previous month' / 'Next month' / 'Previous year' / 'Next year'",
    description:
      'Accessible names for the navigation buttons. Also settable app-wide via GOG_CONFIG.labels.',
  },
  {
    name: 'hoursLabel / minutesLabel / secondsLabel',
    type: 'string | undefined',
    default: "'Hours' / 'Minutes' / 'Seconds'",
    description:
      "Accessible names for the time section's three spinners (with showTime). Also settable app-wide via GOG_CONFIG.labels.",
    since: '21.3.2',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogDateSelect',
    type: 'Date | GogDateRange | null',
    default: '—',
    description:
      'Emitted when a selection is complete — a day in single mode, both ends of a range in range mode. Picking just the first end of a range does not emit.',
  },
  {
    name: 'valueChange',
    type: 'Date | GogDateRange | null',
    default: '—',
    description: 'The value model’s change event, for [(value)].',
  },
];

@Component({
  selector: 'app-calendar-doc-page',
  imports: [ExampleHostComponent, MarkdownComponent, RouterLink, SinceBadgeComponent],
  providers: [provideExampleSources(CALENDAR_EXAMPLE_SOURCES)],
  templateUrl: './calendar-doc-page.html',
  styleUrl: './calendar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDocPage {
  protected readonly day = signal<GogDatepickerValue>(new Date());
  protected readonly range = signal<GogDatepickerValue>(null);
  /** Weekends are the textbook case an array of dates cannot express. */
  protected readonly weekends = (date: Date): boolean => {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'calendar')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { CalendarComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [CalendarComponent],\n})\n```";

  /** Each example is a file under `src/app/examples/calendar/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    disabled: CalendarDisabledExample,
    locale: CalendarLocaleExample,
    overview: CalendarOverviewExample,
    range: CalendarRangeExample,
    time: CalendarTimeExample,
  };
}
