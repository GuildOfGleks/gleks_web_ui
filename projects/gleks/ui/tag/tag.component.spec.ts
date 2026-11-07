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

  describe('fullWidth', () => {
    it('should apply the full-width host class so the stylesheet rules take effect', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(true);
    });

    it('should not apply the full-width host class by default', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('gog-host--full-width')).toBe(false);
    });
  });

  // The audit behind docs/hardening-21.5.0.md counted 9 tests against 6 inputs and a slot,
  // with one aria assertion: the variant/shape/size surface a consumer actually sets was
  // barely pinned. These are that surface.
  describe('the visual surface', () => {
    it('maps every variant onto its own host class', async () => {
      for (const variant of ['info', 'success', 'warning', 'danger', 'neutral'] as const) {
        fixture.componentRef.setInput('variant', variant);
        await fixture.whenStable();

        expect(fixture.nativeElement.className).toContain(`gog-tag--${variant}`);
      }
    });

    it('maps every size onto its own host class', async () => {
      for (const size of ['xsm', 'sm', 'md', 'lg', 'slg'] as const) {
        fixture.componentRef.setInput('size', size);
        await fixture.whenStable();

        expect(fixture.nativeElement.className).toContain(`gog-tag--${size}`);
      }
    });

    it('maps both shapes onto their own host class', async () => {
      for (const shape of ['rounded', 'pill'] as const) {
        fixture.componentRef.setInput('shape', shape);
        await fixture.whenStable();

        expect(fixture.nativeElement.className).toContain(`gog-tag--${shape}`);
      }
    });

    it('carries the shared full-width host class only when asked', async () => {
      expect(fixture.nativeElement.className).not.toContain('gog-host--full-width');

      fixture.componentRef.setInput('fullWidth', true);
      await fixture.whenStable();

      expect(fixture.nativeElement.className).toContain('gog-host--full-width');
    });

    it('renders no icon element at all without an icon name or slot', async () => {
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.gog-tag__icon')).toBeNull();
    });

    it('renders a decorative icon for an icon name', async () => {
      fixture.componentRef.setInput('iconName', 'check');
      await fixture.whenStable();

      const icon = fixture.nativeElement.querySelector('.gog-tag__icon') as HTMLElement;
      expect(icon).toBeTruthy();
      // A tag's icon repeats what the label says; announcing it would say everything twice.
      expect(
        icon.querySelector('[aria-hidden="true"]') ?? icon.closest('[aria-hidden="true"]'),
      ).toBeTruthy();
    });
  });
});
