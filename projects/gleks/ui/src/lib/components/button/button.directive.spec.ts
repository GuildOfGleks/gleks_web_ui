import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GogButtonDirective } from './button.directive';
import { GOG_CONFIG } from '../../shared/config';

@Component({
  imports: [GogButtonDirective],
  template: `
    <a
      id="link"
      gogButton
      [variant]="variant()"
      [severity]="severity()"
      [size]="size()"
      [fullWidth]="fullWidth()"
      href="/pricing"
      target="_blank"
      rel="noreferrer"
      >Pricing</a
    >
    <button id="btn" gogButton type="submit" [disabled]="disabled()">Save</button>
    <a id="bare" gogButton fullWidth href="/x">Bare attribute</a>
  `,
})
class Host {
  readonly variant = signal<'primary' | 'secondary' | 'outline' | 'ghost'>('primary');
  readonly severity = signal<'accent' | 'success' | 'danger' | 'warning' | 'info'>('accent');
  readonly size = signal<'xsm' | 'sm' | 'md' | 'lg' | 'slg' | undefined>(undefined);
  readonly fullWidth = signal(false);
  readonly disabled = signal(false);
}

describe('GogButtonDirective', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
  });

  it('applies the button block classes to the consumer’s own element', () => {
    const link = el('link');

    expect(link.tagName).toBe('A');
    expect(link.classList.contains('gog-btn')).toBe(true);
    expect(link.classList.contains('gog-inline-center')).toBe(true);
    expect(link.classList.contains('gog-contained-layout')).toBe(true);
  });

  it('leaves the element’s own attributes and semantics alone', () => {
    // The whole point of the directive over an `as="a"` input: nothing is brokered, so nothing
    // can be dropped. `href`/`target`/`rel` are the consumer's, untouched.
    const link = el('link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/pricing');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');

    const button = el('btn') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('submit');
  });

  it('keeps a native disabled button disabled', async () => {
    host.disabled.set(true);
    await settle();

    expect((el('btn') as HTMLButtonElement).disabled).toBe(true);
  });

  describe('variant', () => {
    it('defaults to primary', () => {
      expect(el('link').classList.contains('gog-btn--primary')).toBe(true);
    });

    it('swaps the class and drops the previous one', async () => {
      host.variant.set('ghost');
      await settle();

      expect(el('link').classList.contains('gog-btn--ghost')).toBe(true);
      expect(el('link').classList.contains('gog-btn--primary')).toBe(false);
    });
  });

  describe('size', () => {
    it('defaults to md', () => {
      expect(el('link').classList.contains('gog-btn--md')).toBe(true);
    });

    it('follows the instance input', async () => {
      host.size.set('lg');
      await settle();

      expect(el('link').classList.contains('gog-btn--lg')).toBe(true);
      expect(el('link').classList.contains('gog-btn--md')).toBe(false);
    });

    it('falls back to GOG_CONFIG.control.size', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Host],
        providers: [{ provide: GOG_CONFIG, useValue: { control: { size: 'sm' } } }],
      }).compileComponents();

      const configured = TestBed.createComponent(Host);
      configured.detectChanges();
      await configured.whenStable();
      configured.detectChanges();

      expect(
        (configured.nativeElement.querySelector('#link') as HTMLElement).classList.contains(
          'gog-btn--sm',
        ),
      ).toBe(true);
    });

    it('lets the instance input win over the configured size', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Host],
        providers: [{ provide: GOG_CONFIG, useValue: { control: { size: 'sm' } } }],
      }).compileComponents();

      const configured = TestBed.createComponent(Host);
      configured.componentInstance.size.set('slg');
      configured.detectChanges();
      await configured.whenStable();
      configured.detectChanges();

      const link = configured.nativeElement.querySelector('#link') as HTMLElement;
      expect(link.classList.contains('gog-btn--slg')).toBe(true);
      expect(link.classList.contains('gog-btn--sm')).toBe(false);
    });
  });

  describe('fullWidth', () => {
    it('is off by default', () => {
      expect(el('link').classList.contains('gog-btn--full-width')).toBe(false);
    });

    it('applies the class when bound', async () => {
      host.fullWidth.set(true);
      await settle();

      expect(el('link').classList.contains('gog-btn--full-width')).toBe(true);
    });

    it('accepts a bare attribute, with no binding syntax', () => {
      // `booleanAttribute`, so `<a gogButton fullWidth>` means true — the shape a consumer
      // reaches for first.
      expect(el('bare').classList.contains('gog-btn--full-width')).toBe(true);
    });
  });

  describe('severity', () => {
    it('emits nothing for accent, so an existing link is untouched', () => {
      expect(el('link').className).not.toMatch(/gog-btn--(accent|success|danger|warning|info)/);
    });

    it('adds the status class alongside the variant and size ones', async () => {
      host.severity.set('danger');
      host.variant.set('outline');
      await settle();

      const link = el('link');
      expect(link.classList.contains('gog-btn--danger')).toBe(true);
      expect(link.classList.contains('gog-btn--outline')).toBe(true);
      expect(link.classList.contains('gog-btn--md')).toBe(true);
    });

    it('removes it again on the way back to accent', async () => {
      host.severity.set('success');
      await settle();
      expect(el('link').classList.contains('gog-btn--success')).toBe(true);

      host.severity.set('accent');
      await settle();

      expect(el('link').classList.contains('gog-btn--success')).toBe(false);
    });
  });
});
