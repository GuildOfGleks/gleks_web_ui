import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { GogSize, GogSpinnerVariant } from '../../shared/types';

@Component({
  selector: 'gog-spinner',
  imports: [NgTemplateOutlet],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gog-inline-center',
  },
})
export class SpinnerComponent {
  readonly size = input<GogSize>('md');
  readonly overlay = input(false);
  readonly ariaLabel = input('Loading');
  /**
   * `runic` and `ring` are built-in presets. Use `custom` to render your own
   * markup via content projection — it inherits the size wrapper, overlay
   * behaviour, and `--gog-spinner-color` theming, but the visuals are yours.
   */
  readonly variant = input<GogSpinnerVariant>('runic');
}
