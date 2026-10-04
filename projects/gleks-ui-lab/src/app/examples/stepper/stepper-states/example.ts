import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepperComponent, type GogStep } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [StepperComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperStatesExample {
  protected readonly steps: readonly GogStep[] = [
    { label: 'Account', description: 'Done', state: 'complete' },
    { label: 'Card', description: 'Declined', state: 'error' },
    { label: 'Address', description: 'Current' },
    { label: 'Newsletter', optional: true },
    { label: 'Gift wrap', disabled: true },
    { label: 'Review' },
  ];
}
