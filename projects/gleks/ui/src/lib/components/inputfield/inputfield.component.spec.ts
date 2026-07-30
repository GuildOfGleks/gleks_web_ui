import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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

      expect(
        fixture.nativeElement.querySelector('.gog-input__icon--end.gog-input__icon--action'),
      ).toBeNull();
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

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      imports: [InputfieldComponent, ReactiveFormsModule],
      template: `<gog-inputfield [formControl]="control" errorMessage="Required" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class InputfieldFormHostComponent {
      readonly control = new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      });
    }

    it('propagates typing to the FormControl value', async () => {
      const hostFixture = TestBed.createComponent(InputfieldFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = 'hello';
      input.dispatchEvent(new Event('input'));
      await hostFixture.whenStable();

      expect(host.control.value).toBe('hello');
    });

    it('marks the FormControl as touched on blur', async () => {
      const hostFixture = TestBed.createComponent(InputfieldFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      expect(host.control.touched).toBe(false);

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      await hostFixture.whenStable();

      expect(host.control.touched).toBe(true);
    });

    it('defaults to manual, showing the error immediately despite an untouched FormControl', async () => {
      const hostFixture = TestBed.createComponent(InputfieldFormHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.control.touched).toBe(false);
      expect(hostFixture.nativeElement.querySelector('.gog-input__error')?.textContent).toContain(
        'Required',
      );
    });

    it('withholds the error until touched when errorDisplay is auto', async () => {
      @Component({
        imports: [InputfieldComponent, ReactiveFormsModule],
        template: `<gog-inputfield
          [formControl]="control"
          errorMessage="Required"
          errorDisplay="auto"
        />`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class AutoErrorDisplayHostComponent {
        readonly control = new FormControl('', {
          nonNullable: true,
          validators: Validators.required,
        });
      }

      const hostFixture = TestBed.createComponent(AutoErrorDisplayHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-input__error')).toBeNull();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-input__error')?.textContent).toContain(
        'Required',
      );
    });
  });
});
