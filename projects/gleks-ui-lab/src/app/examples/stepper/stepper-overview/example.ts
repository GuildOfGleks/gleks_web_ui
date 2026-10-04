import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { StepperComponent, type GogStep } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [StepperComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperOverviewExample {
  protected readonly steps: readonly GogStep[] = [
    { label: 'Account', state: 'complete' },
    { label: 'Address', state: 'complete' },
    { label: 'Payment' },
    { label: 'Review' },
  ];
  protected readonly active = signal(2);
}
