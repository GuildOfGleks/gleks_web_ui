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

  describe('resize', () => {
    function textarea(): HTMLTextAreaElement {
      return fixture.nativeElement.querySelector('textarea');
    }

    function container(): HTMLElement {
      return fixture.nativeElement.querySelector('.gog-input__field-container');
    }

    it('defaults to vertical, matching a plain <textarea>', () => {
      fixture.detectChanges();

      expect(textarea().classList.contains('gog-textarea__field--resize-vertical')).toBe(true);
      expect(container().classList.contains('gog-input__field-container--resizable')).toBe(true);
    });

    it('applies the class matching each explicit value', async () => {
      for (const value of ['horizontal', 'both', 'none'] as const) {
        fixture.componentRef.setInput('resize', value);
        await fixture.whenStable();

        expect(textarea().classList.contains(`gog-textarea__field--resize-${value}`)).toBe(true);
      }
    });

    it('drops the resizable-container class once resize is none', async () => {
      fixture.componentRef.setInput('resize', 'none');
      await fixture.whenStable();

      expect(container().classList.contains('gog-input__field-container--resizable')).toBe(false);
    });

    it('drops the resizable-container class while disabled, even with resize still on', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      expect(container().classList.contains('gog-input__field-container--resizable')).toBe(false);
    });

    it('falls back to GOG_CONFIG.textarea.resize when the instance input is unset', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TextareaComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { textarea: { resize: 'none' } } }],
      }).compileComponents();

      const configFixture = TestBed.createComponent(TextareaComponent);
      await configFixture.whenStable();

      const configTextarea = configFixture.nativeElement.querySelector('textarea');
      expect(configTextarea.classList.contains('gog-textarea__field--resize-none')).toBe(true);
    });

    it('lets an explicit instance input win over GOG_CONFIG.textarea.resize', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TextareaComponent],
        providers: [{ provide: GOG_CONFIG, useValue: { textarea: { resize: 'none' } } }],
      }).compileComponents();

      const configFixture = TestBed.createComponent(TextareaComponent);
      configFixture.componentRef.setInput('resize', 'both');
      await configFixture.whenStable();

      const configTextarea = configFixture.nativeElement.querySelector('textarea');
      expect(configTextarea.classList.contains('gog-textarea__field--resize-both')).toBe(true);
    });
  });

  describe('resize grip tracking (ResizeObserver)', () => {
    // jsdom has no ResizeObserver at all, so the component's own is stubbed for this block —
    // observe() just records what it was asked to watch, and the test drives the callback by
    // hand to simulate the field having been dragged narrower/shorter than its container (a
    // real drag can't be simulated in jsdom; this exercises the same code path directly).
    class MockResizeObserver {
      static instances: MockResizeObserver[] = [];
      readonly observed: Element[] = [];

      constructor(readonly callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this);
      }

      observe(el: Element): void {
        this.observed.push(el);
      }

      // eslint-disable-next-line @typescript-eslint/no-empty-function -- unused by the component
      unobserve(): void {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- unused by the component
      disconnect(): void {}
    }

    let originalResizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
      MockResizeObserver.instances = [];
      originalResizeObserver = globalThis.ResizeObserver;
      globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      globalThis.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
    });

    function mockSize(
      el: HTMLElement,
      metrics: Partial<{
        clientWidth: number;
        clientHeight: number;
        offsetWidth: number;
        offsetHeight: number;
      }>,
    ): void {
      for (const [key, value] of Object.entries(metrics)) {
        Object.defineProperty(el, key, { value, configurable: true });
      }
    }

    it('keeps the resize grip glued to the field once it measures narrower/shorter than its container', async () => {
      const freshFixture = TestBed.createComponent(TextareaComponent);
      await freshFixture.whenStable();
      freshFixture.detectChanges();

      const field = freshFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const container = field.parentElement as HTMLElement;
      const observer = MockResizeObserver.instances.find((o) => o.observed.includes(field));
      expect(observer).toBeTruthy();

      mockSize(container, { clientWidth: 400, clientHeight: 100 });
      mockSize(field, { offsetWidth: 300, offsetHeight: 80 });
      observer!.callback([], observer as unknown as ResizeObserver);
      freshFixture.detectChanges();

      expect(freshFixture.componentInstance['resizeInsetRight']()).toBe(100);
      expect(freshFixture.componentInstance['resizeInsetBottom']()).toBe(20);
      expect(container.style.getPropertyValue('--gog-textarea-resize-inset-right')).toBe('100px');
      expect(container.style.getPropertyValue('--gog-textarea-resize-inset-bottom')).toBe('20px');
    });

    it('never reports a negative inset if the field briefly measures larger than its container', async () => {
      const freshFixture = TestBed.createComponent(TextareaComponent);
      await freshFixture.whenStable();
      freshFixture.detectChanges();

      const field = freshFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const container = field.parentElement as HTMLElement;
      const observer = MockResizeObserver.instances.find((o) => o.observed.includes(field));

      mockSize(container, { clientWidth: 300, clientHeight: 100 });
      mockSize(field, { offsetWidth: 320, offsetHeight: 110 });
      observer!.callback([], observer as unknown as ResizeObserver);
      freshFixture.detectChanges();

      expect(freshFixture.componentInstance['resizeInsetRight']()).toBe(0);
      expect(freshFixture.componentInstance['resizeInsetBottom']()).toBe(0);
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

  describe('generated id', () => {
    it('labels the field with a generated id when inputId is not supplied', async () => {
      fixture.componentRef.setInput('label', 'Bio');
      await fixture.whenStable();

      const field = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

      expect(field.id).toMatch(/^gog-textarea-\d+$/);
      expect(label.getAttribute('for')).toBe(field.id);
    });

    it('points aria-describedby at the rendered error, with no inputId set', async () => {
      fixture.componentRef.setInput('errorMessage', 'Too short');
      await fixture.whenStable();

      const field = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      const error = fixture.nativeElement.querySelector('.gog-input__error') as HTMLElement;

      expect(error.id).toBe(field.id + '-error');
      expect(field.getAttribute('aria-describedby')).toBe(error.id);
    });
  });

  describe('native attributes', () => {
    it('forwards readonly, maxlength, minlength and spellcheck', async () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('maxlength', 500);
      fixture.componentRef.setInput('minlength', 10);
      fixture.componentRef.setInput('spellcheck', false);
      await fixture.whenStable();

      const field = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(field.readOnly).toBe(true);
      expect(field.getAttribute('maxlength')).toBe('500');
      expect(field.getAttribute('minlength')).toBe('10');
      expect(field.getAttribute('spellcheck')).toBe('false');
    });

    it('leaves them off by default', async () => {
      await fixture.whenStable();

      const field = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(field.readOnly).toBe(false);
      expect(field.getAttribute('maxlength')).toBeNull();
      expect(field.getAttribute('minlength')).toBeNull();
      expect(field.getAttribute('spellcheck')).toBeNull();
    });

    it('hides the clear button while readonly', async () => {
      fixture.componentRef.setInput('clearable', true);
      fixture.componentRef.setInput('value', 'text');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-textarea__clear')).toBeTruthy();

      fixture.componentRef.setInput('readonly', true);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-textarea__clear')).toBeNull();
    });
  });
});
