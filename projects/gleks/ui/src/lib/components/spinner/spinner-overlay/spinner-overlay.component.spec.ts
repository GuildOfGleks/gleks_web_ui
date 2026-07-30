import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerOverlayComponent } from './spinner-overlay.component';

describe('SpinnerOverlayComponent', () => {
  let component: SpinnerOverlayComponent;
  let fixture: ComponentFixture<SpinnerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerOverlayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the overlay when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__scrim')).toBeTruthy();
  });

  it('should not render the overlay scrim when not loading', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__scrim')).toBeNull();
  });

  it('should set aria-busy to true only while loading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBeNull();

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-busy')).toBeNull();
  });

  it('should always project the wrapped content regardless of loading state', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner-overlay__content')).toBeTruthy();
  });
});
