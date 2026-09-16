import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'showcase-settings';

interface StoredSettings {
  rtl?: boolean;
  hitAreas?: boolean;
  ripple?: boolean;
}

/**
 * The shell's toolbar switches, persisted per browser. The server always renders the defaults.
 */
@Injectable({ providedIn: 'root' })
export class ShowcaseSettings {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly stored = this.read();

  /** `dir="rtl"` on `<html>`. */
  readonly rtl = signal(this.stored.rtl ?? false);

  /** Paints the transparent `::before` targets that bring small controls to 24x24 (WCAG 2.5.8). */
  readonly hitAreas = signal(this.stored.hitAreas ?? false);

  /**
   * `GOG_CONFIG.ripple.enabled`. The library reads config once, as a consumer's bootstrap sets it,
   * so this value applies at the next load; `setRipple` reloads.
   */
  readonly ripple = this.stored.ripple ?? false;

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('dir', this.rtl() ? 'rtl' : 'ltr');
      this.document.body.classList.toggle('app-show-hit-areas', this.hitAreas());
      this.write({ rtl: this.rtl(), hitAreas: this.hitAreas(), ripple: this.ripple });
    });
  }

  setRipple(enabled: boolean): void {
    if (enabled === this.ripple) return;
    this.write({ rtl: this.rtl(), hitAreas: this.hitAreas(), ripple: enabled });
    this.document.location.reload();
  }

  private read(): StoredSettings {
    if (!this.isBrowser) return {};
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredSettings;
    } catch {
      return {};
    }
  }

  private write(settings: StoredSettings): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage blocked: the switch still works for this page load.
    }
  }
}
