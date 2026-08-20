import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';
import { GOG_CONFIG, GogGlobalConfig } from '../../shared/config';

/** A fresh injector per case, so each one sees the service's constructor-time resolution. */
function createService(config: GogGlobalConfig = {}): ThemeService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: GOG_CONFIG, useValue: config }],
  });
  return TestBed.inject(ThemeService);
}

describe('ThemeService', () => {
  const storageKey = 'gog-theme-spec';

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.removeItem(storageKey);
  });

  // This spec writes to the real `document.documentElement`, which every other spec file in
  // the same worker shares. Leaving a theme on it is invisible here and fails somebody else.
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.removeItem(storageKey);
  });

  it('should initialize and switch themes', () => {
    const service = createService();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.setTheme('dark');

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    service.toggleTheme();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('adopts a data-theme that is already on the document', () => {
    document.documentElement.setAttribute('data-theme', 'cyberpunk');

    expect(createService().theme()).toBe('cyberpunk');
  });

  describe('persistence', () => {
    it('does not touch storage unless a storageKey is configured', () => {
      createService().setTheme('dark');

      expect(window.localStorage.getItem(storageKey)).toBeNull();
    });

    it('stores the chosen theme and reads it back on the next construction', () => {
      createService({ theme: { storageKey } }).setTheme('dark');
      expect(window.localStorage.getItem(storageKey)).toBe('dark');

      document.documentElement.removeAttribute('data-theme');

      expect(createService({ theme: { storageKey } }).theme()).toBe('dark');
    });

    it('lets an existing data-theme outrank the stored value', () => {
      window.localStorage.setItem(storageKey, 'dark');
      document.documentElement.setAttribute('data-theme', 'light');

      expect(createService({ theme: { storageKey } }).theme()).toBe('light');
    });
  });

  describe('followSystem', () => {
    it('ignores the OS setting unless asked to follow it', () => {
      matchMediaReturning(true);

      expect(createService().theme()).toBe('light');
    });

    it('opens in the dark theme when the OS prefers dark', () => {
      matchMediaReturning(true);

      expect(createService({ theme: { followSystem: true } }).theme()).toBe('dark');
    });

    it('opens in the light theme when the OS does not', () => {
      matchMediaReturning(false);

      expect(createService({ theme: { followSystem: true } }).theme()).toBe('light');
    });

    it('honours custom light/dark theme names', () => {
      matchMediaReturning(true);

      const service = createService({
        theme: { followSystem: true, darkTheme: 'midnight', lightTheme: 'paper' },
      });

      expect(service.theme()).toBe('midnight');
      service.toggleTheme();
      expect(service.theme()).toBe('paper');
    });
  });

  it('exposes theme as a read-only signal', () => {
    const service = createService();

    expect('set' in service.theme).toBe(false);
    expect('update' in service.theme).toBe(false);
  });
});

/**
 * jsdom implements `matchMedia` but always reports `matches: false`, so preference-driven paths
 * are unreachable without this. Restored by vitest between files, not between cases — each call
 * replaces the previous stub.
 */
function matchMediaReturning(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
