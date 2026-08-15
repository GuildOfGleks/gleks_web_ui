import { Component, signal } from '@angular/core';
import { SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `<gog-slider label="Volume" [min]="0" [max]="100" [step]="5" [(value)]="volume" />`,
})
export class SliderOverviewExample {
  protected readonly volume = signal(45);
}
