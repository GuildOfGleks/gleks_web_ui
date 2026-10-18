/*
 * `@guildofgleks/ui/scheduler` -- `gog-scheduler`, its event slot and the layout behind it.
 *
 * Its own entry point from the start (21.20.0), for the reason the table, datepicker and dialog
 * have theirs: a scheduler is a large component that usually lives on one route, and a root that
 * exported it would put it in the initial bundle of every app that imports anything from the
 * root (docs/entry-points.md, Part 2, finding 2).
 *
 * The code here imports the rest of the library from `@guildofgleks/ui` and never the reverse --
 * `check:layering` rule D.
 */
export { SchedulerComponent } from './scheduler.component';
export type {
  GogSchedulerEventChange,
  GogSchedulerEventClick,
  GogSchedulerRange,
  GogSchedulerSlot,
} from './scheduler.component';
export { GogSchedulerEventDirective } from './scheduler-event.directive';
export type { GogSchedulerEventContext } from './scheduler-event.directive';
export type { GogSchedulerMoreAction, GogSchedulerView } from '@guildofgleks/ui/shared';
