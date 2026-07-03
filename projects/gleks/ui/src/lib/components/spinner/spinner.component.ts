import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GogSize } from '../../shared/types';

@Component({
  selector: 'gog-spinner',
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly size = input<GogSize>('md');
  readonly overlay = input(false);
  readonly ariaLabel = input('Loading');
}
