// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an example in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import type { ExampleSource } from '../../components/shared/example-sources';

import { CalendarDisabledExample } from './calendar-disabled/example';
import { CalendarLocaleExample } from './calendar-locale/example';
import { CalendarOverviewExample } from './calendar-overview/example';
import { CalendarRangeExample } from './calendar-range/example';
import { CalendarTimeExample } from './calendar-time/example';

/** The three files of each example in this folder, keyed by the example component itself. */
export const CALENDAR_EXAMPLE_SOURCES: ReadonlyMap<unknown, ExampleSource> = new Map<
  unknown,
  ExampleSource
>([
  [
    CalendarDisabledExample,
    {
      html: '<div class="example">\n  <gog-calendar [disabledDates]="weekends" [(value)]="workday" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CalendarComponent],\n})\nexport class CalendarDisabledExample {\n  protected readonly workday = signal<GogDatepickerValue>(null);\n\n  // A predicate, not an array — \"weekends\" has no finite list.\n  protected readonly weekends = (date: Date): boolean => {\n    const weekday = date.getDay();\n    return weekday === 0 || weekday === 6;\n  };\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CalendarLocaleExample,
    {
      html: '<div class="example">\n  <gog-calendar locale="de-DE" [firstDayOfWeek]="1" />\n</div>',
      ts: "import { Component } from '@angular/core';\nimport { CalendarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CalendarComponent],\n})\nexport class CalendarLocaleExample {}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CalendarOverviewExample,
    {
      html: '<div class="example">\n  <gog-calendar [(value)]="day" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CalendarComponent],\n})\nexport class CalendarOverviewExample {\n  protected readonly day = signal<GogDatepickerValue>(new Date());\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CalendarRangeExample,
    {
      html: '<div class="example">\n  <gog-calendar selectionMode="range" [numberOfMonths]="2" [(value)]="range" />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CalendarComponent],\n})\nexport class CalendarRangeExample {\n  // In range mode the value is a { start, end } pair.\n  protected readonly range = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
  [
    CalendarTimeExample,
    {
      html: '<div class="example">\n  <gog-calendar\n    [showTime]="true"\n    hourFormat="24"\n    [minuteStep]="15"\n    [showThisMonthButton]="true"\n    [(value)]="moment"\n  />\n</div>',
      ts: "import { Component, signal } from '@angular/core';\nimport { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  templateUrl: './example.html',\n  styleUrl: './example.css',\n  imports: [CalendarComponent],\n})\nexport class CalendarTimeExample {\n  protected readonly moment = signal<GogDatepickerValue>(null);\n}",
      css: '/* This example needs no layout of its own. */',
    },
  ],
]);
