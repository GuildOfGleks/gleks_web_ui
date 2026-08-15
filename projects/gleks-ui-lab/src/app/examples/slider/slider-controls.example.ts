import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />
    <gog-slider label="Brightness" [min]="0" [max]="100" [step]="10" [(value)]="brightness" />
    <gog-slider label="Precision" [min]="0" [max]="1" [step]="0.01" [(value)]="precision" />
    <gog-slider
      label="Range only"
      [min]="0"
      [max]="100"
      [step]="1"
      [showThumb]="false"
      [value]="35"
    />
    <gog-slider label="Disabled" [value]="25" [disabled]="true" [showThumb]="false" />
    <gog-slider label="Disabled (with thumb)" [value]="60" [disabled]="true" />
  `,
})
export class SliderControlsExample {
  protected readonly volume = signal(45);
  protected readonly brightness = signal(70);
  protected readonly precision = signal(0.45);
}
