import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';
import { CodeTabsComponent } from '../../shared/code-tabs/code-tabs';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly default: string;
  readonly description: string;
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
    type: 'string',
    default: "GOG_CONFIG.datepicker.locale ?? 'en-US'",
    description: 'BCP-47 tag driving month and weekday names, through Intl.',
  },
  {
    name: 'firstDayOfWeek',
    type: 'number | null',
    default: 'null',
    description: '0 = Sunday … 6 = Saturday. Unset, it comes from the locale.',
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
    type: 'string',
    default: "'Today' / 'This month'",
    description: 'Wording for the two footer actions.',
  },
  {
    name: 'previousMonthLabel / nextMonthLabel / previousYearLabel / nextYearLabel',
    type: 'string',
    default: "'Previous month' / 'Next month' / 'Previous year' / 'Next year'",
    description: 'Accessible names for the navigation buttons.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogDateSelect',
    type: 'Date | GogDateRange | null',
    default: '—',
    description: 'Emitted when a day is picked.',
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
  imports: [CalendarComponent, MarkdownComponent, CodeTabsComponent, RouterLink],
  templateUrl: './calendar-doc-page.html',
  styleUrl: './calendar-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDocPage {
  protected readonly day = signal<GogDatepickerValue>(new Date());
  protected readonly range = signal<GogDatepickerValue>(null);
  protected readonly workday = signal<GogDatepickerValue>(null);
  protected readonly moment = signal<GogDatepickerValue>(null);

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

  protected readonly overviewHtml = '<gog-calendar [(value)]="day" />';
  protected readonly overviewTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CalendarComponent],',
    '  template: `<gog-calendar [(value)]="day" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly day = signal<GogDatepickerValue>(new Date());',
    '}',
  ].join('\n');

  protected readonly rangeHtml = [
    '<gog-calendar selectionMode="range" [numberOfMonths]="2" [(value)]="range" />',
  ].join('\n');
  protected readonly rangeTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CalendarComponent],',
    '  template: `',
    '    <gog-calendar selectionMode="range" [numberOfMonths]="2" [(value)]="range" />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  // In range mode the value is a { start, end } pair.',
    '  protected readonly range = signal<GogDatepickerValue>(null);',
    '}',
  ].join('\n');

  protected readonly disabledHtml = [
    '<gog-calendar [disabledDates]="weekends" [(value)]="workday" />',
  ].join('\n');
  protected readonly disabledTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CalendarComponent],',
    '  template: `<gog-calendar [disabledDates]="weekends" [(value)]="workday" />`,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly workday = signal<GogDatepickerValue>(null);',
    '',
    '  // A predicate, not an array — "weekends" has no finite list.',
    '  protected readonly weekends = (date: Date): boolean => {',
    '    const weekday = date.getDay();',
    '    return weekday === 0 || weekday === 6;',
    '  };',
    '}',
  ].join('\n');

  protected readonly timeHtml = [
    '<gog-calendar',
    '  [showTime]="true"',
    '  hourFormat="24"',
    '  [minuteStep]="15"',
    '  [showThisMonthButton]="true"',
    '  [(value)]="moment"',
    '/>',
  ].join('\n');
  protected readonly timeTs = [
    "import { Component, signal } from '@angular/core';",
    "import { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CalendarComponent],',
    '  template: `',
    '    <gog-calendar',
    '      [showTime]="true"',
    '      hourFormat="24"',
    '      [minuteStep]="15"',
    '      [showThisMonthButton]="true"',
    '      [(value)]="moment"',
    '    />',
    '  `,',
    '})',
    'export class ExampleComponent {',
    '  protected readonly moment = signal<GogDatepickerValue>(null);',
    '}',
  ].join('\n');

  protected readonly localeHtml = [
    '<gog-calendar locale="de-DE" [firstDayOfWeek]="1" />',
    '<gog-calendar locale="ja-JP" />',
  ].join('\n');
  protected readonly localeTs = [
    "import { Component } from '@angular/core';",
    "import { CalendarComponent } from '@guildofgleks/ui';",
    '',
    '@Component({',
    "  selector: 'app-example',",
    '  imports: [CalendarComponent],',
    '  template: `',
    '    <gog-calendar locale="de-DE" [firstDayOfWeek]="1" />',
    '  `,',
    '})',
    'export class ExampleComponent {}',
  ].join('\n');

  protected formatValue(value: GogDatepickerValue): string {
    if (value === null) return 'null';
    if (value instanceof Date) return value.toDateString();
    const start = value.start ? value.start.toDateString() : '—';
    const end = value.end ? value.end.toDateString() : '—';
    return `${start} → ${end}`;
  }
}
