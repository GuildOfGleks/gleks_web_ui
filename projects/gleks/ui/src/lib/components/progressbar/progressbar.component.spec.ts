import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarComponent } from './progressbar.component';

describe('ProgressbarComponent', () => {
  let component: ProgressbarComponent;
  let fixture: ComponentFixture<ProgressbarComponent>;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function fill(): HTMLElement {
    return host().querySelector('.gog-progressbar__fill')!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a determinate accent bar at zero', () => {
    expect(host().classList.contains('gog-progressbar--determinate')).toBe(true);
    expect(host().classList.contains('gog-progressbar--accent')).toBe(true);
    expect(host().classList.contains('gog-progressbar--md')).toBe(true);
    expect(host().getAttribute('aria-valuenow')).toBe('0');
  });

  it('should expose the ARIA progressbar contract', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();

    expect(host().getAttribute('role')).toBe('progressbar');
    expect(host().getAttribute('aria-valuemin')).toBe('0');
    expect(host().getAttribute('aria-valuemax')).toBe('100');
    expect(host().getAttribute('aria-valuenow')).toBe('42');
    expect(host().getAttribute('aria-valuetext')).toBe('42%');
  });

  it('should drive the fill width from the value', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();
    expect(fill().style.width).toBe('42%');
  });

  it('should clamp out-of-range values rather than overflow the track', () => {
    fixture.componentRef.setInput('value', 140);
    fixture.detectChanges();
    expect(fill().style.width).toBe('100%');
    expect(host().getAttribute('aria-valuenow')).toBe('100');

    fixture.componentRef.setInput('value', -20);
    fixture.detectChanges();
    expect(fill().style.width).toBe('0%');
    expect(host().getAttribute('aria-valuenow')).toBe('0');
  });

  it('should treat a non-finite value as zero', () => {
    fixture.componentRef.setInput('value', Number.NaN);
    fixture.detectChanges();
    expect(host().getAttribute('aria-valuenow')).toBe('0');
  });

  it('should report no value at all while indeterminate', () => {
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();

    // The *absence* of aria-valuenow is what marks it indeterminate to assistive tech.
    expect(host().getAttribute('aria-valuenow')).toBeNull();
    expect(host().getAttribute('aria-valuetext')).toBeNull();
    expect(host().classList.contains('gog-progressbar--indeterminate')).toBe(true);
  });

  it('should render the buffer level only in buffer mode', () => {
    expect(host().querySelector('.gog-progressbar__buffer')).toBeNull();

    fixture.componentRef.setInput('mode', 'buffer');
    fixture.componentRef.setInput('buffer', 70);
    fixture.detectChanges();

    const buffer = host().querySelector<HTMLElement>('.gog-progressbar__buffer');
    expect(buffer?.style.width).toBe('70%');
  });

  it('should clamp the buffer too', () => {
    fixture.componentRef.setInput('mode', 'buffer');
    fixture.componentRef.setInput('buffer', 300);
    fixture.detectChanges();

    expect(host().querySelector<HTMLElement>('.gog-progressbar__buffer')?.style.width).toBe('100%');
  });

  it('should show the rounded percentage when asked', () => {
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('value', 42.6);
    fixture.detectChanges();

    expect(host().querySelector('.gog-progressbar__value')?.textContent?.trim()).toBe('43%');
  });

  it('should not show a percentage while indeterminate, even if asked', () => {
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();

    expect(host().querySelector('.gog-progressbar__value')).toBeNull();
  });

  it('should map variant and size to their classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(host().classList.contains('gog-progressbar--danger')).toBe(true);
    expect(host().classList.contains('gog-progressbar--lg')).toBe(true);
    expect(host().classList.contains('gog-progressbar--accent')).toBe(false);
  });

  it('should pass the accessible name through', () => {
    fixture.componentRef.setInput('ariaLabel', 'Загрузка файла');
    fixture.detectChanges();

    expect(host().getAttribute('aria-label')).toBe('Загрузка файла');
  });
});
