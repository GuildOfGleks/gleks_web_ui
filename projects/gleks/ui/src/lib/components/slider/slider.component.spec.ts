import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    expect(fixture.nativeElement.querySelector('.gog-slider')?.classList.contains('gog-slider--thumb-hidden')).toBe(
      true,
    );
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
      expect(fixture.nativeElement.querySelector('.gog-slider__error')?.textContent).toContain('Out of range');

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
});
