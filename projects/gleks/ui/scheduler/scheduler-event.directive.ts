import { Directive, TemplateRef, inject, input } from '@angular/core';

import type { GogSchedulerView } from '@guildofgleks/ui/shared';

/** What a `gogSchedulerEvent` template is handed for each event it draws. */
export interface GogSchedulerEventContext<T> {
  /** The consumer's own event object. */
  $implicit: T;
  event: T;
  /** As read through `eventTitle`. */
  title: string;
  /** The event's own instants, as read through `eventStart` and `eventEnd`. */
  start: Date;
  end: Date;
  allDay: boolean;
  /**
   * The event's time on the scheduler's clock ("09:00 – 10:30"), in its locale and zone, or `''`
   * for an all-day event. Prefer it to formatting `start` yourself: `start.getHours()` reads the
   * browser's zone, which is not the scheduler's when `timeZone` is set.
   */
  time: string;
  /** The view drawing it — a month cell has a line of room, a week column has more. */
  view: GogSchedulerView;
}

/**
 * Custom markup inside each event, in every view:
 *
 * ```html
 * <gog-scheduler [events]="bookings()">
 *   <ng-template gogSchedulerEvent let-booking let-time="time" [gogSchedulerEventTypeOf]="bookings()">
 *     <strong>{{ booking.room }}</strong> {{ time }}
 *   </ng-template>
 * </gog-scheduler>
 * ```
 *
 * The template fills the event's button; the button itself — its colour, its name, its keyboard
 * handling — stays the scheduler's. Keep it to text and icons: the button is already interactive,
 * and a control inside it would be a control inside a control.
 */
@Directive({ selector: '[gogSchedulerEvent]' })
export class GogSchedulerEventDirective<T = unknown> {
  readonly templateRef = inject<TemplateRef<GogSchedulerEventContext<T>>>(TemplateRef);

  /**
   * Types the template's context; never read at runtime. Bind the same array as the scheduler's
   * `events` and `let-event` is checked against it.
   */
  readonly gogSchedulerEventTypeOf = input<readonly T[]>();

  static ngTemplateContextGuard<T>(
    _dir: GogSchedulerEventDirective<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only used as a type guard
    ctx: unknown,
  ): ctx is GogSchedulerEventContext<T> {
    return true;
  }
}
