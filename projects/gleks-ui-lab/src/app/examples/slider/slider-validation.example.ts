import { Component, computed, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider
      label="Monthly budget"
      [min]="0"
      [max]="100"
      [step]="5"
      [errorMessage]="budgetError()"
      [(value)]="budget"
    />
  `,
})
export class SliderValidationExample {
  protected readonly budget = signal(80);
  protected readonly budgetError = computed(() =>
    this.budget() > 70 ? 'Over the recommended budget for this tier.' : '',
  );
}
