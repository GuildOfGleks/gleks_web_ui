import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the size class to the sizing wrapper', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner__wrap--lg')).toBeTruthy();
  });

  it('should default to the md size', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner__wrap--md')).toBeTruthy();
  });

  it('should keep the svg hidden from assistive tech', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
