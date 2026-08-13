import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarComponent, type GogDatepickerValue } from './calendar.component';
import { isSameDay, type GogDateRange } from '../date-utils';
import { GOG_CONFIG } from '../../../shared/config';

/** A fixed month with no ambiguity: June 2026 starts on a Monday and has 30 days. */
const JUNE_2026 = new Date(2026, 5, 15);

describe('CalendarComponent', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let component: CalendarComponent;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function days(): HTMLButtonElement[] {
    return Array.from(host().querySelectorAll('.gog-calendar__day'));
  }

  /** The button for a day inside the shown month, by its number. */
  function day(number: number): HTMLButtonElement {
    return days().find(
      (button) =>
        button.textContent?.trim() === String(number) &&
        !button.classList.contains('gog-calendar__day--outside'),
    )!;
  }

  function title(): string {
    return host().querySelector('.gog-calendar__title')?.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarComponent] }).compileComponents();
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('firstDayOfWeek', 1);
    fixture.componentRef.setInput('defaultMonth', JUNE_2026);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render six weeks so the height never changes between months', () => {
    // A grid that grows and shrinks pushes the page around and moves the button you were
    // about to click.
    expect(host().querySelectorAll('.gog-calendar__week').length).toBe(6);
    expect(days().length).toBe(42);
  });

  it('should open on defaultMonth', () => {
    expect(title()).toBe('June 2026');
  });

  it('should render seven weekday headers starting on the requested day', () => {
    const weekdays = Array.from(host().querySelectorAll('.gog-calendar__weekday')).map((cell) =>
      cell.textContent?.trim(),
    );
    expect(weekdays.length).toBe(7);
    expect(weekdays[0]).toBe('Mon');
  });

  it('should page by month and by year', () => {
    // Four nav buttons: ‹‹ year, ‹ month, month ›, year ››. The titles sit between them but
    // are not `.gog-calendar__nav`, so there is no gap in this list.
    const [prevYear, prevMonth, nextMonth, nextYear] = Array.from(
      host().querySelectorAll<HTMLButtonElement>('.gog-calendar__nav'),
    );

    nextMonth.click();
    fixture.detectChanges();
    expect(title()).toBe('July 2026');

    prevMonth.click();
    prevMonth.click();
    fixture.detectChanges();
    expect(title()).toBe('May 2026');

    nextYear.click();
    fixture.detectChanges();
    expect(title()).toBe('May 2027');

    prevYear.click();
    prevYear.click();
    fixture.detectChanges();
    expect(title()).toBe('May 2025');
  });

  it('should select a day and emit it', () => {
    const seen: GogDatepickerValue[] = [];
    component.gogDateSelect.subscribe((value) => seen.push(value));

    day(10).click();
    fixture.detectChanges();

    const value = component.value() as Date;
    expect(value.getFullYear()).toBe(2026);
    expect(value.getMonth()).toBe(5);
    expect(value.getDate()).toBe(10);
    expect(seen.length).toBe(1);
    expect(day(10).classList.contains('gog-calendar__day--selected')).toBe(true);
  });

  it('should mark today', () => {
    fixture.componentRef.setInput('defaultMonth', new Date());
    fixture.detectChanges();

    const today = host().querySelector('.gog-calendar__day--today');
    expect(today).toBeTruthy();
    expect(today?.getAttribute('aria-current')).toBe('date');
  });

  it('should disable days outside min/max', () => {
    fixture.componentRef.setInput('min', new Date(2026, 5, 10));
    fixture.componentRef.setInput('max', new Date(2026, 5, 20));
    fixture.detectChanges();

    expect(day(9).disabled).toBe(true);
    expect(day(10).disabled).toBe(false);
    expect(day(20).disabled).toBe(false);
    expect(day(21).disabled).toBe(true);
  });

  it('should disable days the predicate rejects', () => {
    // A predicate rather than a list, because an array cannot express "weekends".
    fixture.componentRef.setInput('disabledDates', (date: Date) => date.getDay() === 0);
    fixture.detectChanges();

    // 7 June 2026 is a Sunday.
    expect(day(7).disabled).toBe(true);
    expect(day(8).disabled).toBe(false);
  });

  it('should ignore a click on a disabled day', () => {
    fixture.componentRef.setInput('min', new Date(2026, 5, 10));
    fixture.detectChanges();

    day(5).click();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
  });

  it('should keep the time of day when the day changes', () => {
    fixture.componentRef.setInput('value', new Date(2026, 5, 10, 14, 45));
    fixture.detectChanges();

    day(12).click();
    fixture.detectChanges();

    const value = component.value() as Date;
    expect(value.getDate()).toBe(12);
    expect(value.getHours()).toBe(14);
    expect(value.getMinutes()).toBe(45);
  });

  it('should show several months side by side', () => {
    fixture.componentRef.setInput('numberOfMonths', 2);
    fixture.detectChanges();

    const titles = Array.from(host().querySelectorAll('.gog-calendar__title')).map((el) =>
      el.textContent?.trim(),
    );
    expect(titles).toEqual(['June 2026', 'July 2026']);
    expect(host().querySelectorAll('.gog-calendar__grid').length).toBe(2);
  });

  describe('range mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.detectChanges();
    });

    it('should take the first click as the start and emit nothing yet', () => {
      const seen: GogDatepickerValue[] = [];
      component.gogDateSelect.subscribe((value) => seen.push(value));

      day(10).click();
      fixture.detectChanges();

      const range = component.value() as GogDateRange;
      expect(range.start?.getDate()).toBe(10);
      expect(range.end).toBeNull();
      // A half-picked range is not a selection, so nothing is emitted for it.
      expect(seen.length).toBe(0);
    });

    it('should complete the range on the second click and emit it', () => {
      const seen: GogDatepickerValue[] = [];
      component.gogDateSelect.subscribe((value) => seen.push(value));

      day(10).click();
      fixture.detectChanges();
      day(15).click();
      fixture.detectChanges();

      const range = component.value() as GogDateRange;
      expect(range.start?.getDate()).toBe(10);
      expect(range.end?.getDate()).toBe(15);
      expect(seen.length).toBe(1);
    });

    it('should order the range when the second click lands before the first', () => {
      day(15).click();
      fixture.detectChanges();
      day(10).click();
      fixture.detectChanges();

      const range = component.value() as GogDateRange;
      expect(range.start?.getDate()).toBe(10);
      expect(range.end?.getDate()).toBe(15);
    });

    it('should start a fresh range on the click after a complete one', () => {
      day(10).click();
      fixture.detectChanges();
      day(15).click();
      fixture.detectChanges();
      day(20).click();
      fixture.detectChanges();

      const range = component.value() as GogDateRange;
      expect(range.start?.getDate()).toBe(20);
      expect(range.end).toBeNull();
    });

    it('should mark the days between both ends', () => {
      day(10).click();
      fixture.detectChanges();
      day(15).click();
      fixture.detectChanges();

      expect(day(12).classList.contains('gog-calendar__day--in-range')).toBe(true);
      expect(day(10).classList.contains('gog-calendar__day--selected')).toBe(true);
      expect(day(15).classList.contains('gog-calendar__day--selected')).toBe(true);
      expect(day(16).classList.contains('gog-calendar__day--in-range')).toBe(false);
    });

    it('should preview the range under the pointer while it is half-picked', () => {
      day(10).click();
      fixture.detectChanges();

      day(14).dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      // The preview is what tells the user what the second click will produce.
      expect(day(12).classList.contains('gog-calendar__day--in-range')).toBe(true);
    });
  });

  describe('keyboard', () => {
    function gridKeydown(key: string, shiftKey = false): void {
      host()
        .querySelector('.gog-calendar__grid')!
        .dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
      fixture.detectChanges();
    }

    it('should expose exactly one tab stop across the whole grid', () => {
      // 42 tab stops between the field and whatever follows would be unusable.
      expect(days().filter((button) => button.tabIndex === 0).length).toBe(1);
    });

    it('should move by a day and by a week', () => {
      const focused = () => host().querySelector('.gog-calendar__day[tabindex="0"]');
      const before = focused()?.textContent?.trim();

      gridKeydown('ArrowRight');
      expect(focused()?.textContent?.trim()).toBe(String(Number(before) + 1));

      gridKeydown('ArrowDown');
      expect(focused()?.textContent?.trim()).toBe(String(Number(before) + 8));
    });

    it('should page by month with PageDown and by year with Shift+PageDown', () => {
      gridKeydown('PageDown');
      expect(title()).toBe('July 2026');

      gridKeydown('PageUp');
      gridKeydown('PageDown', true);
      expect(title()).toBe('June 2027');
    });

    it('should select with Enter', () => {
      gridKeydown('Enter');

      expect(component.value()).toBeInstanceOf(Date);
    });

    it('should not walk outside min/max', () => {
      fixture.componentRef.setInput('value', new Date(2026, 5, 10));
      fixture.componentRef.setInput('min', new Date(2026, 5, 10));
      fixture.detectChanges();

      gridKeydown('ArrowLeft');

      const focused = host().querySelector('.gog-calendar__day[tabindex="0"]');
      expect(focused?.textContent?.trim()).toBe('10');
    });
  });

  describe('time', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('showTime', true);
      fixture.componentRef.setInput('value', new Date(2026, 5, 10, 9, 30));
      fixture.detectChanges();
    });

    function timeInputs(): HTMLInputElement[] {
      return Array.from(host().querySelectorAll('.gog-calendar__time-input'));
    }

    it('should render hours and minutes from the value', () => {
      expect(timeInputs()[0].value).toBe('9');
      expect(timeInputs()[1].value).toBe('30');
    });

    it('should apply an hour change without moving the day', () => {
      const input = timeInputs()[0];
      input.value = '17';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const value = component.value() as Date;
      expect(value.getHours()).toBe(17);
      expect(value.getDate()).toBe(10);
    });

    it('should clamp an out-of-range hour rather than roll into the next day', () => {
      const input = timeInputs()[0];
      input.value = '99';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect((component.value() as Date).getHours()).toBe(23);
      expect((component.value() as Date).getDate()).toBe(10);
    });

    it('should show seconds only when asked', () => {
      expect(timeInputs().length).toBe(2);

      fixture.componentRef.setInput('showSeconds', true);
      fixture.detectChanges();
      expect(timeInputs().length).toBe(3);
    });

    it('should offer a meridiem toggle on a 12-hour clock', () => {
      expect(host().querySelector('.gog-calendar__meridiem')).toBeNull();

      fixture.componentRef.setInput('hourFormat', '12');
      fixture.detectChanges();

      const meridiem = host().querySelector<HTMLButtonElement>('.gog-calendar__meridiem')!;
      expect(meridiem.textContent?.trim()).toBe('AM');

      meridiem.click();
      fixture.detectChanges();
      expect((component.value() as Date).getHours()).toBe(21);
    });
  });

  describe('footer buttons', () => {
    function todayButton(): HTMLButtonElement | null {
      return host().querySelector('.gog-calendar__today');
    }

    function thisMonthButton(): HTMLButtonElement | null {
      return host().querySelector('.gog-calendar__action--this-month');
    }

    function currentMonthTitle(): string {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(),
      );
    }

    it('should show only "Today" by default', () => {
      expect(todayButton()).toBeTruthy();
      expect(thisMonthButton()).toBeNull();
    });

    it('should select today, not merely navigate to it', () => {
      // The whole point of the split: this button commits a date. Navigating without selecting
      // is what made a single "Today" button ambiguous.
      const seen: GogDatepickerValue[] = [];
      component.gogDateSelect.subscribe((value) => seen.push(value));

      todayButton()!.click();
      fixture.detectChanges();

      expect(isSameDay(component.value() as Date, new Date())).toBe(true);
      expect(seen.length).toBe(1);
      // The view follows, because the selection is the anchor the calendar opens on.
      expect(title()).toBe(currentMonthTitle());
    });

    it('should disable "Today" when today cannot be picked', () => {
      fixture.componentRef.setInput('min', new Date(2099, 0, 1));
      fixture.detectChanges();

      expect(todayButton()!.disabled).toBe(true);

      todayButton()!.click();
      fixture.detectChanges();
      expect(component.value()).toBeNull();
    });

    it('should disable "Today" when the predicate rejects it', () => {
      fixture.componentRef.setInput('disabledDates', () => true);
      fixture.detectChanges();

      expect(todayButton()!.disabled).toBe(true);
    });

    it('should move the view without touching the selection from "This month"', () => {
      fixture.componentRef.setInput('showThisMonthButton', true);
      fixture.componentRef.setInput('value', new Date(2026, 5, 10));
      fixture.detectChanges();
      expect(title()).toBe('June 2026');

      thisMonthButton()!.click();
      fixture.detectChanges();

      expect(title()).toBe(currentMonthTitle());
      // The selection is deliberately untouched — that is what separates it from "Today".
      expect(isSameDay(component.value() as Date, new Date(2026, 5, 10))).toBe(true);
    });

    it('should render neither button when both are off', () => {
      fixture.componentRef.setInput('showTodayButton', false);
      fixture.detectChanges();

      expect(host().querySelector('.gog-calendar__footer')).toBeNull();
    });

    it('should render the footer for "This month" alone', () => {
      fixture.componentRef.setInput('showTodayButton', false);
      fixture.componentRef.setInput('showThisMonthButton', true);
      fixture.detectChanges();

      expect(host().querySelector('.gog-calendar__footer')).toBeTruthy();
      expect(todayButton()).toBeNull();
      expect(thisMonthButton()).toBeTruthy();
    });
  });

  describe('GOG_CONFIG.datepicker', () => {
    /**
     * `gog-calendar` is exported and usable standalone, and the config key has always been
     * documented as applying to it as well as to `gog-datepicker` — it just never read it.
     */
    async function configured(datepicker: Record<string, unknown>) {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CalendarComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { datepicker } }],
      }).compileComponents();

      const configuredFixture = TestBed.createComponent(CalendarComponent);
      configuredFixture.componentRef.setInput('value', new Date(2026, 7, 13));
      await configuredFixture.whenStable();
      configuredFixture.detectChanges();
      return configuredFixture;
    }

    const weekdayRow = (f: ComponentFixture<CalendarComponent>) =>
      [...f.nativeElement.querySelectorAll('.gog-calendar__weekday')].map((el) =>
        (el as HTMLElement).textContent?.trim(),
      );

    it('takes the locale from the config when the input is unset', async () => {
      const f = await configured({ locale: 'de-DE' });

      expect(f.nativeElement.textContent).toContain('August');
      expect(weekdayRow(f)[0]?.toLowerCase()).toContain('mo');
    });

    it('lets the instance input win over the configured locale', async () => {
      const f = await configured({ locale: 'de-DE' });
      f.componentRef.setInput('locale', 'en-US');
      await f.whenStable();
      f.detectChanges();

      expect(f.nativeElement.textContent).toContain('August');
      expect(weekdayRow(f)[0]?.toLowerCase()).toContain('su');
    });

    it('takes firstDayOfWeek from the config, overriding the locale default', async () => {
      const f = await configured({ locale: 'en-US', firstDayOfWeek: 1 });

      expect(weekdayRow(f)[0]?.toLowerCase()).toContain('mo');
    });

    it('falls back to the locale when neither input nor config sets firstDayOfWeek', async () => {
      const f = await configured({ locale: 'en-US' });

      expect(weekdayRow(f)[0]?.toLowerCase()).toContain('su');
    });
  });
});
