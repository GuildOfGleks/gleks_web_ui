import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
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

  it('should update value from the range input', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe(42);
  });

  it('should support fractional steps', () => {
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 1);
    fixture.componentRef.setInput('step', 0.25);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '0.75';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe(0.75);
  });

  it('should hide the thumb when requested', () => {
    fixture.componentRef.setInput('showThumb', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-slider__thumb')).toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('.gog-slider')
        ?.classList.contains('gog-slider--thumb-hidden'),
    ).toBe(true);
  });

  describe('clamping', () => {
    it('clamps writeValue (CVA) to the min/max range', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 10);
      fixture.detectChanges();

      component.writeValue(999);
      fixture.detectChanges();
      expect(component.value()).toBe(10);

      component.writeValue(-999);
      fixture.detectChanges();
      expect(component.value()).toBe(0);
    });

    it('falls back to min when writeValue receives null/undefined', () => {
      fixture.componentRef.setInput('min', 5);
      fixture.componentRef.setInput('max', 10);
      fixture.detectChanges();

      component.writeValue(null as unknown as number);
      fixture.detectChanges();
      expect(component.value()).toBe(5);
    });

    it('clamps values typed directly into the native range input', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 10);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '25';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.value()).toBe(10);
    });
  });

  describe('disabled', () => {
    it('disables the native range input via the disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('disables the native range input via CVA setDisabledState', () => {
      fixture.detectChanges();
      component.setDisabledState(true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('errorMessage', () => {
    it('shows the error exactly as long as the consumer sets errorMessage, independent of the value', () => {
      fixture.componentRef.setInput('errorMessage', 'Out of range');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-slider__error')?.textContent).toContain(
        'Out of range',
      );

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '50';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-slider__error')).toBeTruthy();

      fixture.componentRef.setInput('errorMessage', '');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gog-slider__error')).toBeNull();
    });
  });

  describe('ControlValueAccessor / Reactive Forms integration', () => {
    @Component({
      imports: [SliderComponent, ReactiveFormsModule],
      template: `<gog-slider
        [formControl]="control"
        [min]="0"
        [max]="10"
        errorMessage="Out of range"
      />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SliderFormHostComponent {
      readonly control = new FormControl(0, { nonNullable: true, validators: Validators.min(1) });
    }

    it('propagates input changes to the FormControl value', async () => {
      const hostFixture = TestBed.createComponent(SliderFormHostComponent);
      const host = hostFixture.componentInstance;
      await hostFixture.whenStable();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '5';
      input.dispatchEvent(new Event('input'));
      await hostFixture.whenStable();

      expect(host.control.value).toBe(5);
    });

    it('defaults to manual, showing the error immediately despite an untouched FormControl', async () => {
      const hostFixture = TestBed.createComponent(SliderFormHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.control.touched).toBe(false);
      expect(hostFixture.nativeElement.querySelector('.gog-slider__error')?.textContent).toContain(
        'Out of range',
      );
    });

    it('withholds the error until touched when errorDisplay is auto', async () => {
      @Component({
        imports: [SliderComponent, ReactiveFormsModule],
        template: `
          <gog-slider
            [formControl]="control"
            [min]="0"
            [max]="10"
            errorMessage="Out of range"
            errorDisplay="auto"
          />
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class AutoErrorDisplayHostComponent {
        readonly control = new FormControl(0, { nonNullable: true, validators: Validators.min(1) });
      }

      const hostFixture = TestBed.createComponent(AutoErrorDisplayHostComponent);
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-slider__error')).toBeNull();

      const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur'));
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('.gog-slider__error')?.textContent).toContain(
        'Out of range',
      );
    });
  });
});
