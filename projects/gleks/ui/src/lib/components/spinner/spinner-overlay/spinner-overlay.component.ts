import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { GogSize } from '../../../shared/types';
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
}
