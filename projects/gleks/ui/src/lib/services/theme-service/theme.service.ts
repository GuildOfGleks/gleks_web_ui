import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, Signal, inject, signal } from '@angular/core';

import { GOG_CONFIG } from '../../shared/config';

/** Built-in defaults, used when `GOG_CONFIG.theme` doesn't supply one. */
const DEFAULT_THEME = 'light';
const DEFAULT_LIGHT_THEME = 'light';
const DEFAULT_DARK_THEME = 'dark';

/**
 * Owns the `data-theme` attribute on `<html>`, which is what every `--gog-*` palette block in
 * `theme.css` keys off.
 *
 * Zero-config behaviour is unchanged from 21.3.1: it adopts whatever `data-theme` is already on
 * the document, or `'light'` if there is none. Persistence and following the OS setting are
 * both **opt-in** through `GOG_CONFIG.theme`, so an app that never configures anything cannot
 * have its theme changed out from under it by an upgrade.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly root = this.document.documentElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(GOG_CONFIG).theme ?? {};

  private readonly state = signal(DEFAULT_THEME);

  /**
   * The active theme name. Read-only on purpose: writing it directly would move the signal
   * without touching the DOM attribute the styles actually read, leaving the two silently out
   * of sync. Go through `setTheme`/`toggleTheme`.
   */
  readonly theme: Signal<string> = this.state.asReadonly();

  /**
   * Set once the app (or the user) has chosen a theme explicitly, which stops
   * `followSystem` from overriding that choice on the next OS-level change.
   */
  private hasExplicitChoice = false;

  constructor() {
    this.state.set(this.resolveInitialTheme());
    this.applyTheme(this.state());
    this.watchSystemPreference();
  }

  setTheme(theme: string): void {
    this.hasExplicitChoice = true;
    this.state.set(theme);
    this.applyTheme(theme);
    this.persist(theme);
  }

  /**
   * Flips between the configured light and dark theme names (`'light'`/`'dark'` by default).
   * From a third, custom theme this lands on the dark one, since that is the only reading of
   * "toggle" that terminates.
   */
  toggleTheme(): void {
    const light = this.config.lightTheme ?? DEFAULT_LIGHT_THEME;
    const dark = this.config.darkTheme ?? DEFAULT_DARK_THEME;
    this.setTheme(this.state() === dark ? light : dark);
  }

  /**
   * In precedence order:
   *
   * 1. a `data-theme` already on `<html>` — server-rendered or set by an inline script before
   *    Angular booted, and either way a decision that has already been painted;
   * 2. the persisted choice, when `storageKey` is configured;
   * 3. the OS setting, when `followSystem` is on;
   * 4. `defaultTheme`, then `'light'`.
   */
  private resolveInitialTheme(): string {
    const fromDocument = this.root.getAttribute('data-theme');
    if (fromDocument) return fromDocument;

    const stored = this.readStored();
    if (stored) return stored;

    if (this.config.followSystem && this.prefersDark()) {
      return this.config.darkTheme ?? DEFAULT_DARK_THEME;
    }

    return this.config.defaultTheme ?? DEFAULT_THEME;
  }

  /**
   * Keeps the theme in step with the OS while the app has no explicit choice of its own. Only
   * wired up when `followSystem` is on, so the default configuration adds no listener at all.
   */
  private watchSystemPreference(): void {
    if (!this.isBrowser || !this.config.followSystem) return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      if (this.hasExplicitChoice) return;
      const next = event.matches
        ? (this.config.darkTheme ?? DEFAULT_DARK_THEME)
        : (this.config.lightTheme ?? DEFAULT_LIGHT_THEME);
      this.state.set(next);
      this.applyTheme(next);
    };

    query.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
  }

  private prefersDark(): boolean {
    return this.isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Storage access is wrapped because it throws rather than degrades in two ordinary cases:
   * Safari's private mode, and a browser configured to block site data. A theme preference is
   * not worth taking the app down for.
   */
  private readStored(): string | null {
    const key = this.config.storageKey;
    if (!key || !this.isBrowser) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private persist(theme: string): void {
    const key = this.config.storageKey;
    if (!key || !this.isBrowser) return;
    try {
      window.localStorage.setItem(key, theme);
    } catch {
      // See readStored.
    }
  }

  private applyTheme(theme: string): void {
    this.root.setAttribute('data-theme', theme);
  }
}
