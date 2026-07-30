import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to a single text line', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--text');
    expect(fixture.nativeElement.querySelectorAll('.gog-skeleton__line').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.gog-skeleton__line--short')).toBeNull();
  });

  it('should render the requested number of text lines and shorten the last one', () => {
    fixture.componentRef.setInput('lines', 3);
    fixture.detectChanges();

    const lines = fixture.nativeElement.querySelectorAll('.gog-skeleton__line');
    expect(lines.length).toBe(3);
    expect(lines[2].classList).toContain('gog-skeleton__line--short');
    expect(lines[0].classList).not.toContain('gog-skeleton__line--short');
  });

  it('should render a single shape bone for the circle variant', () => {
    fixture.componentRef.setInput('shape', 'circle');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--circle');
    expect(fixture.nativeElement.querySelectorAll('.gog-skeleton__shape').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.gog-skeleton__line')).toBeNull();
  });

  it('should render a single shape bone for the rect variant', () => {
    fixture.componentRef.setInput('shape', 'rect');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--rect');
    expect(fixture.nativeElement.querySelectorAll('.gog-skeleton__shape').length).toBe(1);
  });

  it('should apply the size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--lg');
  });

  it('should apply the animation class', () => {
    fixture.componentRef.setInput('animation', 'wave');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--wave');
  });

  it('should default to the pulse animation', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--pulse');
  });

  it('should apply the square modifier when rounded is disabled', () => {
    fixture.componentRef.setInput('rounded', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('gog-skeleton--square');
  });

  it('should set the inline width style', () => {
    fixture.componentRef.setInput('width', '240px');
    fixture.detectChanges();

    expect(fixture.nativeElement.style.width).toBe('240px');
  });

  it('should mirror width into height for a circle so it stays round', () => {
    fixture.componentRef.setInput('shape', 'circle');
    fixture.componentRef.setInput('width', '80px');
    fixture.detectChanges();

    expect(fixture.nativeElement.style.width).toBe('80px');
    expect(fixture.nativeElement.style.height).toBe('80px');
  });

  it('should not apply an inline height for text, since lines size themselves', () => {
    fixture.componentRef.setInput('height', '999px');
    fixture.detectChanges();

    expect(fixture.nativeElement.style.height).toBe('');
  });

  it('should be aria-hidden and have no status role by default', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.getAttribute('role')).toBeNull();
  });

  it('should expose a status role and aria-label when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Loading profile');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('role')).toBe('status');
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Loading profile');
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBeNull();
  });
});
