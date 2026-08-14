import { Component, Injector, runInInjectionContext } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { IconComponent } from './icon.component';
import { GOG_ICONS, provideGogIcons } from '../../shared/icon-registry';

const CART = '<svg viewBox="0 0 24 24" data-icon="cart"><path d="M1 1" /></svg>';
const STAR = '<svg viewBox="0 0 24 24" data-icon="star"><path d="M2 2" /></svg>';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  const svg = () => fixture.nativeElement.querySelector('svg') as SVGElement | null;

  async function create(providers: unknown[] = []) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: providers as never[],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    return fixture;
  }

  beforeEach(async () => {
    await create();
    await fixture.whenStable();
  });

  it('renders a built-in icon', async () => {
    fixture.componentRef.setInput('name', 'check');
    await fixture.whenStable();

    expect(svg()).toBeTruthy();
    expect(svg()?.querySelector('path')).toBeTruthy();
  });

  describe('registry', () => {
    it('renders an icon registered through provideGogIcons', async () => {
      await create([provideGogIcons({ cart: CART })]);
      fixture.componentRef.setInput('name', 'cart');
      await fixture.whenStable();

      expect(svg()?.getAttribute('data-icon')).toBe('cart');
    });

    it('lets a registered name override a built-in of the same name', async () => {
      await create([provideGogIcons({ check: STAR })]);
      fixture.componentRef.setInput('name', 'check');
      await fixture.whenStable();

      expect(svg()?.getAttribute('data-icon')).toBe('star');
    });

    it('keeps the built-ins available alongside registered ones', async () => {
      await create([provideGogIcons({ cart: CART })]);
      fixture.componentRef.setInput('name', 'close');
      await fixture.whenStable();

      expect(svg()).toBeTruthy();
      expect(svg()?.getAttribute('data-icon')).toBeNull();
    });

    it('merges a nested registration onto the parent set instead of replacing it', () => {
      // The same layering `provideGogConfig` does: a lazy feature registers what only it needs
      // and the app-wide set stays reachable inside it.
      const parent = Injector.create({ providers: [provideGogIcons({ cart: CART })] as never[] });
      const child = Injector.create({
        parent,
        providers: [provideGogIcons({ star: STAR })] as never[],
      });

      const icons = runInInjectionContext(child, () => child.get(GOG_ICONS));

      expect(icons['star']).toBe(STAR);
      expect(icons['cart']).toBe(CART);
    });
  });

  describe('unknown name', () => {
    it('renders nothing and does not throw', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      fixture.componentRef.setInput('name', 'definitely-not-an-icon');

      await expect(fixture.whenStable()).resolves.not.toThrow();
      expect(svg()).toBeNull();

      warn.mockRestore();
    });

    it('warns once per name, not once per instance', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const name = `missing-${Math.random().toString(36).slice(2)}`;

      fixture.componentRef.setInput('name', name);
      await fixture.whenStable();

      const second = TestBed.createComponent(IconComponent);
      second.componentRef.setInput('name', name);
      await second.whenStable();

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain(name);
      warn.mockRestore();
    });
  });

  describe('template input', () => {
    /** The per-instance escape hatch, kept for one-offs — see `provideGogIcons`'s doc comment. */
    @Component({
      imports: [IconComponent],
      template: `
        <ng-template #custom><span class="from-template">x</span></ng-template>
        <gog-icon name="check" [template]="custom" />
      `,
    })
    class TemplateHost {}

    it('wins over the name', async () => {
      const host = TestBed.createComponent(TemplateHost);
      await host.whenStable();
      host.detectChanges();

      expect(host.nativeElement.querySelector('.from-template')).toBeTruthy();
      expect(host.nativeElement.querySelector('svg')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('is aria-hidden by default, since an icon usually repeats its label', async () => {
      await fixture.whenStable();

      expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
      expect(fixture.nativeElement.getAttribute('aria-label')).toBeNull();
    });

    it('exposes a name once ariaHidden is off', async () => {
      fixture.componentRef.setInput('ariaHidden', false);
      fixture.componentRef.setInput('name', 'check');
      fixture.componentRef.setInput('title', 'Done');
      await fixture.whenStable();

      expect(fixture.nativeElement.getAttribute('aria-hidden')).toBeNull();
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Done');
    });

    it('falls back to the icon name when no title is given', async () => {
      fixture.componentRef.setInput('ariaHidden', false);
      fixture.componentRef.setInput('name', 'check');
      await fixture.whenStable();

      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('check');
    });
  });
});
