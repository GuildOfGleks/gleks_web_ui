import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle when the native input changes', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
  });

  // The host vars are deliberately `var(--control-checkbox-*, <default>)` rather than
  // resolved pixel values: that is what lets a consumer re-scale every checkbox in the
  // app by defining one app-level token, while still getting a sane size if they don't.
  it('should expose the configured size token', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--gog-checkbox-box-size')).toBe(
      'var(--control-checkbox-box-size-lg, 32px)',
    );
  });

  it('should reserve padding around the checkbox box', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--gog-checkbox-padding')).toBe(
      'var(--control-checkbox-padding, 6px)',
    );
  });

  describe('indeterminate', () => {
    it('should render the indeterminate state', () => {
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
      expect(input.getAttribute('aria-checked')).toBe('mixed');
      expect(fixture.nativeElement.querySelector('.gog-checkbox__dash')).toBeTruthy();
    });

    it('should prioritize the dash over the check icon when both checked and indeterminate are true', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.gog-checkbox__dash')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('gog-icon')).toBeNull();
    });

    it('should still report aria-checked="mixed" when checked is also true', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.getAttribute('aria-checked')).toBe('mixed');
    });
  });

  it('should keep the check icon hidden from assistive tech', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('gog-icon') as HTMLElement | null;
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  describe('accessible name', () => {
    it('should not set aria-label when a visible label is present', () => {
      fixture.componentRef.setInput('label', 'Remember me');
      fixture.componentRef.setInput('ariaLabel', 'Should be ignored');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.hasAttribute('aria-label')).toBe(false);
    });

    it('should fall back to ariaLabel when there is no visible label', () => {
      fixture.componentRef.setInput('ariaLabel', 'Select row');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.getAttribute('aria-label')).toBe('Select row');
    });
  });

  describe('disabled', () => {
    it('should render the native disabled attribute and apply the disabled visual class', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const label = fixture.nativeElement.querySelector('label') as HTMLElement;
      expect(input.disabled).toBe(true);
      expect(label.classList.contains('gog-checkbox--disabled')).toBe(true);
    });

    it('should not update checked() when a change event is dispatched while disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.checked()).toBe(false);
    });
  });

  describe('two-way [(checked)] binding', () => {
    // The bound state is a signal, not a plain field: under the zoneless test setup a
    // plain-field write never marks the host view dirty, so change detection only picks
    // it up in the dev-mode verification pass and throws NG0100.
    @Component({
      imports: [CheckboxComponent],
      template: ` <gog-checkbox [(checked)]="agreed" label="I agree" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class CheckboxHostComponent {
      readonly agreed = signal(false);
    }

    it('should propagate toggles back out to the bound signal', async () => {
      const hostFixture = TestBed.createComponent(CheckboxHostComponent);
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.agreed()).toBe(true);
    });

    it('should reflect external writes to the bound signal in the DOM', async () => {
      const hostFixture = TestBed.createComponent(CheckboxHostComponent);
      await hostFixture.whenStable();

      hostFixture.componentInstance.agreed.set(true);
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.checked).toBe(true);
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      standalone: true,
      imports: [CheckboxComponent, ReactiveFormsModule],
      template: ` <gog-checkbox [formControl]="control" label="Subscribe" />`,
    })
    class CheckboxFormHostComponent {
      control = new FormControl(false, { nonNullable: true });
    }

    let hostFixture: ComponentFixture<CheckboxFormHostComponent>;
    let host: CheckboxFormHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(CheckboxFormHostComponent);
      host = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should apply values written to the FormControl via writeValue', () => {
      host.control.setValue(true);
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.checked).toBe(true);
    });

    it('should propagate user toggles to the FormControl value', () => {
      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      hostFixture.detectChanges();

      expect(host.control.value).toBe(true);
    });

    it('should mark the FormControl as touched on blur', () => {
      expect(host.control.touched).toBe(false);

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      hostFixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });

    it('should disable the native input when the FormControl is disabled', () => {
      host.control.disable();
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should re-enable the native input when the FormControl is enabled again', () => {
      host.control.disable();
      hostFixture.detectChanges();
      host.control.enable();
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });

    it('should not propagate changes to the FormControl while it is disabled', () => {
      host.control.disable();
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      hostFixture.detectChanges();

      expect(host.control.value).toBe(false);
    });
  });
});
