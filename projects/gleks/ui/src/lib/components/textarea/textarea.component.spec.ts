import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextareaComponent } from './textarea.component';

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
});
