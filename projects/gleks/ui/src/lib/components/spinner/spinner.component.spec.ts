import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';

@Component({
  imports: [SpinnerComponent],
  template: `<gog-spinner variant="custom"><div class="my-custom-loader"></div></gog-spinner>`,
})
class CustomSpinnerHostComponent {}

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent, CustomSpinnerHostComponent],
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

  it('should default to the runic variant', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.gog-spinner__ring')).toBeNull();
  });

  it('should render the ring variant instead of the svg when requested', () => {
    fixture.componentRef.setInput('variant', 'ring');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner__ring')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('should project custom content when variant is custom', async () => {
    const hostFixture = TestBed.createComponent(CustomSpinnerHostComponent);
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.querySelector('.my-custom-loader')).toBeTruthy();
    expect(hostFixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('should still size the wrapper around custom content', () => {
    fixture.componentRef.setInput('variant', 'custom');
    fixture.componentRef.setInput('size', 'xsm');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.gog-spinner__wrap--xsm')).toBeTruthy();
  });
});
