import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { DATEPICKER_EXAMPLES } from '../../../examples/datepicker/sources.generated';
import { DatepickerAppendToBodyExample } from '../../../examples/datepicker/datepicker-append-to-body/example';
import { DatepickerAriaLabelExample } from '../../../examples/datepicker/datepicker-aria-label/example';
import { DatepickerBoundsExample } from '../../../examples/datepicker/datepicker-bounds/example';
import { DatepickerClearableExample } from '../../../examples/datepicker/datepicker-clearable/example';
import { DatepickerConfigExample } from '../../../examples/datepicker/datepicker-config/example';
import { DatepickerFloatLabelExample } from '../../../examples/datepicker/datepicker-float-label/example';
import { DatepickerFormsExample } from '../../../examples/datepicker/datepicker-forms/example';
import { DatepickerInlineExample } from '../../../examples/datepicker/datepicker-inline/example';
import { DatepickerLabelsExample } from '../../../examples/datepicker/datepicker-labels/example';
import { DatepickerLocaleExample } from '../../../examples/datepicker/datepicker-locale/example';
import { DatepickerOverviewExample } from '../../../examples/datepicker/datepicker-overview/example';
import { DatepickerRangeExample } from '../../../examples/datepicker/datepicker-range/example';
import { DatepickerSingleExample } from '../../../examples/datepicker/datepicker-single/example';
import { DatepickerSizesExample } from '../../../examples/datepicker/datepicker-sizes/example';
import { DatepickerStatesExample } from '../../../examples/datepicker/datepicker-states/example';
import { DatepickerTimeExample } from '../../../examples/datepicker/datepicker-time/example';
import { DatepickerTypingExample } from '../../../examples/datepicker/datepicker-typing/example';
import { DatepickerWidthExample } from '../../../examples/datepicker/datepicker-width/example';

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
    name: 'previousMonthLabel / nextMonthLabel / previousYearLabel / nextYearLabel / hoursLabel / minutesLabel / secondsLabel',
    type: 'string | undefined',
    default: 'GOG_CONFIG.labels.*',
    description:
      "Accessible names for the panel calendar's navigation arrows and time inputs, handed to the calendar inside the field. Before 21.15.0 the field forwarded only todayLabel and thisMonthLabel, so these could be set only app-wide — two fields in different languages on one page could not be.",
    since: '21.15.0',
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
    description:
      'Emitted when the value changes — including a half-picked range and typed text. Comes from the value model input.',
  },
  {
    name: 'gogDateSelect',
    type: 'GogDatepickerValue',
    description:
      'A complete selection made in the calendar: a day in single mode, both ends of a range. The event the panel closes on — bind it for "the user has finished choosing" rather than inspecting a half-picked value.',
    since: '21.15.0',
  },
];

@Component({
  selector: 'app-datepicker-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './datepicker-doc-page.html',
  styleUrl: './datepicker-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDocPage {
  protected readonly apiInputs = API_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'datepicker')?.tokens ?? [];

  protected readonly sources = DATEPICKER_EXAMPLES;
  protected readonly examples = {
    overview: DatepickerOverviewExample,
    sizes: DatepickerSizesExample,
    states: DatepickerStatesExample,
    clearable: DatepickerClearableExample,
    width: DatepickerWidthExample,
    ariaLabel: DatepickerAriaLabelExample,
    single: DatepickerSingleExample,
    range: DatepickerRangeExample,
    bounds: DatepickerBoundsExample,
    time: DatepickerTimeExample,
    typing: DatepickerTypingExample,
    locale: DatepickerLocaleExample,
    labels: DatepickerLabelsExample,
    appendToBody: DatepickerAppendToBodyExample,
    inline: DatepickerInlineExample,
    floatLabel: DatepickerFloatLabelExample,
    forms: DatepickerFormsExample,
    config: DatepickerConfigExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { DatepickerComponent } from '@guildofgleks/ui/datepicker';\n\n@Component({\n  // ...\n  imports: [DatepickerComponent],\n})\n```";
}
