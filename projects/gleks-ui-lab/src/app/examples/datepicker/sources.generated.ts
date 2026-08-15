// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { DatepickerFormatExample } from './datepicker-format.example';
import { DatepickerFormsExample } from './datepicker-forms.example';
import { DatepickerInlineExample } from './datepicker-inline.example';
import { DatepickerOverviewExample } from './datepicker-overview.example';
import { DatepickerRangeExample } from './datepicker-range.example';
import { DatepickerTimeExample } from './datepicker-time.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const DATEPICKER_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    DatepickerFormatExample,
    'import { Component, signal } from \'@angular/core\';\nimport { DatepickerComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DatepickerComponent],\n  template: `<gog-datepicker label="ISO" format="yyyy-MM-dd" [(value)]="isoDate" />`,\n})\nexport class DatepickerFormatExample {\n  protected readonly isoDate = signal<GogDatepickerValue>(null);\n}',
  ],
  [
    DatepickerFormsExample,
    'import { Component } from \'@angular/core\';\nimport { FormControl, ReactiveFormsModule, Validators } from \'@angular/forms\';\nimport { DatepickerComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DatepickerComponent, ReactiveFormsModule],\n  template: `\n    <gog-datepicker\n      label="Deadline"\n      errorDisplay="auto"\n      errorMessage="A deadline is required"\n      [clearable]="true"\n      [disabledDates]="weekends"\n      [formControl]="deadline"\n    />\n  `,\n})\nexport class DatepickerFormsExample {\n  protected readonly deadline = new FormControl<Date | null>(null, Validators.required);\n\n  protected readonly weekends = (date: Date): boolean => {\n    const weekday = date.getDay();\n    return weekday === 0 || weekday === 6;\n  };\n}',
  ],
  [
    DatepickerInlineExample,
    "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [DatepickerComponent],\n  template: `<gog-datepicker [inline]=\"true\" [(value)]=\"inlineDate\" />`,\n})\nexport class DatepickerInlineExample {\n  protected readonly inlineDate = signal<GogDatepickerValue>(null);\n}",
  ],
  [
    DatepickerOverviewExample,
    'import { Component, signal } from \'@angular/core\';\nimport { DatepickerComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DatepickerComponent],\n  template: `<gog-datepicker label="Date of birth" [max]="today" [(value)]="birthday" />`,\n})\nexport class DatepickerOverviewExample {\n  protected readonly today = new Date();\n  protected readonly birthday = signal<GogDatepickerValue>(null);\n}',
  ],
  [
    DatepickerRangeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { DatepickerComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DatepickerComponent],\n  template: `\n    <gog-datepicker label="Stay" selectionMode="range" [numberOfMonths]="2" [(value)]="stay" />\n  `,\n})\nexport class DatepickerRangeExample {\n  protected readonly stay = signal<GogDatepickerValue>(null);\n}',
  ],
  [
    DatepickerTimeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { DatepickerComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [DatepickerComponent],\n  template: `\n    <gog-datepicker\n      label="Meeting"\n      format="dd.MM.yyyy HH:mm"\n      [showTime]="true"\n      [minuteStep]="15"\n      [(value)]="meeting"\n    />\n  `,\n})\nexport class DatepickerTimeExample {\n  protected readonly meeting = signal<GogDatepickerValue>(null);\n}',
  ],
]);
