import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('should expose the configured size token', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--gog-checkbox-box-size')).toBe('32px');
  });

  it('should reserve padding around the checkbox box', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--gog-checkbox-padding')).toBe('6px');
  });

  it('should render the indeterminate state', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('mixed');
    expect(fixture.nativeElement.querySelector('.gog-checkbox__dash')).toBeTruthy();
  });
});
