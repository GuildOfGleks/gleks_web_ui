import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { StepperComponent, type GogStep, ButtonComponent, ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, StepperComponent, ToggleComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperFlowExample {
  private readonly initial: readonly GogStep[] = [
    { label: 'Account' },
    { label: 'Address' },
    { label: 'Payment' },
    { label: 'Review' },
  ];
  protected readonly steps = signal<readonly GogStep[]>(this.initial);
  protected readonly active = signal(0);
  protected readonly linear = signal(true);

  /** The app owns the data: marking a step complete is what opens the way forward. */
  protected complete(): void {
    const index = this.active();
    this.steps.update((steps) =>
      steps.map((step, i) => (i === index ? { ...step, state: 'complete' as const } : step)),
    );
    this.active.set(Math.min(index + 1, this.steps().length - 1));
  }

  protected reset(): void {
    this.steps.set(this.initial);
    this.active.set(0);
  }
}
