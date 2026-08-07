import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextareaComponent } from './textarea.component';
import { GOG_CONFIG } from '../../shared/config';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
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

  it('should update value from the native textarea', () => {
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('hello');
  });

  it('should render the configured rows', async () => {
    fixture.componentRef.setInput('rows', 6);
    await fixture.whenStable();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(6);
  });

  describe('disabled', () => {
    it('should render the native disabled attribute', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });
  });

  describe('errorMessage', () => {
    it('shows the error as soon as errorMessage is non-empty', () => {
      fixture.componentRef.setInput('errorMessage', 'Notes are required');
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const error = fixture.nativeElement.querySelector('.gog-input__error') as HTMLElement;
      expect(textarea.classList.contains('gog-input__field--error')).toBe(true);
      expect(textarea.getAttribute('aria-invalid')).toBe('true');
      expect(error?.textContent).toContain('Notes are required');
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      imports: [TextareaComponent, ReactiveFormsModule],
      template: `<gog-textarea [formControl]="control" errorMessage="Required" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TextareaFormHostComponent {
      readonly control = new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      });
    }

    it('propagates typing to the FormControl value', async () => {
      const hostFixture = TestBed.createComponent(TextareaFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      const textarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'hello';
      textarea.dispatchEvent(new Event('input'));
      await hostFixture.whenStable();

      expect(host.control.value).toBe('hello');
    });

    it('applies values written to the FormControl via writeValue', async () => {
      const hostFixture = TestBed.createComponent(TextareaFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      host.control.setValue('preset text');
      await hostFixture.whenStable();

      const textarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('preset text');
    });

    it('marks the FormControl as touched on blur', async () => {
      const hostFixture = TestBed.createComponent(TextareaFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      expect(host.control.touched).toBe(false);

      const textarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('blur'));
      await hostFixture.whenStable();

      expect(host.control.touched).toBe(true);
    });

    it('disables the native textarea when the FormControl is disabled', async () => {
      const hostFixture = TestBed.createComponent(TextareaFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      host.control.disable();
      await hostFixture.whenStable();

      const textarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });

    it('defaults to manual, showing the error immediately despite an untouched FormControl', async () => {
      const hostFixture = TestBed.createComponent(TextareaFormHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.control.touched).toBe(false);
      expect(hostFixture.nativeElement.querySelector('.gog-input__error')?.textContent).toContain(
        'Required',
      );
    });
  });

  describe('floatLabel', () => {
    it('defaults to none — no float-label markup, and placeholder passes through unchanged', async () => {
      fixture.componentRef.setInput('label', 'Notes');
      fixture.componentRef.setInput('placeholder', 'Add notes...');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input__label--float')).toBeNull();
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('Add notes...');
    });

    it('renders the float label and hides the placeholder once a variant is set', async () => {
      fixture.componentRef.setInput('label', 'Notes');
      fixture.componentRef.setInput('placeholder', 'Add notes...');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input__label--float')?.textContent).toBe(
        'Notes',
      );
      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('');
    });

    it('instance floatLabel input wins over GOG_CONFIG.floatLabel.variant', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TextareaComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'over' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(TextareaComponent);
      providedFixture.componentRef.setInput('label', 'Notes');
      providedFixture.componentRef.setInput('floatLabel', 'in');
      await providedFixture.whenStable();

      expect(providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--float-in',
      );
    });

    it('falls back to GOG_CONFIG.floatLabel.variant when the instance input is unset', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TextareaComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { floatLabel: { variant: 'on' } } }],
      }).compileComponents();

      const providedFixture = TestBed.createComponent(TextareaComponent);
      providedFixture.componentRef.setInput('label', 'Notes');
      await providedFixture.whenStable();

      expect(providedFixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--float-on',
      );
    });

    it('marks the field as floated once it has a value, even without focus', async () => {
      fixture.componentRef.setInput('label', 'Notes');
      fixture.componentRef.setInput('floatLabel', 'in');
      fixture.componentRef.setInput('value', 'some text');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--floated',
      );
    });

    it('marks the field as floated on focus and unfloats on blur when still empty', async () => {
      fixture.componentRef.setInput('label', 'Notes');
      fixture.componentRef.setInput('floatLabel', 'in');
      await fixture.whenStable();

      const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).toContain(
        'gog-input-wrapper--floated',
      );

      textarea.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-input-wrapper').classList).not.toContain(
        'gog-input-wrapper--floated',
      );
    });

    describe('floatLabelShowPlaceholder', () => {
      it('keeps the placeholder hidden at rest even when true, and reveals it once floated', async () => {
        fixture.componentRef.setInput('label', 'Notes');
        fixture.componentRef.setInput('placeholder', 'Add notes...');
        fixture.componentRef.setInput('floatLabel', 'in');
        fixture.componentRef.setInput('floatLabelShowPlaceholder', true);
        await fixture.whenStable();

        const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.placeholder).toBe('');

        textarea.dispatchEvent(new Event('focus'));
        await fixture.whenStable();
        expect(textarea.placeholder).toBe('Add notes...');
      });
    });
  });
});
