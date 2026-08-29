import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DatepickerComponent } from './datepicker.component';
import { GOG_CONFIG } from '../../shared/config';
import type { GogDateRange } from './date-utils';

describe('DatepickerComponent', () => {
  let fixture: ComponentFixture<DatepickerComponent>;
  let component: DatepickerComponent;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function field(): HTMLInputElement {
    return host().querySelector('.gog-datepicker__control')!;
  }

  function toggle(): HTMLButtonElement {
    return host().querySelector('.gog-datepicker__toggle')!;
  }

  function panel(): HTMLElement | null {
    return host().querySelector('.gog-datepicker__panel');
  }

  function type(text: string): void {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DatepickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DatepickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('locale', 'en-US');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render an empty field with a calendar toggle', () => {
    expect(field().value).toBe('');
    expect(toggle()).toBeTruthy();
    expect(panel()).toBeNull();
  });

  it('should format the value with the default pattern', () => {
    fixture.componentRef.setInput('value', new Date(2026, 1, 3));
    fixture.detectChanges();

    expect(field().value).toBe('03.02.2026');
  });

  it('should honour a custom format', () => {
    fixture.componentRef.setInput('format', 'yyyy-MM-dd');
    fixture.componentRef.setInput('value', new Date(2026, 1, 3));
    fixture.detectChanges();

    expect(field().value).toBe('2026-02-03');
  });

  it('should include a time when showTime is on, without restating the format', () => {
    fixture.componentRef.setInput('showTime', true);
    fixture.componentRef.setInput('value', new Date(2026, 1, 3, 14, 30));
    fixture.detectChanges();

    expect(field().value).toBe('03.02.2026 14:30');
  });

  it('should open and close the panel from the toggle', () => {
    toggle().click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();
    expect(component.isOpen()).toBe(true);

    toggle().click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('should expose the panel as a dialog wired to the field', () => {
    toggle().click();
    fixture.detectChanges();

    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(field().getAttribute('aria-haspopup')).toBe('dialog');
    expect(field().getAttribute('aria-expanded')).toBe('true');
    expect(field().getAttribute('aria-controls')).toBe(panel()?.id);
  });

  it('should open on ArrowDown and close on Escape', () => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should take a date from the calendar and close', async () => {
    toggle().click();
    fixture.detectChanges();

    const day = panel()!.querySelector<HTMLButtonElement>(
      '.gog-calendar__day:not(.gog-calendar__day--outside)',
    )!;
    day.click();
    fixture.detectChanges();

    expect(component.value()).toBeInstanceOf(Date);
    expect(component.isOpen()).toBe(false);

    // The field text is written by an effect reacting to the new value, so it lands on the
    // pass *after* the one that committed it.
    await fixture.whenStable();
    fixture.detectChanges();
    expect(field().value).not.toBe('');
  });

  it('should stay open after a pick when a time still has to be set', () => {
    fixture.componentRef.setInput('showTime', true);
    toggle().click();
    fixture.detectChanges();

    panel()!
      .querySelector<HTMLButtonElement>('.gog-calendar__day:not(.gog-calendar__day--outside)')!
      .click();
    fixture.detectChanges();

    // Closing here would make the clock unreachable without reopening.
    expect(component.isOpen()).toBe(true);
  });

  describe('typing', () => {
    it('should parse a complete date', () => {
      type('03.02.2026');

      const value = component.value() as Date;
      expect(value.getFullYear()).toBe(2026);
      expect(value.getMonth()).toBe(1);
      expect(value.getDate()).toBe(3);
    });

    it('should leave the value alone while the date is still half-typed', () => {
      fixture.componentRef.setInput('value', new Date(2026, 1, 3));
      fixture.detectChanges();
      field().dispatchEvent(new Event('focus'));

      type('03.02.20');

      // Every keystroke on the way to a full date is unparseable; clearing on each one would
      // fire a stream of nulls at an attached form.
      expect(component.value()).toBeInstanceOf(Date);
    });

    it('should reject a day that does not exist', () => {
      type('31.02.2026');
      expect(component.value()).toBeNull();
    });

    it('should clear the value on an empty field', () => {
      fixture.componentRef.setInput('value', new Date(2026, 1, 3));
      fixture.detectChanges();
      field().dispatchEvent(new Event('focus'));

      type('');
      expect(component.value()).toBeNull();
    });

    it('should revert an unfinished draft on blur', () => {
      fixture.componentRef.setInput('value', new Date(2026, 1, 3));
      fixture.detectChanges();

      field().dispatchEvent(new Event('focus'));
      type('nonsense');
      field().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(field().value).toBe('03.02.2026');
    });

    it('should make the field read-only when text input is off', () => {
      fixture.componentRef.setInput('allowTextInput', false);
      fixture.detectChanges();

      expect(field().readOnly).toBe(true);
    });

    it('should make the field read-only in range mode', () => {
      // A range has no single unambiguous text form to parse back.
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.detectChanges();

      expect(field().readOnly).toBe(true);
    });
  });

  describe('range mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('selectionMode', 'range');
      fixture.detectChanges();
    });

    it('should show only the start while the range is half-picked', () => {
      fixture.componentRef.setInput('value', {
        start: new Date(2026, 1, 3),
        end: null,
      } satisfies GogDateRange);
      fixture.detectChanges();

      expect(field().value).toBe('03.02.2026');
    });

    it('should show both ends once complete', () => {
      fixture.componentRef.setInput('value', {
        start: new Date(2026, 1, 3),
        end: new Date(2026, 1, 10),
      } satisfies GogDateRange);
      fixture.detectChanges();

      expect(field().value).toBe('03.02.2026 — 10.02.2026');
    });

    it('should stay open between the two clicks', () => {
      toggle().click();
      fixture.detectChanges();

      panel()!
        .querySelector<HTMLButtonElement>('.gog-calendar__day:not(.gog-calendar__day--outside)')!
        .click();
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
    });
  });

  describe('footer buttons', () => {
    it('should fill the field and close when "Today" is pressed', async () => {
      toggle().click();
      fixture.detectChanges();

      panel()!.querySelector<HTMLButtonElement>('.gog-calendar__today')!.click();
      fixture.detectChanges();

      expect(component.value()).toBeInstanceOf(Date);
      expect(component.isOpen()).toBe(false);

      await fixture.whenStable();
      fixture.detectChanges();
      expect(field().value).not.toBe('');
    });

    it('should not offer "This month" unless asked, and keep the panel open when it is used', () => {
      toggle().click();
      fixture.detectChanges();
      expect(panel()!.querySelector('.gog-calendar__action--this-month')).toBeNull();

      fixture.componentRef.setInput('showThisMonthButton', true);
      fixture.detectChanges();

      const jump = panel()!.querySelector<HTMLButtonElement>('.gog-calendar__action--this-month')!;
      jump.click();
      fixture.detectChanges();

      // It only moves the view, so there is nothing to commit and no reason to close.
      expect(component.value()).toBeNull();
      expect(component.isOpen()).toBe(true);
    });

    it('should pass the footer labels through', () => {
      fixture.componentRef.setInput('todayLabel', 'Today');
      fixture.componentRef.setInput('showThisMonthButton', true);
      fixture.componentRef.setInput('thisMonthLabel', 'This month');
      toggle().click();
      fixture.detectChanges();

      expect(panel()!.querySelector('.gog-calendar__today')?.textContent?.trim()).toBe('Today');
      expect(panel()!.querySelector('.gog-calendar__action--this-month')?.textContent?.trim()).toBe(
        'This month',
      );
    });
  });

  it('should render the calendar with no field at all when inline', () => {
    fixture.componentRef.setInput('inline', true);
    fixture.detectChanges();

    expect(host().querySelector('gog-calendar')).toBeTruthy();
    expect(host().querySelector('.gog-datepicker__control')).toBeNull();
  });

  it('should clear both the value and the text', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', new Date(2026, 1, 3));
    fixture.detectChanges();

    host().querySelector<HTMLButtonElement>('.gog-datepicker__clear')!.click();
    fixture.detectChanges();

    expect(component.value()).toBeNull();
    expect(field().value).toBe('');
  });

  it('should offer no clear button while empty', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.detectChanges();

    expect(host().querySelector('.gog-datepicker__clear')).toBeNull();
  });

  it('should disable the field and the toggle', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(field().disabled).toBe(true);
    expect(toggle().disabled).toBe(true);
  });

  it('should not open while disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    toggle().click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should show a manual error message', () => {
    fixture.componentRef.setInput('errorMessage', 'Required field');
    fixture.detectChanges();

    const error = host().querySelector('.gog-datepicker__error');
    expect(error?.textContent?.trim()).toBe('Required field');
    expect(field().getAttribute('aria-describedby')).toBe(error?.id);
    expect(field().getAttribute('aria-invalid')).toBe('true');
  });
});

