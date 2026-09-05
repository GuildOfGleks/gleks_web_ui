import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { GogSize, GogSpinnerVariant } from '../../../shared/types';
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
  readonly loading = input(false);
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
}
