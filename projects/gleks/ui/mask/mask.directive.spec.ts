import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GogMaskDirective } from './mask.directive';
import type { GogMask, GogMaskState, GogMaskValue } from './mask-engine';

const PHONE = '+38 (000) 000-00-00';

@Component({
  imports: [GogMaskDirective, ReactiveFormsModule],
  template: `<input
    [gogMask]="mask()"
    [gogMaskValue]="kind()"
    [formControl]="control"
    [attr.type]="type()"
  />`,
})
class ReactiveHost {
  readonly mask = signal<GogMask | null>(PHONE);
  readonly kind = signal<GogMaskValue>('raw');
  readonly type = signal('text');
  readonly control = new FormControl<string | null>('', Validators.required);
}

@Component({
  imports: [GogMaskDirective, FormsModule],
  template: `<input gogMask="00/00" [(ngModel)]="value" />
    <input gogMask="0000" inputmode="text" (gogMaskChange)="seen.push($event)" />
    <input gogMask="aa" />`,
})
class PlainHost {
  value = '';
  readonly seen: GogMaskState[] = [];
}

/** Puts `text` in the input with the caret at `caret` (the end by default), as typing would. */
function type(input: HTMLInputElement, text: string, caret = text.length): void {
  input.value = text;
  input.setSelectionRange(caret, caret);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function key(input: HTMLInputElement, name: string, caret: number): KeyboardEvent {
  input.setSelectionRange(caret, caret);
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
  input.dispatchEvent(event);
  return event;
}

describe('GogMaskDirective', () => {
  describe('with a reactive form', () => {
    let fixture: ComponentFixture<ReactiveHost>;
    let input: HTMLInputElement;
    const host = () => fixture.componentInstance;

    beforeEach(() => {
      fixture = TestBed.createComponent(ReactiveHost);
      fixture.detectChanges();
      input = fixture.nativeElement.querySelector('input');
      input.focus();
    });

    it('formats what is typed and hands the form the raw value', () => {
      type(input, '050123');
      expect(input.value).toBe('+38 (050) 123');
      expect(host().control.value).toBe('050123');
    });

    it('formats a value written in, read as raw', () => {
      host().control.setValue('3812345678');
      expect(input.value).toBe('+38 (381) 234-56-78');
    });

    it('hands over and reads the formatted text with maskValue "formatted"', () => {
      host().kind.set('formatted');
      fixture.detectChanges();
      type(input, '0501');
      expect(host().control.value).toBe('+38 (050) 1');
      host().control.setValue('+38 (067) 765-43-21');
      expect(input.value).toBe('+38 (067) 765-43-21');
    });

    it('keeps the caret after the same digits when typing in the middle', () => {
      type(input, '+38 (050) 12');
      // A 9 typed after "05": the browser puts it there and the caret after it.
      type(input, '+38 (0590) 12', 8);
      expect(input.value).toBe('+38 (059) 012');
      expect(input.selectionStart).toBe(8);
    });

    it('drops what a slot rejects without moving the caret', () => {
      type(input, '+38 (050');
      type(input, '+38 (050x');
      expect(input.value).toBe('+38 (050');
      expect(input.selectionStart).toBe(8);
    });

    it('steps Backspace and Delete over a literal to the digit beyond it', () => {
      type(input, '+38 (050) 12');
      // The caret after ") ", before the 1.
      const back = key(input, 'Backspace', 10);
      expect(back.defaultPrevented).toBe(true);
      expect(input.value).toBe('+38 (051) 2');
      expect(input.selectionStart).toBe(7);
      expect(host().control.value).toBe('0512');

      // The caret before ") ": Delete takes the 2.
      const forward = key(input, 'Delete', 8);
      expect(forward.defaultPrevented).toBe(true);
      expect(input.value).toBe('+38 (051');
      expect(host().control.value).toBe('051');
    });

    it('leaves Backspace on a digit to the browser', () => {
      type(input, '+38 (050) 12');
      expect(key(input, 'Backspace', 12).defaultPrevented).toBe(false);
    });

    it('is invalid while incomplete, and leaves empty to required', () => {
      type(input, '050');
      expect(host().control.errors).toEqual({ gogMask: { actual: 3, required: 10 } });
      type(input, '0501234567');
      expect(host().control.errors).toBeNull();
      type(input, '');
      expect(host().control.errors).toEqual({ required: true });
    });

    it('re-shapes and re-judges the value when the pattern changes', () => {
      type(input, '0501234567');
      host().mask.set('000-000-0000');
      fixture.detectChanges();
      expect(input.value).toBe('050-123-4567');
      host().mask.set('000-000-00000');
      fixture.detectChanges();
      expect(host().control.errors).toEqual({ gogMask: { actual: 10, required: 11 } });
    });

    it('waits for an IME composition to end before conforming', () => {
      type(input, '050');
      input.dispatchEvent(new CompositionEvent('compositionstart'));
      type(input, '+38 (050x');
      expect(input.value).toBe('+38 (050x');
      input.dispatchEvent(new CompositionEvent('compositionend'));
      expect(input.value).toBe('+38 (050');
    });

    it('is a plain input with the mask off', () => {
      host().mask.set(null);
      fixture.detectChanges();
      type(input, 'anything');
      expect(input.value).toBe('anything');
      expect(host().control.value).toBe('anything');
    });

    it('does nothing on a number input, and says why in dev mode', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const numberFixture = TestBed.createComponent(ReactiveHost);
      numberFixture.componentInstance.type.set('number');
      numberFixture.detectChanges();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('type="number"'));
      warn.mockRestore();
    });
  });

  describe('elsewhere', () => {
    let fixture: ComponentFixture<PlainHost>;
    let inputs: HTMLInputElement[];

    beforeEach(async () => {
      fixture = TestBed.createComponent(PlainHost);
      fixture.detectChanges();
      await fixture.whenStable();
      inputs = [...fixture.nativeElement.querySelectorAll('input')];
    });

    it('works with ngModel', async () => {
      type(inputs[0], '1225');
      expect(inputs[0].value).toBe('12/25');
      expect(fixture.componentInstance.value).toBe('1225');
      fixture.componentInstance.value = '0130';
      fixture.detectChanges();
      await fixture.whenStable();
      expect(inputs[0].value).toBe('01/30');
    });

    it('reports every value with no form around it', () => {
      type(inputs[1], '12a3');
      expect(fixture.componentInstance.seen.at(-1)).toEqual({
        display: '123',
        raw: '123',
        complete: false,
        slots: 4,
      });
    });

    it("asks for a numeric keyboard for digits only, never over the consumer's own", () => {
      expect(inputs[0].getAttribute('inputmode')).toBe('numeric');
      expect(inputs[1].getAttribute('inputmode')).toBe('text');
      expect(inputs[2].hasAttribute('inputmode')).toBe(false);
    });
  });
});
