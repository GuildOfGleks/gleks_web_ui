import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepperComponent, type GogStep } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [StepperComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperNarrowExample {
  /** Six steps do not fit 14rem side by side; stacked, they fit any width. */
  protected readonly steps: readonly GogStep[] = [
    { label: 'Account', state: 'complete' },
    { label: 'Address' },
    { label: 'Shipping' },
    { label: 'Payment' },
    { label: 'Confirmation' },
    { label: 'Review' },
  ];
}