describe('DatepickerComponent — GOG_CONFIG', () => {
  it('should take the locale and format from the global config', async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerComponent],
      providers: [
        {
          provide: GOG_CONFIG,
          useValue: { datepicker: { locale: 'ru-RU', format: 'yyyy/MM/dd' } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('value', new Date(2026, 1, 3));
    await fixture.whenStable();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value).toBe('2026/02/03');
  });
});

@Component({
  imports: [DatepickerComponent, ReactiveFormsModule],
  template: `<gog-datepicker [formControl]="control" label="Date" locale="en-US" />`,
})
class ReactiveHost {
  readonly control = new FormControl<Date | null>(new Date(2026, 1, 3));
  readonly touched = signal(false);
}

describe('DatepickerComponent — Reactive Forms', () => {
  let fixture: ComponentFixture<ReactiveHost>;
  let hostComponent: ReactiveHost;

  function field(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
    fixture = TestBed.createComponent(ReactiveHost);
    hostComponent = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show the control value', () => {
    expect(field().value).toBe('03.02.2026');
  });

  it('should push a typed date back into the control', () => {
    field().dispatchEvent(new Event('focus'));
    field().value = '10.03.2026';
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const value = hostComponent.control.value as Date;
    expect(value.getMonth()).toBe(2);
    expect(value.getDate()).toBe(10);
  });

  it('should honour the control being disabled', async () => {
    hostComponent.control.disable();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field().disabled).toBe(true);
  });

  it('should mark the control touched on blur', () => {
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hostComponent.control.touched).toBe(true);
  });
});
