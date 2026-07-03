import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { GogSize } from '../../shared/types';

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
}
