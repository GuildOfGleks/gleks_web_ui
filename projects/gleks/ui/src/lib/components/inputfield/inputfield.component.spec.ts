import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { vi } from 'vitest';

import { InputfieldComponent } from './inputfield.component';
import { GOG_CONFIG } from '../../shared/config';

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

  describe('fullWidth', () => {
    it('should not apply the auto-width host class by default', () => {
      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(false);
    });

    it('should apply the auto-width host class when set to false', async () => {
      fixture.componentRef.setInput('fullWidth', false);
      await fixture.whenStable();

      expect(fixture.nativeElement.classList.contains('gog-host--auto-width')).toBe(true);
    });
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

  describe('type="number"', () => {
    @Component({
      imports: [InputfieldComponent, ReactiveFormsModule],
      template: `<gog-inputfield
        type="number"
        [min]="1"
        [max]="10"
        [step]="1"
        [formControl]="control"
      />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class NumberInputfieldFormHostComponent {
      readonly control = new FormControl<number | null>(5, { nonNullable: false });
    }

    it('renders a native number input with min/max/step attributes', async () => {
      const hostFixture = TestBed.createComponent(NumberInputfieldFormHostComponent);
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('number');
      expect(input.min).toBe('1');
      expect(input.max).toBe('10');
      expect(input.step).toBe('1');
      expect(input.value).toBe('5');
    });

    it('propagates typing to the FormControl as a number, not a string', async () => {
      const hostFixture = TestBed.createComponent(NumberInputfieldFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '7';
      input.dispatchEvent(new Event('input'));
      await hostFixture.whenStable();

      expect(host.control.value).toBe(7);
      expect(typeof host.control.value).toBe('number');
    });

    it('propagates an empty field as null', async () => {
      const hostFixture = TestBed.createComponent(NumberInputfieldFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('input'));
      await hostFixture.whenStable();

      expect(host.control.value).toBeNull();
    });
  });

  describe('type="date"', () => {
    it('renders a native date input', async () => {
      fixture.componentRef.setInput('type', 'date');
      fixture.componentRef.setInput('value', '2026-07-04');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('date');
      expect(input.value).toBe('2026-07-04');
    });
  });

  describe('floatLabel', () => {
    it('defaults to none — no float-label markup, and placeholder passes through unchanged', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('placeholder', 'you@example.com');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input__label--float')).toBeNull();
      expect(fixture.nativeElement.querySelector('.gog-input__label')?.textContent).toBe('Email');
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.placeholder).toBe('you@example.com');
    });

    it('renders the float label and hides the placeholder once a variant is set', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('placeholder', 'you@example.com');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input__label--float')?.textContent).toBe(
        'Email',
      );
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.placeholder).toBe('');
      expect(
        fixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).not.toContain('gog-input-wrapper--floated');
    });

    it('instance floatLabel input wins over GOG_CONFIG.floatLabel.variant', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [InputfieldComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'over' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(InputfieldComponent);
      providedFixture.componentRef.setInput('label', 'Email');
      providedFixture.componentRef.setInput('floatLabel', 'in');
      await providedFixture.whenStable();

      expect(
        providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).toContain('gog-input-wrapper--float-in');
    });

    it('falls back to GOG_CONFIG.floatLabel.variant when the instance input is unset', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [InputfieldComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'on' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(InputfieldComponent);
      providedFixture.componentRef.setInput('label', 'Email');
      await providedFixture.whenStable();

      expect(
        providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).toContain('gog-input-wrapper--float-on');
    });

    it('marks the field as floated once it has a value, even without focus', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('floatLabel', 'in');
      fixture.componentRef.setInput('value', 'a@b.com');
      await fixture.whenStable();

      expect(
        fixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).toContain('gog-input-wrapper--floated');
    });

    it('marks the field as floated on focus and unfloats on blur when still empty', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).toContain('gog-input-wrapper--floated');

      input.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector('.gog-input-wrapper').classList,
      ).not.toContain('gog-input-wrapper--floated');
    });

    describe('floatLabelShowPlaceholder', () => {
      it('keeps the placeholder hidden at rest even when true, and reveals it once floated', async () => {
        fixture.componentRef.setInput('label', 'Email');
        fixture.componentRef.setInput('placeholder', 'you@example.com');
        fixture.componentRef.setInput('floatLabel', 'in');
        fixture.componentRef.setInput('floatLabelShowPlaceholder', true);
        await fixture.whenStable();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.placeholder).toBe('');

        input.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        expect(input.placeholder).toBe('you@example.com');
      });
    });
  });
});
