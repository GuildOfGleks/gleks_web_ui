import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `<gog-slider
    label="Compact"
    [min]="0"
    [max]="100"
    [(value)]="compactValue"
    [fullWidth]="false"
  />`,
})
export class SliderFullWidthExample {
  protected readonly compactValue = signal(40);
}
