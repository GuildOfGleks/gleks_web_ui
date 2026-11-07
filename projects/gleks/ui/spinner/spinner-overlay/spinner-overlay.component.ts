import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  untracked,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import { GogSize, GogSpinnerVariant } from '@guildofgleks/ui/shared';
import { SpinnerComponent } from '../spinner.component';

@Component({
  selector: 'gog-spinner-overlay',
  imports: [SpinnerComponent],
  templateUrl: './spinner-overlay.component.html',
  styleUrl: './spinner-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-spinner-overlay-host',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class SpinnerOverlayComponent {
  readonly loading = input(false, { transform: booleanAttribute });
  readonly size = input<GogSize>('md');
  readonly ariaLabel = input('Loading');
  /**
   * Forwarded to the spinner inside. **Unset rather than `'runic'` by default, deliberately:**
   * this value is bound straight onto that spinner's own `variant`, which is where
   * `GOG_CONFIG.spinner.component` and `spinner.variant` are read — and an instance that states a
   * variant outranks both, correctly. A default here would therefore state one on every overlay
   * ever rendered, and an app that had configured a house spinner would get the built-in look
   * from this component alone (fixed in 21.10.0).
   *
   * `size` and `ariaLabel` above keep their defaults for the opposite reason: neither has a
   * config key to fall through to, so "unset" would mean nothing there.
   */
  readonly variant = input<GogSpinnerVariant | undefined>(undefined);

  private readonly scrim = viewChild<ElementRef<HTMLElement>>('scrim');

  constructor() {
    const document = inject(DOCUMENT);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    /*
     * `inert` takes focus out of the content, and the browser drops it on <body> — which is where
     * a keyboard user who pressed "Refresh" inside the region would be left. So the focused element
     * is noted before the content turns inert, focus waits on the scrim while loading, and goes
     * back once the region is live again.
     */
    let returnTo: HTMLElement | null = null;
    effect(() => {
      if (!this.loading()) return;
      untracked(() => {
        const active = document.activeElement as HTMLElement | null;
        returnTo = active && active !== host && host.contains(active) ? active : null;
      });
    });
    afterRenderEffect(() => {
      const loading = this.loading();
      const scrim = this.scrim()?.nativeElement;
      if (loading) {
        if (returnTo && scrim) scrim.focus({ preventScroll: true });
        return;
      }
      const target = returnTo;
      returnTo = null;
      const lost = !document.activeElement || document.activeElement === document.body;
      if (target && lost && target.isConnected) target.focus({ preventScroll: true });
    });
  }
}
