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
});
