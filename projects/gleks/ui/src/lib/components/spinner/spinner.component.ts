import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { GOG_CONFIG, resolveConfigured } from '../../shared/config';
import { GogSize, GogSpinnerVariant } from '../../shared/types';

/** The built-in look, when neither the instance nor the app asks for anything else. */
const DEFAULT_VARIANT: GogSpinnerVariant = 'runic';

@Component({
  selector: 'gog-spinner',
  imports: [NgComponentOutlet, NgTemplateOutlet],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-inline-center',
  },
})
export class SpinnerComponent {
  private readonly globalConfig = inject(GOG_CONFIG);

  readonly size = input<GogSize>('md');
  /**
   * Covers the viewport with a backdrop while it spins.
   *
   * "The viewport" holds only while no ancestor establishes a containing block: `contain`,
   * `transform`, `filter`, `backdrop-filter` or `will-change` on anything above it retargets
   * the overlay to that element's box instead — including `gog-scroll`, which sets
   * `contain: layout style`. Render it from your app's root, or expect it to cover the
   * contained ancestor. See README's "Overlays and the viewport".
   */
  readonly overlay = input(false);
  readonly ariaLabel = input('Loading');
  /**
   * `runic` and `ring` are built-in presets. Use `custom` to render your own
   * markup via content projection — it inherits the size wrapper, overlay
   * behaviour, and `--gog-spinner-color` theming, but the visuals are yours.
   *
   * Unset, falls back to `GOG_CONFIG.spinner.component` (rendered in place of the preset), then
   * to `GOG_CONFIG.spinner.variant`, then to `runic`.
   */
  readonly variant = input<GogSpinnerVariant | undefined>(undefined);

  /**
   * The app-wide component, and only when this instance has asked for nothing specific. An
   * explicit `variant` is a decision about *this* spinner and outranks a default set elsewhere —
   * which is also what keeps `variant="custom"` projecting the caller's own content.
   */
  protected readonly configComponent = computed(() =>
    this.variant() === undefined ? (this.globalConfig.spinner?.component ?? null) : null,
  );

  protected readonly resolvedVariant = computed(() =>
    resolveConfigured(this.variant(), this.globalConfig.spinner?.variant, DEFAULT_VARIANT),
  );
}
