import { Component, signal } from '@angular/core';
import { GogSliderRange, SliderComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SliderComponent],
  template: `
    <gog-slider label="Budget" [range]="true" [(rangeValue)]="cappedRange" [startDisabled]="true" />
  `,
})
export class SliderOneSidedExample {
  // The floor is pinned at 0; only the ceiling moves. `disabled` would freeze both.
  protected readonly cappedRange = signal<GogSliderRange>({ start: 0, end: 60 });
}
