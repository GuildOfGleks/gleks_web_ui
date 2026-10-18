import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import type { GogSchedulerView } from '@guildofgleks/ui/shared';
import { GogSchedulerEventDirective } from './scheduler-event.directive';
import {
  SchedulerComponent,
  type GogSchedulerEventChange,
  type GogSchedulerEventClick,
  type GogSchedulerRange,
  type GogSchedulerSlot,
} from './scheduler.component';

interface Booking {
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  variant?: string;
}

/** Wednesday 17 June 2026, local wall time, so the specs hold in any runner zone. */
const at = (day: number, hour = 0, minute = 0) => new Date(2026, 5, day, hour, minute);

describe('SchedulerComponent', () => {
  let fixture: ComponentFixture<SchedulerComponent<Booking>>;
  let component: SchedulerComponent<Booking>;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function all<E extends Element = HTMLElement>(selector: string): E[] {
    return Array.from(host().querySelectorAll<E>(selector));
  }

  function title(): string {
    return host().querySelector('.gog-scheduler__title')?.textContent?.trim() ?? '';
  }

  /** A month cell's day button, by its day of the month, skipping the neighbouring months. */
  function dayButton(day: number): HTMLButtonElement {
    return all<HTMLButtonElement>('.gog-scheduler__day:not(.gog-scheduler__day--outside)').find(
      (button) => button.textContent?.trim() === String(day),
    )!;
  }

  /** The event buttons drawn over a month day: every bar whose span covers it. */
  function eventsOn(day: number): HTMLButtonElement[] {
    const key = Number(dayButton(day).dataset['day']);
    const week = dayButton(day).closest('.gog-scheduler__week')!;
    return Array.from(week.querySelectorAll<HTMLButtonElement>('.gog-scheduler__event')).filter(
      (bar) => {
        const first = Number(bar.dataset['day']);
        const last = Number(bar.dataset['last'] ?? bar.dataset['day']);
        return first <= key && key <= last;
      },
    );
  }

  function textOn(day: number): string {
    return eventsOn(day)
      .map((event) => event.textContent)
      .join(' ');
  }

  function moreOn(day: number): HTMLButtonElement | null {
    return host().querySelector<HTMLButtonElement>(
      `.gog-scheduler__more[data-day="${dayButton(day).dataset['day']}"]`,
    );
  }

  function toolbarButton(name: string): HTMLButtonElement {
    return all<HTMLButtonElement>('.gog-scheduler__toolbar button').find(
      (button) => button.getAttribute('aria-label') === name || button.textContent?.trim() === name,
    )!;
  }

  async function set(inputs: Record<string, unknown>): Promise<void> {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function press(element: Element, key: string): Promise<void> {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeAll(() => {
    // jsdom lays nothing out and has no element scrolling; the hour grid scrolls to an hour on open.
    Element.prototype.scrollTo ??= () => undefined;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SchedulerComponent] }).compileComponents();
    fixture = TestBed.createComponent(SchedulerComponent<Booking>);
    component = fixture.componentInstance;
    await set({ locale: 'en-US', firstDayOfWeek: 1, date: at(17) });
  });

  describe('month', () => {
    it('draws six weeks under weekday headers named in full', () => {
      expect(all('.gog-scheduler__day').length).toBe(42);
      expect(all('.gog-scheduler__week').length).toBe(6);
      const headers = all('.gog-scheduler__weekday');
      expect(headers.map((h) => h.textContent?.trim())[0]).toBe('Mon');
      // The weekday row is for the eye; each day's own button carries its weekday in full.
      expect(headers[0].closest('[aria-hidden="true"]')).not.toBeNull();
      expect(all('.gog-scheduler__day')[0].getAttribute('aria-label')).toMatch(/^Monday, June 1$/);
      expect(title()).toBe('June 2026');
    });

    it('names the region by the title unless given a name', async () => {
      const titleId = host().querySelector('.gog-scheduler__title')!.id;
      expect(host().getAttribute('role')).toBe('region');
      expect(host().getAttribute('aria-labelledby')).toBe(titleId);

      await set({ ariaLabel: 'Room bookings' });
      expect(host().getAttribute('aria-label')).toBe('Room bookings');
      expect(host().hasAttribute('aria-labelledby')).toBe(false);
    });

    it('draws each event in the cells of the days it touches', async () => {
      await set({
        events: [
          { title: 'Standup', start: at(17, 9), end: at(17, 9, 15) },
          { title: 'Trip', start: at(18), end: at(20), allDay: true },
        ],
      });
      const names = (day: number) => eventsOn(day).map((e) => e.getAttribute('aria-label'));
      expect(textOn(17)).toContain('Standup');
      expect(names(18)).toEqual([expect.stringContaining('Trip')]);
      expect(names(19)).toEqual([expect.stringContaining('Trip')]);
      expect(names(20)).toEqual([]);
      // One button across both days, not a piece per day: nothing to break where the days meet.
      expect(eventsOn(18)[0]).toBe(eventsOn(19)[0]);
      expect(eventsOn(18)[0].style.gridColumn).toBe('4 / span 2');
    });

    it('names an event by its title and its time', async () => {
      await set({ events: [{ title: 'Standup', start: at(17, 9), end: at(17, 9, 15) }] });
      const name = eventsOn(17)[0].getAttribute('aria-label')!;
      expect(name.startsWith('Standup, Wednesday, June 17')).toBe(true);
      expect(name).toContain('9:00');
      expect(name).toContain('9:15');
    });

    it('reads events through accessors and skips one whose start cannot be read', async () => {
      await set({
        events: [
          { name: 'ISO string', from: '2026-06-17T09:00:00', to: '2026-06-17T10:00:00' },
          { name: 'No start', from: 'not a date' },
        ],
        eventTitle: 'name',
        eventStart: (event: { from: string }) => event.from,
        eventEnd: 'to',
      });
      expect(eventsOn(17).length).toBe(1);
      expect(textOn(17)).toContain('ISO string');
    });

    it('ends a full cell in "+N more", which lists the day in a popover', async () => {
      const events = Array.from({ length: 5 }, (_, i) => ({
        title: `E${i}`,
        start: at(17, 9 + i),
        end: at(17, 10 + i),
      }));
      await set({ events, monthEventLimit: 3 });
      expect(eventsOn(17).length).toBe(2);
      const more = moreOn(17)!;
      expect(more.textContent?.trim()).toBe('+3 more');

      const clicks: GogSchedulerEventClick<Booking>[] = [];
      component.gogEventClick.subscribe((click) => clicks.push(click));
      more.click();
      await fixture.whenStable();
      fixture.detectChanges();
      const popover = document.querySelector<HTMLElement>('.gog-popover')!;
      expect(popover.getAttribute('aria-label')).toBe('Wednesday, June 17');
      const listed = popover.querySelectorAll<HTMLButtonElement>('.gog-scheduler__event');
      // The list renders in the same pass the popover opens in; focus still lands on its first event.
      expect(document.activeElement).toBe(listed[0]);
      expect(Array.from(listed).map((e) => e.textContent?.trim())).toEqual([
        expect.stringContaining('E0'),
        expect.stringContaining('E1'),
        expect.stringContaining('E2'),
        expect.stringContaining('E3'),
        expect.stringContaining('E4'),
      ]);

      listed[3].click();
      await fixture.whenStable();
      expect(clicks.map((c) => c.event.title)).toEqual(['E3']);
      expect(document.querySelector('.gog-popover')).toBeNull();
    });

    it('opens the day instead when moreEventsAction is "day"', async () => {
      const events = Array.from({ length: 4 }, (_, i) => ({
        title: `E${i}`,
        start: at(17, 9 + i),
      }));
      await set({ events, monthEventLimit: 2, moreEventsAction: 'day' });
      moreOn(17)!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(component.view()).toBe('day');
      expect(title()).toBe('Wednesday, June 17, 2026');
    });

    it('sizes a cell for as many rows as monthEventLimit allows', async () => {
      const events = Array.from({ length: 6 }, (_, i) => ({
        title: `E${i}`,
        start: at(17, 9 + i),
      }));
      await set({ events, monthEventLimit: 5 });
      expect(eventsOn(17).length).toBe(4);
      expect(
        (dayButton(17).closest('.gog-scheduler__week') as HTMLElement).style.gridTemplateRows,
      ).toContain('repeat(5, var(--gog-scheduler-event-min-height))');
    });

    it('keeps a multi-day bar in one row across the week, holding the row open on other days', async () => {
      await set({
        events: [
          { title: 'Early', start: at(18, 8) },
          { title: 'Trip', start: at(17), end: at(20), allDay: true },
        ],
      });
      // Grid row 2 is the first event row, under the day number's.
      const placed = (day: number) =>
        eventsOn(day).map(
          (e) => `${(e.getAttribute('aria-label') ?? '').split(',')[0]}@${e.style.gridRow}`,
        );
      expect(placed(17)).toEqual(['Trip@2']);
      expect(placed(18)).toEqual(['Trip@2', 'Early@3']);
      expect(placed(19)).toEqual(['Trip@2']);
    });

    it('emits the whole day when a cell is pressed', async () => {
      const slots: GogSchedulerSlot[] = [];
      component.gogSlotClick.subscribe((slot) => slots.push(slot));
      dayButton(17).click();
      expect(slots).toEqual([{ start: at(17), end: at(18), allDay: true }]);
    });

    it('emits the event and the instants it was read as when an event is pressed', async () => {
      const standup = { title: 'Standup', start: at(17, 9), end: at(17, 9, 15) };
      await set({ events: [standup] });
      const clicks: GogSchedulerEventClick<Booking>[] = [];
      component.gogEventClick.subscribe((click) => clicks.push(click));

      eventsOn(17)[0].click();
      expect(clicks).toEqual([
        { event: standup, start: at(17, 9), end: at(17, 9, 15), allDay: false },
      ]);
    });

    it('colours an event by its severity, and anything else as the accent', async () => {
      await set({
        events: [
          { title: 'Ok', start: at(17, 9), variant: 'success' },
          { title: 'Odd', start: at(17, 10), variant: 'purple' },
        ],
      });
      const [ok, odd] = all('.gog-scheduler__event');
      expect(ok.classList.contains('gog-scheduler__event--success')).toBe(true);
      expect(odd.className).not.toMatch(/--(success|danger|warning|info)/);
    });
  });

  describe('navigation', () => {
    it('steps by the period, returns to today, and writes the date back', async () => {
      toolbarButton('Next month').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(title()).toBe('July 2026');
      expect(component.date()?.getMonth()).toBe(6);

      toolbarButton('Previous month').click();
      toolbarButton('Previous month').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(title()).toBe('May 2026');

      toolbarButton('Today').click();
      await fixture.whenStable();
      fixture.detectChanges();
      const now = new Date();
      expect(component.date()?.getMonth()).toBe(now.getMonth());
    });

    it('reports the drawn period on first render and after every move', async () => {
      const ranges: GogSchedulerRange[] = [];
      const fresh = TestBed.createComponent(SchedulerComponent<Booking>);
      fresh.componentInstance.gogRangeChange.subscribe((range) => ranges.push(range));
      fresh.componentRef.setInput('firstDayOfWeek', 1);
      fresh.componentRef.setInput('date', at(17));
      await fresh.whenStable();
      expect(ranges).toEqual([{ start: at(1), end: new Date(2026, 6, 13), view: 'month' }]);

      fresh.componentRef.setInput('view', 'week');
      await fresh.whenStable();
      expect(ranges[1]).toEqual({ start: at(15), end: at(22), view: 'week' });

      // A date inside the same week draws the same period, and says nothing.
      fresh.componentRef.setInput('date', at(18, 12));
      await fresh.whenStable();
      expect(ranges.length).toBe(2);
    });

    it('switches view from the toolbar', async () => {
      const radios = all<HTMLElement>('.gog-scheduler__views [role="radio"]');
      expect(radios.map((r) => r.textContent?.trim())).toEqual(['Month', 'Week', 'Day']);
      radios[1].click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(component.view()).toBe('week');
      expect(all('.gog-scheduler__column').length).toBe(7);
    });

    it('hides the switch when it offers one view or none', async () => {
      await set({ views: ['week'] satisfies GogSchedulerView[] });
      expect(host().querySelector('.gog-scheduler__views')).toBeNull();
    });
  });

  describe('week and day', () => {
    beforeEach(async () => {
      await set({ view: 'week' });
    });

    it('draws the week as columns of slots, under a header per day', async () => {
      expect(title()).toMatch(/Jun 15\D+21, 2026/);
      expect(all('.gog-scheduler__column').length).toBe(7);
      // 24 hours of 30-minute slots.
      expect(all('.gog-scheduler__column')[0].querySelectorAll('.gog-scheduler__slot').length).toBe(
        48,
      );
      expect(all('.gog-scheduler__column-day')[2].getAttribute('aria-label')).toBe(
        'Wednesday, June 17',
      );
    });

    it('draws only the hours asked for, in slots of the length asked for', async () => {
      await set({ dayStartHour: 8, dayEndHour: 18, slotDuration: 60 });
      expect(all('.gog-scheduler__column')[0].querySelectorAll('.gog-scheduler__slot').length).toBe(
        10,
      );
      expect(all('.gog-scheduler__hour-label').length).toBe(10);
    });

    it('places a timed event by its start and length, in slots', async () => {
      await set({ events: [{ title: 'Review', start: at(17, 9, 30), end: at(17, 11) }] });
      const event =
        all('.gog-scheduler__column')[2].querySelector<HTMLElement>('.gog-scheduler__event')!;
      expect(event.style.top).toBe('calc(var(--gog-scheduler-slot-height) * 19)');
      expect(event.style.height).toBe('calc(var(--gog-scheduler-slot-height) * 3)');
      expect(event.textContent).toContain('Review');
    });

    it('sets overlapping events side by side', async () => {
      await set({
        events: [
          { title: 'A', start: at(17, 9), end: at(17, 11) },
          { title: 'B', start: at(17, 10), end: at(17, 12) },
        ],
      });
      const [a, b] =
        all<HTMLElement>('.gog-scheduler__column')[2].querySelectorAll<HTMLElement>(
          '.gog-scheduler__event',
        );
      expect([a.style.width, b.style.width]).toEqual(['50%', '50%']);
      expect([a.style.insetInlineStart, b.style.insetInlineStart]).toEqual(['0%', '50%']);
    });

    it('puts all-day and day-long events in the all-day row', async () => {
      await set({
        events: [
          { title: 'Holiday', start: at(17), allDay: true },
          { title: 'Shift', start: at(18, 8), end: at(19, 8) },
        ],
      });
      const row = host().querySelector('.gog-scheduler__all-day')!;
      expect(row.textContent).toContain('Holiday');
      expect(row.textContent).toContain('Shift');
      expect(host().querySelector('.gog-scheduler__grid')!.textContent).not.toContain('Holiday');
    });

    it('draws a multi-day event in the all-day row as one bar across its columns', async () => {
      await set({
        events: [
          { title: 'Offsite', start: at(16), end: at(19), allDay: true },
          { title: 'Holiday', start: at(18), allDay: true },
        ],
      });
      const bars = all<HTMLElement>('.gog-scheduler__all-day-grid .gog-scheduler__event');
      expect(
        bars.map((bar) => [bar.textContent?.trim(), bar.style.gridColumn, bar.style.gridRow]),
      ).toEqual([
        ['Offsite', '2 / span 3', '2'],
        ['Holiday', '4 / span 1', '3'],
      ]);
    });

    it('emits a slot of the grid when it is pressed', async () => {
      const slots: GogSchedulerSlot[] = [];
      component.gogSlotClick.subscribe((slot) => slots.push(slot));
      all<HTMLButtonElement>('.gog-scheduler__column')[2]
        .querySelector<HTMLButtonElement>('[data-minute="600"]')!
        .click();
      expect(slots).toEqual([{ start: at(17, 10), end: at(17, 10, 30), allDay: false }]);
    });

    it('opens a day from its header', async () => {
      all<HTMLButtonElement>('button.gog-scheduler__column-day')[2].click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(component.view()).toBe('day');
      expect(all('.gog-scheduler__column').length).toBe(1);
      expect(host().querySelector('button.gog-scheduler__column-day')).toBeNull();
    });

    it('draws the "now" line in today’s column only', async () => {
      await set({ date: new Date() });
      const lines = all('.gog-scheduler__now');
      expect(lines.length).toBe(1);
      expect(lines[0].closest('.gog-scheduler__column')!.classList).toContain(
        'gog-scheduler__column--today',
      );
    });
  });

  describe('keyboard', () => {
    function tabStops(kind: string): HTMLElement[] {
      return all<HTMLElement>(`[data-kind="${kind}"][tabindex="0"]`);
    }

    it('keeps one day tab stop and moves it with the arrows', async () => {
      expect(tabStops('day').length).toBe(1);
      dayButton(17).focus();
      dayButton(17).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await press(dayButton(17), 'ArrowRight');
      expect(tabStops('day')[0]).toBe(dayButton(18));
      await press(dayButton(18), 'ArrowDown');
      expect(tabStops('day')[0]).toBe(dayButton(25));
    });

    it('gives the focused day’s events the tab stops, and no other day’s', async () => {
      await set({
        events: [
          { title: 'Here', start: at(17, 9) },
          { title: 'There', start: at(18, 9) },
        ],
      });
      dayButton(17).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      fixture.detectChanges();
      expect(tabStops('event').map((e) => e.textContent)).toEqual([
        expect.stringContaining('Here'),
      ]);
    });

    it('moves the view when the focus leaves what is drawn', async () => {
      dayButton(30).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await press(dayButton(30), 'PageDown');
      expect(title()).toBe('July 2026');
    });

    it('moves by slot in the hour grid', async () => {
      await set({ view: 'week', scrollToHour: 9 });
      const start = tabStops('slot')[0];
      expect(start.dataset['minute']).toBe('540');
      start.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await press(start, 'ArrowDown');
      expect(tabStops('slot')[0].dataset['minute']).toBe('570');
      await press(tabStops('slot')[0], 'Home');
      expect(tabStops('slot')[0].dataset['minute']).toBe('0');
    });
  });

  describe('editing', () => {
    function rightClick(element: Element): MouseEvent {
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2,
        clientX: 40,
        clientY: 40,
      });
      element.dispatchEvent(event);
      return event;
    }

    async function menuItem(name: string): Promise<HTMLButtonElement> {
      await fixture.whenStable();
      fixture.detectChanges();
      const items = Array.from(document.querySelectorAll<HTMLButtonElement>('.gog-menu__item'));
      return items.find((item) => item.textContent?.trim() === name)!;
    }

    async function choose(name: string): Promise<void> {
      (await menuItem(name)).click();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('leaves the browser menu alone while readonly, which is the default', async () => {
      const event = rightClick(dayButton(17));
      await fixture.whenStable();
      expect(event.defaultPrevented).toBe(false);
      expect(document.querySelector('.gog-menu')).toBeNull();
    });

    it('offers "New event" on a day, and emits it as an all-day slot', async () => {
      await set({ readonly: false });
      const created: GogSchedulerSlot[] = [];
      component.gogEventCreate.subscribe((slot) => created.push(slot));
      expect(rightClick(dayButton(17)).defaultPrevented).toBe(true);
      await choose('New event');
      expect(created).toEqual([{ start: at(17), end: at(18), allDay: true }]);
    });

    it('offers "New event" on a slot of the hour grid', async () => {
      await set({ readonly: false, view: 'week' });
      const created: GogSchedulerSlot[] = [];
      component.gogEventCreate.subscribe((slot) => created.push(slot));
      rightClick(all('.gog-scheduler__column')[2].querySelector('[data-minute="600"]')!);
      await choose('New event');
      expect(created).toEqual([{ start: at(17, 10), end: at(17, 10, 30), allDay: false }]);
    });

    it('deletes an event through the menu', async () => {
      const standup = { title: 'Standup', start: at(17, 9), end: at(17, 9, 30) };
      await set({ readonly: false, events: [standup] });
      const deleted: GogSchedulerEventClick<Booking>[] = [];
      component.gogEventDelete.subscribe((click) => deleted.push(click));
      rightClick(eventsOn(17)[0]);
      expect(await menuItem('New event')).toBeUndefined();
      await choose('Delete');
      expect(deleted.map((d) => d.event)).toEqual([standup]);
    });

    it('moves an event to the next slot pressed, keeping its length', async () => {
      const review = { title: 'Review', start: at(17, 9), end: at(17, 10, 30) };
      await set({ readonly: false, view: 'week', events: [review] });
      const changes: GogSchedulerEventChange<Booking>[] = [];
      component.gogEventChange.subscribe((change) => changes.push(change));

      rightClick(all('.gog-scheduler__column')[2].querySelector('.gog-scheduler__event')!);
      await choose('Move');
      expect(host().querySelector('.gog-scheduler__status')?.textContent).toContain(
        'Moving "Review": choose a new start',
      );
      expect(host().classList).toContain('gog-scheduler--picking');

      all('.gog-scheduler__column')[4]
        .querySelector<HTMLButtonElement>('[data-minute="840"]')!
        .click();
      expect(changes).toEqual([
        {
          event: review,
          change: 'move',
          start: at(19, 14),
          end: at(19, 15, 30),
          allDay: false,
          previousStart: at(17, 9),
          previousEnd: at(17, 10, 30),
        },
      ]);
      fixture.detectChanges();
      expect(host().classList).not.toContain('gog-scheduler--picking');
    });

    it('moves an event dropped on a month day, keeping its time of day', async () => {
      const review = { title: 'Review', start: at(17, 9), end: at(17, 10) };
      await set({ readonly: false, events: [review] });
      const changes: GogSchedulerEventChange<Booking>[] = [];
      component.gogEventChange.subscribe((change) => changes.push(change));
      rightClick(eventsOn(17)[0]);
      await choose('Move');
      dayButton(24).click();
      expect([changes[0].start, changes[0].end]).toEqual([at(24, 9), at(24, 10)]);
    });

    it('changes the end to the slot pressed, and ignores one before the start', async () => {
      const review = { title: 'Review', start: at(17, 9), end: at(17, 10) };
      await set({ readonly: false, view: 'week', events: [review] });
      const changes: GogSchedulerEventChange<Booking>[] = [];
      component.gogEventChange.subscribe((change) => changes.push(change));
      const column = all('.gog-scheduler__column')[2];

      rightClick(column.querySelector('.gog-scheduler__event')!);
      await choose('Change end');
      column.querySelector<HTMLButtonElement>('[data-minute="480"]')!.click();
      expect(changes).toEqual([]);

      column.querySelector<HTMLButtonElement>('[data-minute="660"]')!.click();
      expect(changes.map((c) => [c.change, c.start, c.end])).toEqual([
        ['resize', at(17, 9), at(17, 11, 30)],
      ]);
    });

    it('cancels a pending change with Escape, and the next press is a slot press again', async () => {
      await set({ readonly: false, view: 'week', events: [{ title: 'Review', start: at(17, 9) }] });
      const changes: unknown[] = [];
      const slots: unknown[] = [];
      component.gogEventChange.subscribe((change) => changes.push(change));
      component.gogSlotClick.subscribe((slot) => slots.push(slot));
      rightClick(all('.gog-scheduler__column')[2].querySelector('.gog-scheduler__event')!);
      await choose('Move');
      host().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      all('.gog-scheduler__column')[3]
        .querySelector<HTMLButtonElement>('[data-minute="600"]')!
        .click();
      expect(changes).toEqual([]);
      expect(slots.length).toBe(1);
    });

    it('opens the menu from the keyboard with Shift+F10', async () => {
      await set({ readonly: false });
      dayButton(17).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'F10',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(await menuItem('New event')).toBeTruthy();
    });
  });

  describe('GOG_CONFIG.scheduler', () => {
    async function configured(config: Record<string, unknown>) {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SchedulerComponent],
        providers: [{ provide: GOG_CONFIG, useValue: config }],
      }).compileComponents();
      fixture = TestBed.createComponent(SchedulerComponent<Booking>);
      component = fixture.componentInstance;
      await set({
        locale: 'en-US',
        firstDayOfWeek: 1,
        date: at(17),
        events: Array.from({ length: 6 }, (_, i) => ({ title: `E${i}`, start: at(17, 9 + i) })),
      });
    }

    it('takes the month cell limit from the config, and the instance wins', async () => {
      await configured({ scheduler: { monthEventLimit: 5 } });
      expect(eventsOn(17).length).toBe(4);
      await set({ monthEventLimit: 2 });
      expect(eventsOn(17).length).toBe(1);
    });

    it('words "+N more" through GOG_CONFIG.labels.moreEvents', async () => {
      await configured({ labels: { moreEvents: (count: number) => `+${count} weitere` } });
      expect(moreOn(17)?.textContent?.trim()).toBe('+4 weitere');
    });

    it('takes readonly and the "+N more" action from the config', async () => {
      await configured({ scheduler: { readonly: false, moreEventsAction: 'day' } });
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
      dayButton(17).dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      moreOn(17)!.click();
      await fixture.whenStable();
      expect(component.view()).toBe('day');
    });
  });

  describe('timeZone', () => {
    it('draws events on the zone’s clock and emits slots as instants in it', async () => {
      // 20:00 UTC on 16 June is 05:00 on 17 June in Tokyo.
      await set({
        view: 'week',
        timeZone: 'Asia/Tokyo',
        date: new Date(Date.UTC(2026, 5, 17, 3)),
        events: [{ title: 'Early', start: new Date(Date.UTC(2026, 5, 16, 20)) }],
      });
      const column = all('.gog-scheduler__column')[2];
      expect(column.getAttribute('aria-label')).toBe('Wednesday, June 17');
      expect(column.textContent).toContain('Early');

      const slots: GogSchedulerSlot[] = [];
      component.gogSlotClick.subscribe((slot) => slots.push(slot));
      column.querySelector<HTMLButtonElement>('[data-minute="540"]')!.click();
      expect(slots[0].start.toISOString()).toBe('2026-06-17T00:00:00.000Z');
    });

    it('takes locale, first day and zone from GOG_CONFIG.datepicker', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SchedulerComponent],
        providers: [
          {
            provide: GOG_CONFIG,
            useValue: { datepicker: { locale: 'de-DE', firstDayOfWeek: 0, timeZone: 'UTC' } },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(SchedulerComponent<Booking>);
      await set({ date: new Date(Date.UTC(2026, 5, 17, 12)) });
      expect(title()).toBe('Juni 2026');
      expect(all('.gog-scheduler__day')[0].getAttribute('aria-label')).toMatch(/^Sonntag/);
    });
  });

  it('takes its toolbar labels from GOG_CONFIG.labels', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SchedulerComponent],
      providers: [
        {
          provide: GOG_CONFIG,
          useValue: {
            labels: {
              today: 'Heute',
              previousPeriod: (view: GogSchedulerView) => `Zurück (${view})`,
              monthView: 'Monat',
            },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SchedulerComponent<Booking>);
    await set({ date: at(17) });
    expect(toolbarButton('Heute')).toBeTruthy();
    expect(toolbarButton('Zurück (month)')).toBeTruthy();
    expect(all('.gog-scheduler__views [role="radio"]')[0].textContent?.trim()).toBe('Monat');
  });

  describe('gogSchedulerEvent', () => {
    @Component({
      imports: [SchedulerComponent, GogSchedulerEventDirective],
      template: `
        <gog-scheduler [events]="events()" [date]="day">
          <ng-template
            gogSchedulerEvent
            let-booking
            let-time="time"
            [gogSchedulerEventTypeOf]="events()"
          >
            <em class="custom">{{ booking.title }} at {{ time }}</em>
          </ng-template>
        </gog-scheduler>
      `,
    })
    class CustomEventHost {
      readonly day = at(17);
      readonly events = signal<Booking[]>([
        { title: 'Standup', start: at(17, 9), end: at(17, 10) },
      ]);
    }

    it('fills each event with the template, handed the event and its time', async () => {
      const custom = TestBed.createComponent(CustomEventHost);
      await custom.whenStable();
      custom.detectChanges();
      const em = (custom.nativeElement as HTMLElement).querySelector(
        '.gog-scheduler__event .custom',
      );
      expect(em?.textContent).toMatch(/^Standup at 9:00\D+10:00/);
    });
  });
});
