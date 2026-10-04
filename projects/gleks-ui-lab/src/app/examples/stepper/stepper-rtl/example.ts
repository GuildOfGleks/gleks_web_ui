import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepperComponent, type GogStep } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [StepperComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperRtlExample {
  protected readonly steps: readonly GogStep[] = [
    { label: 'Account', state: 'complete' },
    { label: 'Address' },
    { label: 'Review' },
  ];
}
