import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { vi } from 'vitest';

import { GogInputAddonEndDirective, InputfieldComponent } from './inputfield.component';
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

    describe('spin buttons', () => {
      function spinButtons(root: HTMLElement): { up: HTMLButtonElement; down: HTMLButtonElement } {
        return {
          up: root.querySelector('.gog-input__spin-btn--up')!,
          down: root.querySelector('.gog-input__spin-btn--down')!,
        };
      }

      it('should render by default and step the FormControl by `step`', async () => {
        const hostFixture = TestBed.createComponent(NumberInputfieldFormHostComponent);
        const host = hostFixture.componentInstance;
        await hostFixture.whenStable();

        const { up, down } = spinButtons(hostFixture.nativeElement);
        expect(up).toBeTruthy();
        expect(down).toBeTruthy();

        up.click();
        expect(host.control.value).toBe(6);

        down.click();
        down.click();
        expect(host.control.value).toBe(4);
      });

      it('should clamp to min/max and disable the button at the boundary', async () => {
        const hostFixture = TestBed.createComponent(NumberInputfieldFormHostComponent);
        const host = hostFixture.componentInstance;
        host.control.setValue(10);
        await hostFixture.whenStable();
        hostFixture.detectChanges();

        const { up, down } = spinButtons(hostFixture.nativeElement);
        expect(up.disabled).toBe(true);

        up.click();
        expect(host.control.value).toBe(10);

        host.control.setValue(1);
        await hostFixture.whenStable();
        hostFixture.detectChanges();
        expect(down.disabled).toBe(true);

        down.click();
        expect(host.control.value).toBe(1);
      });

      it('should step from 0 when the field starts empty and has no min', async () => {
        fixture.componentRef.setInput('type', 'number');
        fixture.detectChanges();

        const { up } = spinButtons(fixture.nativeElement);
        up.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('input').value).toBe('1');
      });

      it('should keep focus on the field instead of moving it to the button', () => {
        fixture.componentRef.setInput('type', 'number');
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.focus();

        const { up } = spinButtons(fixture.nativeElement);
        const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        up.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
      });

      it('should hide the native spin glyphs on the input regardless of showSpinButtons', () => {
        fixture.componentRef.setInput('type', 'number');
        fixture.componentRef.setInput('showSpinButtons', false);
        fixture.detectChanges();

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(input.classList.contains('gog-input__field--spin-hidden')).toBe(true);
      });

      it('should render neither button when switched off', () => {
        fixture.componentRef.setInput('type', 'number');
        fixture.componentRef.setInput('showSpinButtons', false);
        fixture.detectChanges();

        const { up, down } = spinButtons(fixture.nativeElement);
        expect(up).toBeNull();
        expect(down).toBeNull();
      });

      it('should fall back to GOG_CONFIG.inputfield.showSpinButtons when unset', async () => {
        TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
          imports: [InputfieldComponent],
          providers: [
            { provide: GOG_CONFIG, useValue: { inputfield: { showSpinButtons: false } } },
          ],
        }).compileComponents();

        const configFixture = TestBed.createComponent(InputfieldComponent);
        configFixture.componentRef.setInput('type', 'number');
        await configFixture.whenStable();
        configFixture.detectChanges();

        const { up, down } = spinButtons(configFixture.nativeElement);
        expect(up).toBeNull();
        expect(down).toBeNull();
      });
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
      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).not.toContain(
        'gog-input-wrapper--floated',
      );
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

      expect(providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--float-in',
      );
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

      expect(providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--float-on',
      );
    });

    it('marks the field as floated once it has a value, even without focus', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('floatLabel', 'in');
      fixture.componentRef.setInput('value', 'a@b.com');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--floated',
      );
    });

    it('marks the field as floated on focus and unfloats on blur when still empty', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--floated',
      );

      input.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).not.toContain(
        'gog-input-wrapper--floated',
      );
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

  describe('generated id', () => {
    it('labels the field with a generated id when inputId is not supplied', async () => {
      fixture.componentRef.setInput('label', 'Email');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      expect(input.id).toMatch(/^gog-input-\d+$/);
      expect(label.getAttribute('for')).toBe(input.id);
    });

    it('lets an explicit inputId win', async () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('inputId', 'my-email');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.id).toBe('my-email');
      expect(fixture.nativeElement.querySelector('label')?.getAttribute('for')).toBe('my-email');
    });

    it('gives two instances different ids', async () => {
      const second = TestBed.createComponent(InputfieldComponent);
      await second.whenStable();
      fixture.detectChanges();
      second.detectChanges();

      const first = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const other = second.nativeElement.querySelector('input') as HTMLInputElement;
      expect(first.id).not.toBe(other.id);
    });

    it('points aria-describedby at the rendered error, with no inputId set', async () => {
      fixture.componentRef.setInput('errorMessage', 'Required');
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const error = fixture.nativeElement.querySelector('.gog-input__error') as HTMLElement;

      expect(error.id).toBe(input.id + '-error');
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
    });

    it('drops aria-describedby when no error is rendered', async () => {
      await fixture.whenStable();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('native attributes', () => {
    it('forwards readonly, maxlength, minlength, pattern, inputmode and spellcheck', async () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('maxlength', 10);
      fixture.componentRef.setInput('minlength', 2);
      fixture.componentRef.setInput('pattern', '[0-9]+');
      fixture.componentRef.setInput('inputMode', 'numeric');
      fixture.componentRef.setInput('spellcheck', false);
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.readOnly).toBe(true);
      expect(input.getAttribute('maxlength')).toBe('10');
      expect(input.getAttribute('minlength')).toBe('2');
      expect(input.getAttribute('pattern')).toBe('[0-9]+');
      expect(input.getAttribute('inputmode')).toBe('numeric');
      expect(input.getAttribute('spellcheck')).toBe('false');
    });

    it('leaves every optional attribute off by default', async () => {
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.readOnly).toBe(false);
      expect(input.getAttribute('maxlength')).toBeNull();
      expect(input.getAttribute('minlength')).toBeNull();
      expect(input.getAttribute('pattern')).toBeNull();
      expect(input.getAttribute('inputmode')).toBeNull();
      expect(input.getAttribute('spellcheck')).toBeNull();
    });

    it('accepts the widened type list', async () => {
      fixture.componentRef.setInput('type', 'tel');
      await fixture.whenStable();

      expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).type).toBe('tel');
    });

    it('hides the clear button while readonly', async () => {
      fixture.componentRef.setInput('clearable', true);
      fixture.componentRef.setInput('value', 'text');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input__clear')).toBeTruthy();

      fixture.componentRef.setInput('readonly', true);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input__clear')).toBeNull();
    });

    it('hides the number spin buttons while readonly', async () => {
      fixture.componentRef.setInput('type', 'number');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input__spin')).toBeTruthy();

      fixture.componentRef.setInput('readonly', true);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input__spin')).toBeNull();
    });
  });

  describe('clear button and forms', () => {
    it('writes null to a number control, matching what emptying the field by hand writes', async () => {
      const control = new FormControl<number | null>(5);

      // `showSpinButtons` off because the spin buttons and the clear button share the field's
      // end slot, and the spin buttons win that branch — a number field only ever offers a
      // clear button with them switched off.
      @Component({
        imports: [InputfieldComponent, ReactiveFormsModule],
        template: `<gog-inputfield
          type="number"
          [clearable]="true"
          [showSpinButtons]="false"
          [formControl]="control"
        />`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class NumberHost {
        readonly control = control;
      }

      const host = TestBed.createComponent(NumberHost);
      await host.whenStable();
      host.detectChanges();

      const clear = host.nativeElement.querySelector('.gog-input__clear') as HTMLButtonElement;
      clear.click();
      await host.whenStable();

      expect(control.value).toBeNull();
    });

    it('writes an empty string to a text control', async () => {
      const control = new FormControl<string | null>('hello');

      @Component({
        imports: [InputfieldComponent, ReactiveFormsModule],
        template: '<gog-inputfield [clearable]="true" [formControl]="control" />',
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TextHost {
        readonly control = control;
      }

      const host = TestBed.createComponent(TextHost);
      await host.whenStable();
      host.detectChanges();

      (host.nativeElement.querySelector('.gog-input__clear') as HTMLButtonElement).click();
      await host.whenStable();

      expect(control.value).toBe('');
    });
  });

  describe('labels', () => {
    async function configuredFixture(labels: Record<string, string>) {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [InputfieldComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { labels } }],
      }).compileComponents();

      const configured = TestBed.createComponent(InputfieldComponent);
      configured.componentRef.setInput('clearable', true);
      configured.componentRef.setInput('value', 'text');
      return configured;
    }

    it('takes the clear button name from GOG_CONFIG.labels', async () => {
      const configured = await configuredFixture({ clear: 'Wipe' });
      await configured.whenStable();

      expect(
        configured.nativeElement.querySelector('.gog-input__clear')?.getAttribute('aria-label'),
      ).toBe('Wipe');
    });

    it('lets the instance input win over the configured label', async () => {
      const configured = await configuredFixture({ clear: 'Wipe' });
      configured.componentRef.setInput('clearAriaLabel', 'Erase');
      await configured.whenStable();

      expect(
        configured.nativeElement.querySelector('.gog-input__clear')?.getAttribute('aria-label'),
      ).toBe('Erase');
    });
  });

  describe('clear button on a number field', () => {
    /** Both affordances live in the field's end slot; before 21.3.2 the stepper won outright. */
    it('shows the stepper and the clear button together once there is a value', async () => {
      fixture.componentRef.setInput('type', 'number');
      fixture.componentRef.setInput('clearable', true);
      await fixture.whenStable();

      // Nothing to clear yet — the stepper is alone in the slot.
      expect(fixture.nativeElement.querySelector('.gog-input__spin')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.gog-input__clear')).toBeNull();
      expect(
        fixture.nativeElement
          .querySelector('.gog-input-wrapper')
          .classList.contains('gog-input-wrapper--spin-clear'),
      ).toBe(false);

      fixture.componentRef.setInput('value', '42');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input__spin')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.gog-input__clear')).toBeTruthy();
      expect(
        fixture.nativeElement
          .querySelector('.gog-input-wrapper')
          .classList.contains('gog-input-wrapper--spin-clear'),
      ).toBe(true);
    });

    it('clears to null and drops back to the stepper alone', async () => {
      const control = new FormControl<number | null>(7);

      @Component({
        imports: [InputfieldComponent, ReactiveFormsModule],
        template: '<gog-inputfield type="number" [clearable]="true" [formControl]="control" />',
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class SpinClearHost {
        readonly control = control;
      }

      const host = TestBed.createComponent(SpinClearHost);
      await host.whenStable();
      host.detectChanges();

      const clear = host.nativeElement.querySelector('.gog-input__clear') as HTMLButtonElement;
      expect(clear).toBeTruthy();
      clear.click();
      await host.whenStable();
      host.detectChanges();

      expect(control.value).toBeNull();
      expect(host.nativeElement.querySelector('.gog-input__clear')).toBeNull();
      expect(host.nativeElement.querySelector('.gog-input__spin')).toBeTruthy();
    });

    it('still lets the clear button displace a projected end addon on a text field', async () => {
      @Component({
        imports: [InputfieldComponent, GogInputAddonEndDirective],
        template: `<gog-inputfield [clearable]="true" [value]="value()">
          <span gogInputAddonEnd>kg</span>
        </gog-inputfield>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class AddonHost {
        readonly value = signal('');
      }

      const host = TestBed.createComponent(AddonHost);
      await host.whenStable();
      host.detectChanges();
      expect(host.nativeElement.querySelector('.gog-input__addon')).toBeTruthy();

      host.componentInstance.value.set('x');
      await host.whenStable();
      host.detectChanges();

      expect(host.nativeElement.querySelector('.gog-input__clear')).toBeTruthy();
      expect(host.nativeElement.querySelector('.gog-input__addon')).toBeNull();
    });
  });
});
