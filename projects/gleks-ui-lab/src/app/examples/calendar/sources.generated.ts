// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { CalendarDisabledExample } from './calendar-disabled.example';
import { CalendarLocaleExample } from './calendar-locale.example';
import { CalendarOverviewExample } from './calendar-overview.example';
import { CalendarRangeExample } from './calendar-range.example';
import { CalendarTimeExample } from './calendar-time.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const CALENDAR_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    CalendarDisabledExample,
    'import { Component, signal } from \'@angular/core\';\nimport { CalendarComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [CalendarComponent],\n  template: `<gog-calendar [disabledDates]="weekends" [(value)]="workday" />`,\n})\nexport class CalendarDisabledExample {\n  protected readonly workday = signal<GogDatepickerValue>(null);\n\n  // A predicate, not an array — "weekends" has no finite list.\n  protected readonly weekends = (date: Date): boolean => {\n    const weekday = date.getDay();\n    return weekday === 0 || weekday === 6;\n  };\n}',
  ],
  [
    CalendarLocaleExample,
    "import { Component } from '@angular/core';\nimport { CalendarComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CalendarComponent],\n  template: ` <gog-calendar locale=\"de-DE\" [firstDayOfWeek]=\"1\" /> `,\n})\nexport class CalendarLocaleExample {}",
  ],
  [
    CalendarOverviewExample,
    "import { Component, signal } from '@angular/core';\nimport { CalendarComponent, GogDatepickerValue } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [CalendarComponent],\n  template: `<gog-calendar [(value)]=\"day\" />`,\n})\nexport class CalendarOverviewExample {\n  protected readonly day = signal<GogDatepickerValue>(new Date());\n}",
  ],
  [
    CalendarRangeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { CalendarComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [CalendarComponent],\n  template: ` <gog-calendar selectionMode="range" [numberOfMonths]="2" [(value)]="range" /> `,\n})\nexport class CalendarRangeExample {\n  // In range mode the value is a { start, end } pair.\n  protected readonly range = signal<GogDatepickerValue>(null);\n}',
  ],
  [
    CalendarTimeExample,
    'import { Component, signal } from \'@angular/core\';\nimport { CalendarComponent, GogDatepickerValue } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [CalendarComponent],\n  template: `\n    <gog-calendar\n      [showTime]="true"\n      hourFormat="24"\n      [minuteStep]="15"\n      [showThisMonthButton]="true"\n      [(value)]="moment"\n    />\n  `,\n})\nexport class CalendarTimeExample {\n  protected readonly moment = signal<GogDatepickerValue>(null);\n}',
  ],
]);
