// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { DatepickerFormatExample } from './datepicker-format/example';
import { DatepickerFormsExample } from './datepicker-forms/example';
import { DatepickerInlineExample } from './datepicker-inline/example';
import { DatepickerOverviewExample } from './datepicker-overview/example';
import { DatepickerRangeExample } from './datepicker-range/example';
import { DatepickerTimeExample } from './datepicker-time/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const DATEPICKER_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    DatepickerFormatExample,
    {
      html: '<div class="example">\n  <gog-datepicker label="ISO" format="yyyy-MM-dd" [(value)]="isoDate" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent],\n})\nexport class DatepickerFormatExample {\n  protected readonly isoDate = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    DatepickerFormsExample,
    {
      html: '<div class="example">\n  <gog-datepicker\n    label="Deadline"\n    errorDisplay="auto"\n    errorMessage="A deadline is required"\n    [clearable]="true"\n    [disabledDates]="weekends"\n    [formControl]="deadline"\n  />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';\nimport { DatepickerComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent, ReactiveFormsModule],\n})\nexport class DatepickerFormsExample {\n  protected readonly deadline = new FormControl<Date | null>(null, Validators.required);\n\n  protected readonly weekends = (date: Date): boolean => {\n    const weekday = date.getDay();\n    return weekday === 0 || weekday === 6;\n  };\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    DatepickerInlineExample,
    {
      html: '<div class="example">\n  <gog-datepicker [inline]="true" [(value)]="inlineDate" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent],\n})\nexport class DatepickerInlineExample {\n  protected readonly inlineDate = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    DatepickerOverviewExample,
    {
      html: '<div class="example">\n  <gog-datepicker label="Date of birth" [max]="today" [(value)]="birthday" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent],\n})\nexport class DatepickerOverviewExample {\n  protected readonly today = new Date();\n  protected readonly birthday = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    DatepickerRangeExample,
    {
      html: '<div class="example">\n  <gog-datepicker label="Stay" selectionMode="range" [numberOfMonths]="2" [(value)]="stay" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent],\n})\nexport class DatepickerRangeExample {\n  protected readonly stay = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    DatepickerTimeExample,
    {
      html: '<div class="example">\n  <gog-datepicker\n    label="Meeting"\n    format="dd.MM.yyyy HH:mm"\n    [showTime]="true"\n    [minuteStep]="15"\n    [(value)]="meeting"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { DatepickerComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [DatepickerComponent],\n})\nexport class DatepickerTimeExample {\n  protected readonly meeting = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
]);
