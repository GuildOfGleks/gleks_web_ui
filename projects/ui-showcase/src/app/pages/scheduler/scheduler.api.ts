import { GogSchedulerEventDirective, SchedulerComponent } from '@guildofgleks/ui/scheduler';

import type { DocApi } from '../../doc/doc-api';

export const SCHEDULER_API: readonly DocApi[] = [
  {
    type: SchedulerComponent,
    inputs: [
      { name: 'events', type: 'readonly T[]', default: '[]' },
      {
        name: 'eventStart',
        type: 'GogOptionAccessor<T, Date | string | number | null | undefined>',
        default: "'start'",
      },
      {
        name: 'eventEnd',
        type: 'GogOptionAccessor<T, Date | string | number | null | undefined>',
        default: "'end'",
      },
      {
        name: 'eventTitle',
        type: 'GogOptionAccessor<T, string | null | undefined>',
        default: "'title'",
      },
      {
        name: 'eventAllDay',
        type: 'GogOptionAccessor<T, boolean | null | undefined>',
        default: "'allDay'",
      },
      {
        name: 'eventVariant',
        type: 'GogOptionAccessor<T, GogSeverity | null | undefined>',
        default: "'variant'",
      },
      { name: 'view', type: 'GogSchedulerView (model)', default: "'month'" },
      { name: 'views', type: 'readonly GogSchedulerView[]', default: "['month', 'week', 'day']" },
      { name: 'date', type: 'Date | null (model)', default: 'null (today)' },
      { name: 'dayStartHour', type: 'number', default: '0' },
      { name: 'dayEndHour', type: 'number', default: '24' },
      { name: 'slotDuration', type: 'number (minutes)', default: '30' },
      { name: 'scrollToHour', type: 'number', default: '8' },
      {
        name: 'monthEventLimit',
        type: 'number | undefined',
        default: '3',
        config: 'GOG_CONFIG.scheduler.monthEventLimit',
      },
      {
        name: 'moreEventsAction',
        type: 'GogSchedulerMoreAction | undefined',
        default: "'popover'",
        config: 'GOG_CONFIG.scheduler.moreEventsAction',
      },
      {
        name: 'readonly',
        type: 'boolean | undefined',
        default: 'true',
        config: 'GOG_CONFIG.scheduler.readonly',
      },
      {
        name: 'locale',
        type: 'string | undefined',
        default: "'en-US'",
        config: 'GOG_CONFIG.datepicker.locale',
      },
      {
        name: 'firstDayOfWeek',
        type: 'number | undefined',
        default: "the locale's own",
        config: 'GOG_CONFIG.datepicker.firstDayOfWeek',
      },
      {
        name: 'timeZone',
        type: 'string | undefined',
        default: "the browser's own",
        config: 'GOG_CONFIG.datepicker.timeZone',
      },
      { name: 'ariaLabel', type: 'string', default: "'' (named by its title)" },
    ],
    outputs: [
      { name: 'viewChange', payload: 'GogSchedulerView' },
      { name: 'dateChange', payload: 'Date | null' },
      { name: 'gogEventClick', payload: 'GogSchedulerEventClick<T>' },
      { name: 'gogSlotClick', payload: 'GogSchedulerSlot' },
      { name: 'gogRangeChange', payload: 'GogSchedulerRange' },
      { name: 'gogEventCreate', payload: 'GogSchedulerSlot' },
      { name: 'gogEventDelete', payload: 'GogSchedulerEventClick<T>' },
      { name: 'gogEventChange', payload: 'GogSchedulerEventChange<T>' },
    ],
  },
  {
    type: GogSchedulerEventDirective,
    inputs: [{ name: 'gogSchedulerEventTypeOf', type: 'readonly T[]', default: 'undefined' }],
    outputs: [],
  },
];
