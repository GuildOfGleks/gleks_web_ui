import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { formatDate, startOfDay, type GogSeverity } from '@guildofgleks/ui';
import {
  GogSchedulerEventDirective,
  SchedulerComponent,
  type GogSchedulerEventChange,
  type GogSchedulerEventClick,
  type GogSchedulerRange,
  type GogSchedulerSlot,
  type GogSchedulerView,
} from '@guildofgleks/ui/scheduler';

import { DocAttrs } from '../../doc/doc-attrs';
import { DocPage } from '../../doc/doc-page';
import { DocSection } from '../../doc/doc-section';

interface Booking {
  title: string;
  room: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  variant?: GogSeverity;
}

/** Today, so the demo always has events in the week and month it opens on. */
const TODAY = startOfDay(new Date());
const on = (day: number, hour: number, minute = 0) =>
  new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + day, hour, minute);

const BOOKINGS: readonly Booking[] = [
  { title: 'Standup', room: 'Atrium', start: on(0, 9), end: on(0, 9, 15) },
  { title: 'Design review', room: 'Loft', start: on(0, 10), end: on(0, 11, 30), variant: 'info' },
  { title: 'Hiring panel', room: 'Loft', start: on(0, 11), end: on(0, 12), variant: 'warning' },
  { title: 'Release', room: 'Ops', start: on(1, 14), end: on(1, 16), variant: 'success' },
  { title: 'Offsite', room: 'Lakeside', start: on(2, 0), end: on(4, 0), allDay: true },
  { title: 'Incident review', room: 'Ops', start: on(3, 15), end: on(3, 16), variant: 'danger' },
  { title: 'Night deploy', room: 'Ops', start: on(4, 22), end: on(5, 2) },
  { title: 'Standup', room: 'Atrium', start: on(5, 9), end: on(5, 9, 15) },
  { title: '1:1', room: 'Booth', start: on(5, 9), end: on(5, 9, 30) },
  { title: 'Lunch & learn', room: 'Atrium', start: on(5, 12), end: on(5, 13) },
  { title: 'Retro', room: 'Loft', start: on(5, 16), end: on(5, 17) },
];

@Component({
  selector: 'app-scheduler-page',
  imports: [SchedulerComponent, GogSchedulerEventDirective, DocAttrs, DocPage, DocSection],
  templateUrl: './scheduler-page.html',
  styleUrl: './scheduler-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerPage {
  protected readonly bookings = BOOKINGS;
  protected readonly today = TODAY;
  protected readonly view = signal<GogSchedulerView>('week');
  protected readonly date = signal<Date | null>(null);
  protected readonly log = signal<string[]>([]);

  /** The editing demo's own copy, which its three handlers change. */
  protected readonly editable = signal<Booking[]>(BOOKINGS.map((booking) => ({ ...booking })));
  protected readonly editLog = signal<string[]>([]);

  protected create(slot: GogSchedulerSlot): void {
    this.editable.update((list) => [
      ...list,
      { title: 'New event', room: '—', start: slot.start, end: slot.end, allDay: slot.allDay },
    ]);
    this.recordEdit(`gogEventCreate: ${this.time(slot.start)}${slot.allDay ? ', all day' : ''}`);
  }

  protected remove(click: GogSchedulerEventClick<Booking>): void {
    this.editable.update((list) => list.filter((booking) => booking !== click.event));
    this.recordEdit(`gogEventDelete: ${click.event.title}`);
  }

  protected change(change: GogSchedulerEventChange<Booking>): void {
    this.editable.update((list) =>
      list.map((booking) =>
        booking === change.event ? { ...booking, start: change.start, end: change.end } : booking,
      ),
    );
    this.recordEdit(
      `gogEventChange (${change.change}): ${change.event.title} → ${this.time(change.start)} – ${this.time(change.end)}`,
    );
  }

  private recordEdit(line: string): void {
    this.editLog.update((lines) => [line, ...lines].slice(0, 6));
  }

  /** 13:00 UTC tomorrow — one instant, drawn in two zones below. */
  protected readonly zoned: readonly Booking[] = [
    {
      title: 'Global sync',
      room: 'Video',
      start: new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1, 13)),
      end: new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1, 14)),
    },
  ];

  protected onEvent(click: GogSchedulerEventClick<Booking>): void {
    this.record(`gogEventClick: ${click.event.title} (${this.time(click.start)})`);
  }

  protected onSlot(slot: GogSchedulerSlot): void {
    this.record(
      `gogSlotClick: ${this.time(slot.start)} → ${this.time(slot.end)}${slot.allDay ? ', all day' : ''}`,
    );
  }

  protected onRange(range: GogSchedulerRange): void {
    this.record(
      `gogRangeChange: ${range.view}, ${this.time(range.start)} → ${this.time(range.end)}`,
    );
  }

  private time(date: Date): string {
    return formatDate(date, 'dd.MM.yyyy HH:mm');
  }

  private record(line: string): void {
    this.log.update((lines) => [line, ...lines].slice(0, 6));
  }
}
