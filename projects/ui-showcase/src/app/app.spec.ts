import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { UNITS } from './registry/units';
import { ShowcaseSettings } from './shell/showcase-settings';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the toolbar switches', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const bar = (fixture.nativeElement as HTMLElement).querySelector('.shell__bar');
    expect(bar?.querySelector('gog-select')).toBeTruthy();
    expect(bar?.querySelectorAll('gog-toggle')).toHaveLength(3);
  });

  it('lists every registry unit in the navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('.shell__nav');
    const names = Array.from(nav?.querySelectorAll('.shell__link') ?? []).map((link) =>
      link.textContent?.trim(),
    );
    for (const unit of UNITS) expect(names).toContain(unit.name);
  });

  it('sets dir on the document from the RTL switch', async () => {
    const fixture = TestBed.createComponent(App);
    const settings = TestBed.inject(ShowcaseSettings);
    settings.rtl.set(true);
    await fixture.whenStable();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    settings.rtl.set(false);
    await fixture.whenStable();
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
