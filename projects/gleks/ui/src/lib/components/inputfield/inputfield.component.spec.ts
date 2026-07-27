import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { InputfieldComponent } from './inputfield.component';

describe('InputfieldComponent', () => {
  let component: InputfieldComponent;
  let fixture: ComponentFixture<InputfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputfieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputfieldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update value from the native input', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('hello');
  });

  describe('errorMessage', () => {
    it('shows the error as soon as errorMessage is non-empty, even with a value present', () => {
      fixture.componentRef.setInput('value', 'not-an-email');
      fixture.componentRef.setInput('errorMessage', 'Email is invalid');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const error = fixture.nativeElement.querySelector('.gog-input__error') as HTMLElement;
      expect(input.classList.contains('gog-input__field--error')).toBe(true);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(error?.textContent).toContain('Email is invalid');
    });

    it('hides the error only when the consumer clears errorMessage', () => {
      fixture.componentRef.setInput('errorMessage', 'Required');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-input__error')).toBeTruthy();

      fixture.componentRef.setInput('errorMessage', '');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-input__error')).toBeNull();
    });
  });

  describe('icon actions', () => {
    it('invokes iconStartFn when the leading icon button is clicked', () => {
      const onStart = vi.fn();
      fixture.componentRef.setInput('iconStart', 'check');
      fixture.componentRef.setInput('iconStartFn', onStart);
      fixture.componentRef.setInput('iconStartLabel', 'Start action');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        '.gog-input__icon--start.gog-input__icon--action',
      ) as HTMLButtonElement;
      button.click();

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('invokes iconEndFn when the trailing icon button is clicked', () => {
      const onEnd = vi.fn();
      fixture.componentRef.setInput('iconEnd', 'check');
      fixture.componentRef.setInput('iconEndFn', onEnd);
      fixture.componentRef.setInput('iconEndLabel', 'End action');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        '.gog-input__icon--end.gog-input__icon--action',
      ) as HTMLButtonElement;
      button.click();

      expect(onEnd).toHaveBeenCalledTimes(1);
    });

    it('renders a non-interactive icon span when no action fn is provided', () => {
      fixture.componentRef.setInput('iconEnd', 'check');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-input__icon--end.gog-input__icon--action')).toBeNull();
      expect(fixture.nativeElement.querySelector('.gog-input__icon--end')).toBeTruthy();
    });
  });

  describe('autocomplete default', () => {
    it('defaults to current-password for password fields', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.autocomplete).toBe('current-password');
    });

    it('defaults to off for non-password fields', () => {
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.autocomplete).toBe('off');
    });

    it('respects an explicit autocomplete value', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('autocomplete', 'new-password');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.autocomplete).toBe('new-password');
    });
  });

  describe('disabled via ControlValueAccessor', () => {
    it('disables the native input when setDisabledState(true) is called', () => {
      fixture.detectChanges();
      component.setDisabledState(true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('re-enables the input when setDisabledState(false) is called', () => {
      fixture.detectChanges();
      component.setDisabledState(true);
      fixture.detectChanges();
      component.setDisabledState(false);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });

    it('stays disabled when the disabled input is true regardless of CVA state', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      component.setDisabledState(false);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
