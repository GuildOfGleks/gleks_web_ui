import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagComponent } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the info tag styling', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-tag')).toBe(true);
    expect(host.classList.contains('gog-tag--info')).toBe(true);
    expect(host.classList.contains('gog-tag--md')).toBe(true);
    expect(host.classList.contains('gog-tag--rounded')).toBe(true);
    expect(host.classList.contains('gog-tag--has-icon')).toBe(false);
  });

  it('should add the has-icon class only when an icon name or template is set', () => {
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('gog-tag--has-icon')).toBe(
      false,
    );

    fixture.componentRef.setInput('iconName', 'check');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('gog-tag--has-icon')).toBe(
      true,
    );
  });

  it('should map semantic variants to the matching classes', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-tag--success')).toBe(true);
  });

  it('should map sizes to their spacing tokens', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-tag--lg')).toBe(true);
  });

  it('should render an icon when one is provided', () => {
    fixture.componentRef.setInput('iconName', 'check');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('gog-icon') as HTMLElement | null;
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should support pill shape', () => {
    fixture.componentRef.setInput('shape', 'pill');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-tag--pill')).toBe(true);
  });
});
