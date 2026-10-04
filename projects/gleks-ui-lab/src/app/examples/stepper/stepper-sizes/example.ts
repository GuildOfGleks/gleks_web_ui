import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepperComponent, type GogStep, type GogSize } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [StepperComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperSizesExample {
  protected readonly sizes: readonly GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];
  protected readonly steps: readonly GogStep[] = [
    { label: 'Account', state: 'complete' },
    { label: 'Address' },
    { label: 'Review' },
  ];
}
