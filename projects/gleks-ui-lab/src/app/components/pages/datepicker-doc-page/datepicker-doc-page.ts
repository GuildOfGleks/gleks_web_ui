import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ExampleHostComponent } from '../../shared/example-host/example-host';
import { provideExampleSources } from '../../shared/example-sources';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';

import { DATEPICKER_EXAMPLE_SOURCES } from '../../../examples/datepicker/sources.generated';
import { DatepickerFormatExample } from '../../../examples/datepicker/datepicker-format/example';
import { DatepickerFormsExample } from '../../../examples/datepicker/datepicker-forms/example';
import { DatepickerInlineExample } from '../../../examples/datepicker/datepicker-inline/example';
import { DatepickerOverviewExample } from '../../../examples/datepicker/datepicker-overview/example';
import { DatepickerRangeExample } from '../../../examples/datepicker/datepicker-range/example';
import { DatepickerTimeExample } from '../../../examples/datepicker/datepicker-time/example';

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
    description: 'Whether the field picks one day or a start/end pair.',
  },
  {
    name: 'format',
    type: 'string | null',
    default: "GOG_CONFIG.datepicker.format ?? 'dd.MM.yyyy' (or '... HH:mm' when showTime is true)",
    description:
      'A token pattern (yyyy, MM, dd, HH, hh, mm, ss, a) used for BOTH rendering and parsing, so what is written can always be read back. Left unset, it is derived from showTime automatically; an explicit value overrides that derivation, so widen it yourself if you set one and also turn showTime on.',
  },
  {
    name: 'locale',
    type: 'string',
    default: "GOG_CONFIG.datepicker.locale ?? 'en-US'",
    description: 'BCP-47 tag driving month and weekday names, through Intl.',
  },
  {
    name: 'firstDayOfWeek',
    type: 'number',
    default: 'GOG_CONFIG.datepicker.firstDayOfWeek ?? from the locale',
    description: '0 = Sunday … 6 = Saturday.',
  },
  {
    name: 'min / max',
    type: 'Date | null',
    default: 'null',
    description: 'Selectable bounds.',
  },
  {
    name: 'disabledDates',
    type: '((date: Date) => boolean) | null',
    default: 'null',
    description: 'Extra exclusions as a predicate — an array cannot express "weekends".',
  },
  {
    name: 'defaultMonth',
    type: 'Date | null',
    default: 'null',
    description: 'Which month the panel opens on when there is no selection yet.',
  },
  {
    name: 'numberOfMonths',
    type: 'number',
    default: '1',
    description: 'Months shown side by side. Two is what makes a range picker usable.',
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
    name: 'showTodayButton / showThisMonthButton',
    type: 'boolean',
    default: 'true / false',
    description:
      'Two separate footer actions: "Today" SELECTS today; "This month" only moves the view back.',
  },
  {
    name: 'todayLabel / thisMonthLabel / openCalendarLabel / clearAriaLabel',
    type: 'string',
    default: "'Today' / 'This month' / 'Open calendar' / 'Clear date'",
    description: 'Wording for the footer actions and the two icon buttons.',
  },
  {
    name: 'allowTextInput',
    type: 'boolean',
    default: 'true',
    description:
      'Whether the date can be typed as well as picked. Parsing uses the same pattern as rendering, so 31.02.2026 is rejected rather than silently becoming 3 March.',
  },
  {
    name: 'inline',
    type: 'boolean',
    default: 'false',
    description:
      'Renders the calendar always-visible, with no field. Literally gog-calendar on its own.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'GOG_CONFIG.control.clearable ?? false',
    description: 'A clear button, shown only once a date is set.',
  },
  {
    name: 'label / ariaLabel / placeholder / inputId',
    type: 'string',
    default: "''",
    description: 'Field label, accessible name, placeholder, and an id for an external <label>.',
  },
  {
    name: 'floatLabel / floatLabelShowPlaceholder',
    type: "'none' | 'in' | 'on' | 'over' / boolean",
    default: "GOG_CONFIG.floatLabel.* ?? 'none' / false",
    description: 'Float-label variant and whether the placeholder reappears once it has floated.',
  },
  {
    name: 'errorMessage / errorDisplay',
    type: "string / 'manual' | 'auto'",
    default: "'' / GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description: 'Validation message, shown manually or derived from the bound form control.',
  },
  {
    name: 'size / disabled / fullWidth',
    type: 'GogSize / boolean / boolean',
    default: "GOG_CONFIG.control.size ?? 'md' / false / true",
    description: 'Density, disabled state, and how the field sizes itself.',
  },
  {
    name: 'appendToBody / dropdownDirection / dropdownZIndex',
    type: 'boolean / GogDropdownDirection / number | null',
    default: 'GOG_CONFIG.dropdown.* ?? component defaults',
    description:
      'Panel placement. appendToBody renders it into <body> so an overflow-clipped ancestor cannot cut it off.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'valueChange',
    type: 'Date | GogDateRange | null',
    default: '—',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

@Component({
  selector: 'app-datepicker-doc-page',
  imports: [ExampleHostComponent, ReactiveFormsModule, MarkdownComponent, RouterLink],
  providers: [provideExampleSources(DATEPICKER_EXAMPLE_SOURCES)],
  templateUrl: './datepicker-doc-page.html',
  styleUrl: './datepicker-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDocPage {
  protected readonly today = new Date();
  protected readonly weekends = (date: Date): boolean => {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
  };

  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'datepicker')?.tokens ?? [];

  protected readonly importSnippet =
    "```typescript\nimport { DatepickerComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [DatepickerComponent],\n})\n```";

  protected readonly configSnippet = [
    '```typescript',
    "import { provideGogConfig } from '@guildofgleks/ui';",
    '',
    'bootstrapApplication(App, {',
    '  providers: [',
    '    provideGogConfig({',
    '      datepicker: {',
    "        locale: 'de-DE',",
    '        firstDayOfWeek: 1,',
    "        format: 'dd.MM.yyyy',",
    '      },',
    '    }),',
    '  ],',
    '});',
    '```',
  ].join('\n');

  /** Each example is a file under `src/app/examples/datepicker/` — see docs/lab-examples-refactor.md. */
  protected readonly examples = {
    format: DatepickerFormatExample,
    forms: DatepickerFormsExample,
    inline: DatepickerInlineExample,
    overview: DatepickerOverviewExample,
    range: DatepickerRangeExample,
    time: DatepickerTimeExample,
  };
}
