import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider label="No value readout" [showValue]="false" [(value)]="hiddenValue" />
    <gog-slider ariaLabel="Opacity (no visible label)" [(value)]="ariaOnlyValue" />
  `,
})
export class SliderLabelingExample {
  protected readonly hiddenValue = signal(60);
  protected readonly ariaOnlyValue = signal(50);
}
