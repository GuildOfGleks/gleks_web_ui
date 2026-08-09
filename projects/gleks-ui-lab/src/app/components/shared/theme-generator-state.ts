import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';

/**
 * Backs the theme generator's live editing: every `--gog-*` override the user has ever set this
 * session, applied straight onto `<html>` — which makes it visible everywhere on the site
 * (header, sidebar, every other doc page), not just inside the generator's own preview box, and
 * for as long as the tab stays open. Root-provided (not scoped to the generator page component)
 * so both halves of that are true: the override keeps painting the whole site after navigating
 * away from the generator, and coming back to the generator still shows what was set. Nothing is
 * persisted to storage — a real reload clears it, which is the point.
 */
@Injectable({ providedIn: 'root' })
export class ThemeGeneratorState {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly root = this.document.documentElement;

  private appliedNames = new Set<string>();

  readonly overrides = signal<Record<string, string>>({});
  private readonly defaults = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const overrides = this.overrides();
      const nextNames = new Set(Object.keys(overrides));

      for (const name of this.appliedNames) {
        if (!nextNames.has(name)) this.root.style.removeProperty(name);
      }
      for (const [name, value] of Object.entries(overrides)) {
        this.root.style.setProperty(name, value);
      }
      this.appliedNames = nextNames;
    });
  }

  /** Reads and caches each name's real default exactly once, before any override ever touches it. */
  captureDefaults(names: readonly string[]): void {
    if (!this.isBrowser) return;

    const existing = this.defaults();
    const missing = names.filter((name) => !(name in existing));
    if (missing.length === 0) return;

    const style = getComputedStyle(this.root);
    const additions: Record<string, string> = {};
    for (const name of missing) additions[name] = style.getPropertyValue(name).trim();
    this.defaults.update((current) => ({ ...current, ...additions }));
  }

  defaultOf(name: string): string {
    return this.defaults()[name] ?? '';
  }

  currentValue(name: string): string {
    return this.overrides()[name] ?? this.defaultOf(name);
  }

  set(name: string, value: string): void {
    this.overrides.update((current) => ({ ...current, [name]: value }));
  }

  reset(name: string): void {
    this.overrides.update((current) => {
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }

  resetAll(): void {
    this.overrides.set({});
  }
}
