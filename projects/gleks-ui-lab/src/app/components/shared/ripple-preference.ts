import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Provider, Signal, inject, signal } from '@angular/core';
import { GOG_CONFIG, GogGlobalConfig } from '@guildofgleks/ui';

const STORAGE_KEY = 'gog-lab-ripple';

/**
 * Whether this site runs with the press ripple on — the header's ripple toggle, and the only
 * `GOG_CONFIG` value on the site the reader can change.
 *
 * It exists because the site's answer to "what does the library feel like?" is different with the
 * ripple than without it, and the ripple is **off** in a fresh app. A reader deciding whether they
 * want it needs to see both, and the honest way to show the off state is to actually run the site
 * in it rather than to describe it.
 *
 * The choice is remembered per browser, so it survives a reload. The server always renders with
 * the ripple on: the ripple adds no server-rendered markup either way (its host class and layer
 * are created by a browser-only effect), so there is nothing for a stored `false` to mismatch
 * during hydration.
 */
@Injectable({ providedIn: 'root' })
export class RipplePreference {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal(this.readStored() ?? true);

  /** Read-only: go through `toggle`/`set`, which also persist. */
  readonly enabled: Signal<boolean> = this.state.asReadonly();

  toggle(): void {
    this.set(!this.state());
  }

  set(enabled: boolean): void {
    this.state.set(enabled);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Private mode, or storage disabled entirely. The choice still applies for this session.
    }
  }

  private readStored(): boolean | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? null : stored === 'true';
    } catch {
      return null;
    }
  }
}

/**
 * `GOG_CONFIG` for this site: everything the library reads app-wide, with `ripple.enabled`
 * wired to {@link RipplePreference} so the header toggle actually reaches the components.
 *
 * **`enabled` is a getter on purpose, and the whole toggle depends on it.** Every component
 * resolves its ripple through `computed(() => resolveConfigured(input(), config.ripple?.enabled,
 * false))`, and `bindRipple` runs an `effect` on the result that attaches or detaches the press
 * listeners. A plain `true` would be read once and cached by that computed forever — the config
 * object is not a signal, so nothing would ever invalidate it. Reading the signal *inside* the
 * getter means the read happens in the computed's own reactive context, which is what makes the
 * computed depend on it and the effect re-run.
 *
 * **And it is `{ provide: GOG_CONFIG }` rather than `provideGogConfig(...)` for the same reason.**
 * That helper merges its argument into any config inherited from an outer injector, and the merge
 * spreads nested objects (`{ ...base.ripple, ...override.ripple }`) — which reads a getter once
 * and stores its value, freezing the toggle. Nothing on this site provides an outer `ripple`, so
 * the object happens to pass through untouched today; depending on that is depending on how the
 * merge is implemented. An app that sets a static value has no such problem and should call
 * `provideGogConfig` — that is what every code sample on this site shows, and this is site
 * plumbing, not an example to copy.
 */
export function provideLabGogConfig(): Provider {
  return {
    provide: GOG_CONFIG,
    useFactory: (): GogGlobalConfig => {
      const ripple = inject(RipplePreference);
      return {
        ripple: {
          get enabled(): boolean {
            return ripple.enabled();
          },
        },
      };
    },
  };
}
